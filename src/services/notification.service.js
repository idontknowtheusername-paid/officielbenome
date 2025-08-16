import { supabase } from '@/lib/supabase';

// ============================================================================
// SERVICE NOTIFICATIONS
// ============================================================================

export const notificationService = {
  // Recuperer les notifications d'un utilisateur
  getUserNotifications: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    const { data, error } = await supabase
        .from('notifications')
        .select('*')
      .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
  },

  // Marquer une notification comme lue
  markAsRead: async (notificationId) => {
      const { data, error } = await supabase
        .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
        .select()
        .single();

      if (error) throw error;
      return data;
  },

  // Creer une notification
  createNotification: async (notificationData) => {
      const { data, error } = await supabase
        .from('notifications')
      .insert([notificationData])
        .select()
        .single();

      if (error) throw error;
      return data;
  },

  // Marquer toutes les notifications comme lues
  markAllAsRead: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) throw error;
    return true;
  },

  // Supprimer une notification
  deleteNotification: async (notificationId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    const { error } = await supabase
        .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', user.id);

      if (error) throw error;
    return true;
  },

  // Recuperer le nombre de notifications non lues
  getUnreadCount: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);

      if (error) throw error;
      return count || 0;
  },

  // Envoyer une notification push
  sendPushNotification: async (userId, title, body, data = {}) => {
    try {
      // Récupérer le token push de l'utilisateur
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('push_token')
        .eq('id', userId)
        .single();

      if (userError || !userData?.push_token) {
        console.warn('Aucun token push trouvé pour l\'utilisateur:', userId);
        return false;
      }

      // Créer la notification dans la base
      const notification = await notificationService.createNotification({
        user_id: userId,
        title,
        body,
        type: 'push',
        data: JSON.stringify(data),
        read: false
      });

      // Ici vous pourriez intégrer un service de push (Firebase, OneSignal, etc.)
      // Pour l'instant, on retourne juste la notification créée
      return notification;
    } catch (error) {
      console.error('Erreur envoi notification push:', error);
      throw error;
    }
  }
};

export default notificationService; 