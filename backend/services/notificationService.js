import Notification from '../models/Notification.js';
import emailService from './emailService.js';

export const NOTIFICATION_TYPES = {
  NEW_MESSAGE: 'NEW_MESSAGE',
  NEW_OFFER: 'NEW_OFFER',
  LISTING_APPROVED: 'LISTING_APPROVED',
  LISTING_REJECTED: 'LISTING_REJECTED',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  PAYMENT_SENT: 'PAYMENT_SENT',
  NEW_REVIEW: 'NEW_REVIEW',
  LISTING_VIEWED: 'LISTING_VIEWED',
  LISTING_EXPIRED: 'LISTING_EXPIRED',
  KYC_APPROVED: 'KYC_APPROVED',
  KYC_REJECTED: 'KYC_REJECTED',
  SYSTEM_ANNOUNCEMENT: 'SYSTEM_ANNOUNCEMENT'
};

export class NotificationService {
  static async createNotification({ user, type, title, content, link, metadata = {}, options = { email: true, socket: true } }) {
    // 1. Enregistrement en base
    const notification = await Notification.create({
      userId: user.id,
      type,
      message: title,
      data: { content, link, ...metadata },
      isRead: false
    });

    // 2. Envoi d'email si activé
    if (options.email && user.email) {
      try {
        await emailService.sendNotificationEmail
          ? await emailService.sendNotificationEmail(user, type, title, { content, link, ...metadata })
          : await emailService.sendWelcomeEmail(user); // fallback générique
      } catch (err) {
        console.error('Erreur envoi email notification:', err);
      }
    }

    // 3. Envoi temps réel via Socket.IO si activé
    if (options.socket && global.io) {
      global.io.to(`user_${user.id}`).emit('new_notification', notification);
    }

    return notification;
  }

  static async createBulkNotifications(notifications) {
    const created = [];
    for (const notif of notifications) {
      created.push(await NotificationService.createNotification(notif));
    }
    return created;
  }

  static async markAsRead(notificationId, userId) {
    await Notification.update({ isRead: true }, { where: { id: notificationId, userId } });
  }

  static async markAllAsRead(userId) {
    await Notification.update({ isRead: true }, { where: { userId, isRead: false } });
  }

  static async deleteOldNotifications(daysOld = 30) {
    const cutoff = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    await Notification.destroy({ where: { createdAt: { $lt: cutoff } } });
  }
}
