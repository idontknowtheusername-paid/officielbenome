import { supabase } from '@/lib/supabase';
import ModerationService from '@/utils/moderation';

class CommentService {
  /**
   * Récupérer les commentaires d'une annonce
   */
  async getComments(listingId, options = {}) {
    const {
      page = 1,
      limit = 10,
      sort = 'created_at',
      order = 'desc',
      rating = null,
      verifiedOnly = false,
      parentId = null
    } = options;

    try {
      let query = supabase
        .from('comments')
        .select(`
          *,
          user:auth.users!comments_user_id_fkey(
            id,
            email
          ),
          replies:comments!comments_parent_id_fkey(count)
        `)
        .eq('listing_id', listingId)
        .eq('status', 'approved');

      // Filtres
      if (rating) query = query.eq('rating', rating);
      if (verifiedOnly) query = query.eq('is_verified_purchase', true);
      if (parentId) query = query.eq('parent_id', parentId);
      else query = query.is('parent_id', null);

      // Tri
      query = query.order(sort, { ascending: order === 'asc' });

      // Pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        comments: data || [],
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit)
        },
        error: null
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des commentaires:', error);
      return {
        comments: [],
        pagination: { page, limit, total: 0, pages: 0 },
        error: error.message
      };
    }
  }

  /**
   * Créer un nouveau commentaire
   */
  async createComment(commentData) {
    try {
      // Modération automatique
      const moderationResult = await ModerationService.moderateComment(commentData);
      
      // Appliquer le statut de modération
      const commentWithModeration = {
        ...commentData,
        status: moderationResult.status
      };

      const { data, error } = await supabase
        .from('comments')
        .insert([commentWithModeration])
        .select(`
          *,
          user:auth.users!comments_user_id_fkey(
            id,
            email
          )
        `)
        .single();

      if (error) throw error;

      // Retourner le commentaire avec les informations de modération
      return { 
        comment: data, 
        error: null,
        moderation: moderationResult
      };
    } catch (error) {
      console.error('Erreur lors de la création du commentaire:', error);
      return { comment: null, error: error.message };
    }
  }

  /**
   * Mettre à jour un commentaire
   */
  async updateComment(id, updates) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          user:auth.users!comments_user_id_fkey(
            id,
            email
          )
        `)
        .single();

      if (error) throw error;

      return { comment: data, error: null };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du commentaire:', error);
      return { comment: null, error: error.message };
    }
  }

  /**
   * Supprimer un commentaire
   */
  async deleteComment(id) {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Erreur lors de la suppression du commentaire:', error);
      return { error: error.message };
    }
  }

  /**
   * Signaler un commentaire
   */
  async reportComment(commentId, reportData) {
    try {
      const { data, error } = await supabase
        .from('comment_reports')
        .insert([{
          comment_id: commentId,
          ...reportData
        }])
        .select()
        .single();

      if (error) throw error;

      return { report: data, error: null };
    } catch (error) {
      console.error('Erreur lors du signalement du commentaire:', error);
      return { report: null, error: error.message };
    }
  }

  /**
   * Obtenir les statistiques des commentaires d'une annonce
   */
  async getCommentStats(listingId) {
    try {
      const { data, error } = await supabase
        .rpc('get_listing_comment_stats', { listing_uuid: listingId });

      if (error) throw error;

      return { stats: data[0] || null, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      
      // Fallback : calcul manuel si la fonction RPC n'existe pas
      try {
        const { data, error: fallbackError } = await supabase
          .from('comments')
          .select('rating, is_verified_purchase')
          .eq('listing_id', listingId)
          .eq('status', 'approved');

        if (fallbackError) throw fallbackError;

        const stats = {
          total_comments: data.length,
          average_rating: data.length > 0 ? data.reduce((sum, c) => sum + c.rating, 0) / data.length : 0,
          verified_purchases: data.filter(c => c.is_verified_purchase).length,
          rating_distribution: {
            1: data.filter(c => c.rating === 1).length,
            2: data.filter(c => c.rating === 2).length,
            3: data.filter(c => c.rating === 3).length,
            4: data.filter(c => c.rating === 4).length,
            5: data.filter(c => c.rating === 5).length
          }
        };

        return { stats, error: null };
      } catch (fallbackError) {
        return { stats: null, error: fallbackError.message };
      }
    }
  }

  /**
   * Récupérer les commentaires d'un utilisateur
   */
  async getUserComments(userId, options = {}) {
    const {
      page = 1,
      limit = 10,
      status = null
    } = options;

    try {
      let query = supabase
        .from('comments')
        .select(`
          *,
          listing:listings!comments_listing_id_fkey(
            id,
            title,
            category,
            images
          )
        `)
        .eq('user_id', userId);

      if (status) query = query.eq('status', status);

      query = query.order('created_at', { ascending: false });

      // Pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        comments: data || [],
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit)
        },
        error: null
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des commentaires utilisateur:', error);
      return {
        comments: [],
        pagination: { page, limit, total: 0, pages: 0 },
        error: error.message
      };
    }
  }

  /**
   * Récupérer les commentaires en attente de modération (admin)
   */
  async getPendingComments(options = {}) {
    const {
      page = 1,
      limit = 20
    } = options;

    try {
      const { data, error, count } = await supabase
        .from('comments')
        .select(`
          *,
          user:auth.users!comments_user_id_fkey(
            id,
            email
          ),
          listing:listings!comments_listing_id_fkey(
            id,
            title,
            category
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      return {
        comments: data || [],
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit)
        },
        error: null
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des commentaires en attente:', error);
      return {
        comments: [],
        pagination: { page, limit, total: 0, pages: 0 },
        error: error.message
      };
    }
  }

  /**
   * Modérer un commentaire (admin)
   */
  async moderateComment(commentId, action, reason = null) {
    try {
      const updates = {
        status: action,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('comments')
        .update(updates)
        .eq('id', commentId)
        .select()
        .single();

      if (error) throw error;

      return { comment: data, error: null };
    } catch (error) {
      console.error('Erreur lors de la modération du commentaire:', error);
      return { comment: null, error: error.message };
    }
  }
}

export const commentService = new CommentService();
