import { supabase } from '../lib/supabase';

class NotificationService {
  constructor() {
    this.subscription = null;
  }

  // Recuperer les notifications d'un utilisateur
  async getUserNotifications(userId, filters = {}) {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (filters.type) query = query.eq('type', filters.type);
      if (filters.read !== undefined) query = query.eq('is_read', filters.read);
      if (filters.limit) query = query.limit(filters.limit);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur récupération notifications:', error);
      throw error;
    }
  }

  // Creer une notification
  async createNotification(notificationData) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          ...notificationData,
          is_read: false,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur création notification:', error);
      throw error;
    }
  }

  // Marquer comme lue
  async markAsRead(notificationId) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur marquage lu:', error);
      throw error;
    }
  }

  // Marquer toutes comme lues
  async markAllAsRead(userId) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_read', false)
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur marquage toutes lues:', error);
      throw error;
    }
  }

  // Compter les non lues
  async getUnreadCount(userId) {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Erreur comptage non lues:', error);
      throw error;
    }
  }

  // Notifications par type
  async createListingNotification(userId, listingId, type, metadata = {}) {
    const types = {
      'listing_approved': { title: 'Annonce approuvée', message: 'Votre annonce est maintenant visible', icon: 'check-circle', color: 'green' },
      'listing_rejected': { title: 'Annonce rejetée', message: 'Votre annonce a été rejetée', icon: 'x-circle', color: 'red' },
      'new_message': { title: 'Nouveau message', message: 'Message reçu sur votre annonce', icon: 'message-circle', color: 'blue' },
      'new_offer': { title: 'Nouvelle offre', message: 'Offre reçue pour votre annonce', icon: 'dollar-sign', color: 'green' }
    };

    const notificationData = types[type] || { title: 'Notification', message: 'Nouvelle notification', icon: 'bell', color: 'blue' };

    return this.createNotification({
      user_id: userId,
      type,
      title: notificationData.title,
      message: notificationData.message,
      icon: notificationData.icon,
      color: notificationData.color,
      metadata: { listing_id: listingId, ...metadata }
    });
  }

  // Temps reel
  subscribeToNotifications(userId, callback) {
    if (this.subscription) this.subscription.unsubscribe();

    this.subscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => callback(payload.new))
      .subscribe();
  }

  unsubscribeFromNotifications() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  // Statistiques
  async getNotificationStats(userId) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('type, is_read, created_at')
        .eq('user_id', userId);

      if (error) throw error;

      const stats = {
        total: data.length,
        unread: data.filter(n => !n.is_read).length,
        byType: {},
        byMonth: {}
      };

      data.forEach(n => {
        stats.byType[n.type] = (stats.byType[n.type] || 0) + 1;
        const month = new Date(n.created_at).toISOString().slice(0, 7);
        stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Erreur statistiques:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService(); 