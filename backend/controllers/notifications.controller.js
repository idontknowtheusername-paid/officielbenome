import Notification from '../models/Notification.js';

export const getAllNotifications = async (req, res) => {
  const notifications = await Notification.findAll();
  res.json({ success: true, data: notifications });
};

export const getNotificationById = async (req, res) => {
  const notification = await Notification.findByPk(req.params.id);
  if (!notification) return res.status(404).json({ success: false, error: { message: 'Notification not found' } });
  res.json({ success: true, data: notification });
};

export const markAsRead = async (req, res) => {
  const notification = await Notification.findByPk(req.params.id);
  if (!notification) return res.status(404).json({ success: false, error: { message: 'Notification not found' } });
  await notification.update({ isRead: true });
  res.json({ success: true, data: notification });
};

export const deleteNotification = async (req, res) => {
  const notification = await Notification.findByPk(req.params.id);
  if (!notification) return res.status(404).json({ success: false, error: { message: 'Notification not found' } });
  await notification.destroy();
  res.json({ success: true, message: 'Notification deleted' });
};
