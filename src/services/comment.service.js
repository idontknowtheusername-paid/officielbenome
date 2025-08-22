import { supabase } from '@/lib/supabase';
import ModerationService from '@/utils/moderation';

class CommentService {
  /**
   * Récupérer les commentaires d'une annonce
   */
  async getComments(listingId, options = {}) {
    console.log('🔍 [CommentService] getComments appelé avec:', { listingId, options });
    
    try {
      console.log('🔍 [CommentService] Construction de la requête...');
      
      const { page = 1, limit = 10 } = options;
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      console.log('🔍 [CommentService] Paramètres de pagination:', { page, limit, from, to });
      
      // Requête pour récupérer les commentaires avec les données utilisateur
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select(`
          *,
          user:users(id, first_name, last_name, email)
        `)
        .eq('listing_id', listingId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .range(from, to);
      
      console.log('🔍 [CommentService] Résultat requête commentaires:', { comments, commentsError });
      
      if (commentsError) {
        console.error('❌ [CommentService] Erreur requête commentaires:', commentsError);
        throw commentsError;
      }
      
      // Requête pour compter le total
      const { count, error: countError } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('listing_id', listingId)
        .eq('status', 'approved');
      
      console.log('🔍 [CommentService] Résultat comptage:', { count, countError });
      
      if (countError) {
        console.error('❌ [CommentService] Erreur comptage:', countError);
        throw countError;
      }
      
      const total = count || 0;
      const pages = Math.ceil(total / limit);
      
      // Traiter les commentaires avec les vrais noms d'utilisateurs
      const processedComments = comments?.map(comment => {
        const userData = comment.user;
        let displayName = 'Utilisateur anonyme';
        let userEmail = null;
        
        if (userData) {
          if (userData.first_name && userData.last_name) {
            displayName = `${userData.first_name} ${userData.last_name}`;
          } else if (userData.first_name) {
            displayName = userData.first_name;
          } else if (userData.last_name) {
            displayName = userData.last_name;
          } else if (userData.email) {
            displayName = userData.email.split('@')[0];
          }
          userEmail = userData.email;
        } else {
          // Fallback si pas de données utilisateur
          const userId = comment.user_id;
          if (userId) {
            const shortId = userId.slice(0, 8);
            displayName = `Utilisateur ${shortId}`;
          }
        }

        return {
          ...comment,
          user_display_name: displayName,
          user_email: userEmail
        };
      }) || [];

      console.log('✅ [CommentService] Commentaires récupérés avec succès:', {
        commentsCount: processedComments?.length || 0,
        total,
        pages,
        currentPage: page
      });
      
      return {
        comments: processedComments,
        pagination: {
          page,
          limit,
          total,
          pages
        },
        error: null
      };
      
    } catch (error) {
      console.error('❌ [CommentService] Erreur finale:', error);
      return {
        comments: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
        error: error.message
      };
    }
  }

  /**
   * Créer un nouveau commentaire
   */
  async createComment(commentData) {
    console.log('🔍 [CommentService] createComment appelé avec:', commentData);
    
    try {
      console.log('🔍 [CommentService] Début de la création...');
      
      // Modération automatique
      console.log('🔍 [CommentService] Appel de la modération...');
      const moderationResult = await ModerationService.moderateComment(commentData);
      console.log('🔍 [CommentService] Résultat modération:', moderationResult);
      
      // Appliquer le statut de modération et nettoyer les données
      const commentWithModeration = {
        listing_id: commentData.listing_id,
        user_id: commentData.user_id,
        content: commentData.content,
        rating: commentData.rating,
        parent_id: commentData.parent_id || null,
        status: moderationResult.status
      };
      
      console.log('🔍 [CommentService] Données à insérer:', commentWithModeration);

      const { data, error } = await supabase
        .from('comments')
        .insert([commentWithModeration])
        .select('*')
        .single();

      console.log('🔍 [CommentService] Résultat insertion:', { data, error });

      if (error) throw error;

      console.log('✅ [CommentService] Commentaire créé avec succès');
      
      // Traiter le nom d'utilisateur pour le commentaire créé (fallback simple)
      const processedComment = {
        ...data,
        user_display_name: `Utilisateur ${data.user_id?.slice(0, 8)}`,
        user_email: null
      };
      
      // Retourner le commentaire avec les informations de modération
      return { 
        comment: processedComment, 
        error: null,
        moderation: moderationResult
      };
    } catch (error) {
      console.error('❌ [CommentService] Erreur lors de la création du commentaire:', error);
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
        .select('*')
        .single();

      if (error) throw error;

      // Traiter le nom d'utilisateur (fallback simple pour update)
      const processedComment = {
        ...data,
        user_display_name: `Utilisateur ${data.user_id?.slice(0, 8)}`,
        user_email: null
      };

      return { comment: processedComment, error: null };
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
          listing:listings(id, title, category, images)
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
          listing:listings(id, title, category)
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
