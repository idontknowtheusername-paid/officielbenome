import { supabase } from '@/lib/supabase';

// ============================================================================
// SERVICE NOTIFICATIONS
// ============================================================================

export const notificationService = {
  // Recuperer les notifications d'un utilisateur (incluant les notifications globales)
  getUserNotifications: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${user.id},is_global.eq.true`)
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
      .or(`user_id.eq.${user.id},is_global.eq.true`)
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
  },

  // ============================================================================
  // NOTIFICATIONS SPECIFIQUES
  // ============================================================================

  // Créer notification pour approbation d'annonce
  createListingApprovedNotification: async (listingId, userId, listingTitle) => {
    try {
      const notification = await notificationService.createNotification({
        user_id: userId,
        title: 'Annonce approuvée',
        body: `Votre annonce "${listingTitle}" a été approuvée et est maintenant visible.`,
        type: 'listing_approved',
        data: JSON.stringify({ listingId, listingTitle }),
        read: false,
        is_global: false
      });

      // Optionnel: envoyer une notification push
      await notificationService.sendPushNotification(
        userId,
        'Annonce approuvée',
        `Votre annonce "${listingTitle}" est maintenant en ligne !`,
        { listingId, type: 'listing_approved' }
      );

      return notification;
    } catch (error) {
      console.error('Erreur création notification approbation:', error);
      throw error;
    }
  },

  // Créer notification pour rejet d'annonce
  createListingRejectedNotification: async (listingId, userId, listingTitle, reason) => {
    try {
      const notification = await notificationService.createNotification({
        user_id: userId,
        title: 'Annonce rejetée',
        body: `Votre annonce "${listingTitle}" a été rejetée. Raison: ${reason}`,
        type: 'listing_rejected',
        data: JSON.stringify({ listingId, listingTitle, reason }),
        read: false,
        is_global: false
      });

      // Optionnel: envoyer une notification push
      await notificationService.sendPushNotification(
        userId,
        'Annonce rejetée',
        `Votre annonce "${listingTitle}" nécessite des modifications.`,
        { listingId, reason, type: 'listing_rejected' }
      );

      return notification;
    } catch (error) {
      console.error('Erreur création notification rejet:', error);
      throw error;
    }
  },

  // Créer notification pour nouveau message
  createNewMessageNotification: async (senderId, receiverId, senderName, conversationId) => {
    try {
      const notification = await notificationService.createNotification({
        user_id: receiverId,
        title: 'Nouveau message',
        body: `${senderName} vous a envoyé un message.`,
        type: 'new_message',
        data: JSON.stringify({ senderId, senderName, conversationId }),
        read: false,
        is_global: false
      });

      // Optionnel: envoyer une notification push
      await notificationService.sendPushNotification(
        receiverId,
        'Nouveau message',
        `${senderName} vous a envoyé un message.`,
        { conversationId, senderId, type: 'new_message' }
      );

      return notification;
    } catch (error) {
      console.error('Erreur création notification message:', error);
      throw error;
    }
  },

  // Créer notification GLOBALE pour boost activé (visible par tous)
  createBoostActivatedGlobalNotification: async (listingId, listingTitle, ownerName) => {
    try {
      const notification = await notificationService.createNotification({
        user_id: null, // Notification globale
        title: 'Annonce boostée',
        body: `${ownerName} a boosté l'annonce "${listingTitle}". Découvrez-la maintenant !`,
        type: 'boost_activated',
        data: JSON.stringify({ listingId, listingTitle, ownerName }),
        read: false,
        is_global: true
      });

      return notification;
    } catch (error) {
      console.error('Erreur création notification boost activé:', error);
      throw error;
    }
  },

  // Créer notification pour boost expiré (propriétaire seulement)
  createBoostExpiredNotification: async (listingId, userId, listingTitle) => {
    try {
      const notification = await notificationService.createNotification({
        user_id: userId,
        title: 'Boost expiré',
        body: `Le boost de votre annonce "${listingTitle}" a expiré.`,
        type: 'boost_expired',
        data: JSON.stringify({ listingId, listingTitle }),
        read: false,
        is_global: false
      });

      // Optionnel: envoyer une notification push
      await notificationService.sendPushNotification(
        userId,
        'Boost expiré',
        `Le boost de "${listingTitle}" a expiré. Voulez-vous le renouveler ?`,
        { listingId, type: 'boost_expired' }
      );

      return notification;
    } catch (error) {
      console.error('Erreur création notification boost expiré:', error);
      throw error;
    }
  },

  // Créer notification GLOBALE pour nouvelle annonce
  createNewListingGlobalNotification: async (listingId, listingTitle, ownerName, category) => {
    try {
      const notification = await notificationService.createNotification({
        user_id: null, // Notification globale
        title: 'Nouvelle annonce',
        body: `${ownerName} a publié une nouvelle annonce "${listingTitle}" dans ${category}.`,
        type: 'new_listing',
        data: JSON.stringify({ listingId, listingTitle, ownerName, category }),
        read: false,
        is_global: true
      });

      return notification;
    } catch (error) {
      console.error('Erreur création notification nouvelle annonce:', error);
      throw error;
    }
  }
};

export default notificationService;
