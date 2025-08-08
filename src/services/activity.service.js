import { supabase } from '../lib/supabase';

class ActivityService {
  // Récupérer les activités d'un utilisateur
  async getUserActivities(userId, filters = {}) {
    try {
      let query = supabase
        .from('user_activities')
        .select(`
          *,
          listing:listings(id, title),
          related_user:users(id, full_name, avatar_url)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (filters.type) query = query.eq('type', filters.type);
      if (filters.limit) query = query.limit(filters.limit);
      if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom);
      if (filters.dateTo) query = query.lte('created_at', filters.dateTo);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur récupération activités:', error);
      throw error;
    }
  }

  // Créer une activité
  async createActivity(activityData) {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .insert([{
          ...activityData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur création activité:', error);
      throw error;
    }
  }

  // Activités par type
  async logListingActivity(userId, listingId, action, metadata = {}) {
    const activities = {
      'created': { description: 'A créé une annonce', icon: 'plus-circle', color: 'green' },
      'updated': { description: 'A modifié une annonce', icon: 'edit', color: 'blue' },
      'deleted': { description: 'A supprimé une annonce', icon: 'trash', color: 'red' },
      'viewed': { description: 'A consulté une annonce', icon: 'eye', color: 'gray' },
      'favorited': { description: 'A ajouté aux favoris', icon: 'heart', color: 'pink' },
      'unfavorited': { description: 'A retiré des favoris', icon: 'heart-off', color: 'gray' }
    };

    const activityData = activities[action] || { description: 'Action sur annonce', icon: 'activity', color: 'blue' };

    return this.createActivity({
      user_id: userId,
      type: 'listing',
      action,
      description: activityData.description,
      icon: activityData.icon,
      color: activityData.color,
      metadata: { listing_id: listingId, ...metadata }
    });
  }

  async logAuthActivity(userId, action, metadata = {}) {
    const activities = {
      'login': { description: 'S\'est connecté', icon: 'log-in', color: 'green' },
      'logout': { description: 'S\'est déconnecté', icon: 'log-out', color: 'gray' },
      'register': { description: 'S\'est inscrit', icon: 'user-plus', color: 'blue' },
      'password_change': { description: 'A changé son mot de passe', icon: 'lock', color: 'yellow' },
      'profile_update': { description: 'A mis à jour son profil', icon: 'user', color: 'blue' }
    };

    const activityData = activities[action] || { description: 'Action d\'authentification', icon: 'shield', color: 'blue' };

    return this.createActivity({
      user_id: userId,
      type: 'auth',
      action,
      description: activityData.description,
      icon: activityData.icon,
      color: activityData.color,
      metadata
    });
  }

  async logTransactionActivity(userId, transactionId, action, metadata = {}) {
    const activities = {
      'created': { description: 'A créé une transaction', icon: 'credit-card', color: 'blue' },
      'completed': { description: 'A complété une transaction', icon: 'check-circle', color: 'green' },
      'cancelled': { description: 'A annulé une transaction', icon: 'x-circle', color: 'red' },
      'payment_sent': { description: 'A envoyé un paiement', icon: 'send', color: 'green' },
      'payment_received': { description: 'A reçu un paiement', icon: 'download', color: 'green' }
    };

    const activityData = activities[action] || { description: 'Action de transaction', icon: 'dollar-sign', color: 'blue' };

    return this.createActivity({
      user_id: userId,
      type: 'transaction',
      action,
      description: activityData.description,
      icon: activityData.icon,
      color: activityData.color,
      metadata: { transaction_id: transactionId, ...metadata }
    });
  }

  async logMessageActivity(userId, messageId, action, metadata = {}) {
    const activities = {
      'sent': { description: 'A envoyé un message', icon: 'send', color: 'blue' },
      'received': { description: 'A reçu un message', icon: 'mail', color: 'green' },
      'read': { description: 'A lu un message', icon: 'eye', color: 'gray' }
    };

    const activityData = activities[action] || { description: 'Action de message', icon: 'message-circle', color: 'blue' };

    return this.createActivity({
      user_id: userId,
      type: 'message',
      action,
      description: activityData.description,
      icon: activityData.icon,
      color: activityData.color,
      metadata: { message_id: messageId, ...metadata }
    });
  }

  // Récupérer les statistiques d'activité
  async getActivityStats(userId) {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('type, action, created_at')
        .eq('user_id', userId);

      if (error) throw error;

      const stats = {
        total: data.length,
        byType: {},
        byAction: {},
        byDay: {},
        recentActivity: data.slice(0, 10)
      };

      data.forEach(activity => {
        // Par type
        stats.byType[activity.type] = (stats.byType[activity.type] || 0) + 1;
        
        // Par action
        stats.byAction[activity.action] = (stats.byAction[activity.action] || 0) + 1;
        
        // Par jour
        const day = new Date(activity.created_at).toISOString().slice(0, 10);
        stats.byDay[day] = (stats.byDay[day] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Erreur statistiques activités:', error);
      throw error;
    }
  }

  // Rechercher des activités
  async searchActivities(userId, searchTerm) {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select(`
          *,
          listing:listings(id, title),
          related_user:users(id, full_name)
        `)
        .eq('user_id', userId)
        .or(`description.ilike.%${searchTerm}%,action.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur recherche activités:', error);
      throw error;
    }
  }

  // Exporter les activités
  async exportActivities(userId, filters = {}) {
    try {
      const activities = await this.getUserActivities(userId, filters);
      
      const exportData = activities.map(a => ({
        'Date': new Date(a.created_at).toLocaleDateString('fr-FR'),
        'Type': a.type,
        'Action': a.action,
        'Description': a.description,
        'IP': a.metadata?.ip_address || 'N/A',
        'User Agent': a.metadata?.user_agent || 'N/A'
      }));

      return exportData;
    } catch (error) {
      console.error('Erreur export activités:', error);
      throw error;
    }
  }

  // Nettoyer les anciennes activités
  async cleanupOldActivities(daysToKeep = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const { error } = await supabase
        .from('user_activities')
        .delete()
        .lt('created_at', cutoffDate.toISOString());

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur nettoyage activités:', error);
      throw error;
    }
  }
}

export const activityService = new ActivityService(); 