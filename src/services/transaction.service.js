import { supabase } from '../lib/supabase';

class TransactionService {
  // Récupérer toutes les transactions d'un utilisateur
  async getUserTransactions(userId, filters = {}) {
    try {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          listing:listings(id, title, price, images),
          sender:users!transactions_sender_id_fkey(id, full_name, avatar_url),
          receiver:users!transactions_receiver_id_fkey(id, full_name, avatar_url)
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      // Appliquer les filtres
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }
      if (filters.amountMin) {
        query = query.gte('amount', filters.amountMin);
      }
      if (filters.amountMax) {
        query = query.lte('amount', filters.amountMax);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions:', error);
      throw error;
    }
  }

  // Créer une nouvelle transaction
  async createTransaction(transactionData) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transactionData,
          status: 'pending',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la création de la transaction:', error);
      throw error;
    }
  }

  // Mettre à jour le statut d'une transaction
  async updateTransactionStatus(transactionId, status, metadata = {}) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({
          status,
          metadata: { ...metadata, status_updated_at: new Date().toISOString() },
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  }

  // Récupérer une transaction spécifique
  async getTransaction(transactionId) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          listing:listings(id, title, price, images, description),
          sender:users!transactions_sender_id_fkey(id, full_name, avatar_url, email),
          receiver:users!transactions_receiver_id_fkey(id, full_name, avatar_url, email)
        `)
        .eq('id', transactionId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la transaction:', error);
      throw error;
    }
  }

  // Annuler une transaction
  async cancelTransaction(transactionId, reason) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({
          status: 'cancelled',
          metadata: { 
            cancellation_reason: reason,
            cancelled_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la transaction:', error);
      throw error;
    }
  }

  // Récupérer les statistiques de transactions
  async getTransactionStats(userId) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('status, amount, type, created_at')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

      if (error) throw error;

      const stats = {
        total: data.length,
        totalAmount: data.reduce((sum, t) => sum + (t.amount || 0), 0),
        byStatus: {},
        byType: {},
        monthly: {}
      };

      data.forEach(transaction => {
        // Par statut
        stats.byStatus[transaction.status] = (stats.byStatus[transaction.status] || 0) + 1;
        
        // Par type
        stats.byType[transaction.type] = (stats.byType[transaction.type] || 0) + 1;
        
        // Par mois
        const month = new Date(transaction.created_at).toISOString().slice(0, 7);
        if (!stats.monthly[month]) {
          stats.monthly[month] = { count: 0, amount: 0 };
        }
        stats.monthly[month].count++;
        stats.monthly[month].amount += transaction.amount || 0;
      });

      return stats;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  // Rechercher des transactions
  async searchTransactions(userId, searchTerm) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          listing:listings(id, title),
          sender:users!transactions_sender_id_fkey(id, full_name),
          receiver:users!transactions_receiver_id_fkey(id, full_name)
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .or(`reference.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la recherche de transactions:', error);
      throw error;
    }
  }

  // Exporter les transactions en CSV
  async exportTransactions(userId, filters = {}) {
    try {
      const transactions = await this.getUserTransactions(userId, filters);
      
      const csvData = transactions.map(t => ({
        'Référence': t.reference,
        'Date': new Date(t.created_at).toLocaleDateString('fr-FR'),
        'Type': t.type,
        'Statut': t.status,
        'Montant': t.amount,
        'Devise': t.currency,
        'Description': t.description,
        'Expéditeur': t.sender?.full_name || 'N/A',
        'Destinataire': t.receiver?.full_name || 'N/A'
      }));

      return csvData;
    } catch (error) {
      console.error('Erreur lors de l\'export des transactions:', error);
      throw error;
    }
  }

  // Valider une transaction (pour les admins)
  async validateTransaction(transactionId, adminId) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({
          status: 'completed',
          metadata: { 
            validated_by: adminId,
            validated_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la validation de la transaction:', error);
      throw error;
    }
  }

  // Récupérer les transactions en attente (pour les admins)
  async getPendingTransactions() {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          listing:listings(id, title, price),
          sender:users!transactions_sender_id_fkey(id, full_name, email),
          receiver:users!transactions_receiver_id_fkey(id, full_name, email)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions en attente:', error);
      throw error;
    }
  }
}

export const transactionService = new TransactionService(); 