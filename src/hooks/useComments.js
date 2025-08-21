import { useState, useEffect, useCallback } from 'react';
import { commentService } from '@/services/comment.service';

export const useComments = (listingId, options = {}) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [stats, setStats] = useState(null);

  // Fonction pour récupérer les commentaires
  const fetchComments = useCallback(async (newOptions = {}) => {
    console.log('🔍 [useComments] fetchComments appelé avec:', { listingId, options, newOptions });
    
    if (!listingId) {
      console.log('❌ [useComments] Pas de listingId, arrêt');
      return;
    }

    try {
      console.log('🔍 [useComments] Début du chargement...');
      setLoading(true);
      setError(null);
      
      console.log('🔍 [useComments] Appel du service...');
      const { comments: newComments, pagination: newPagination, error } = 
        await commentService.getComments(listingId, { ...options, ...newOptions });
      
      console.log('🔍 [useComments] Réponse du service:', { 
        commentsLength: newComments?.length, 
        error, 
        pagination: newPagination 
      });
      
      if (error) {
        console.error('❌ [useComments] Erreur du service:', error);
        throw new Error(error);
      }
      
      console.log('✅ [useComments] Mise à jour du state...');
      setComments(newComments);
      setPagination(newPagination);
      console.log('✅ [useComments] Chargement terminé avec succès');
    } catch (err) {
      console.error('❌ [useComments] Erreur finale:', err);
      setError(err.message);
      console.error('Erreur lors du chargement des commentaires:', err);
    } finally {
      console.log('🔍 [useComments] Fin du chargement, loading = false');
      setLoading(false);
    }
  }, [listingId]); // Supprimer options pour éviter les re-renders

  // Fonction pour récupérer les statistiques
  const fetchStats = useCallback(async () => {
    console.log('🔍 [useComments] fetchStats appelé avec listingId:', listingId);
    
    if (!listingId) {
      console.log('❌ [useComments] Pas de listingId pour les stats, arrêt');
      return;
    }

    try {
      console.log('🔍 [useComments] Appel du service stats...');
      const { stats: newStats, error } = await commentService.getCommentStats(listingId);
      
      console.log('🔍 [useComments] Réponse stats:', { stats: newStats, error });
      
      if (error) {
        console.error('❌ [useComments] Erreur stats:', error);
        return;
      }
      
      console.log('✅ [useComments] Mise à jour des stats...');
      setStats(newStats);
    } catch (err) {
      console.error('❌ [useComments] Erreur stats finale:', err);
      console.error('Erreur lors du chargement des statistiques:', err);
    }
  }, [listingId]);

  // Fonction pour ajouter un commentaire
  const addComment = useCallback(async (commentData) => {
    try {
      setError(null);
      
      const { comment, error } = await commentService.createComment({
        ...commentData,
        listing_id: listingId
      });
      
      if (error) throw new Error(error);
      
      // Ajouter le nouveau commentaire au début de la liste
      setComments(prev => [comment, ...prev]);
      
      // Rafraîchir les statistiques
      fetchStats();
      
      return { comment, error: null };
    } catch (err) {
      const errorMessage = err.message;
      setError(errorMessage);
      return { comment: null, error: errorMessage };
    }
  }, [listingId, fetchStats]);

  // Fonction pour mettre à jour un commentaire
  const updateComment = useCallback(async (commentId, updates) => {
    try {
      setError(null);
      
      const { comment, error } = await commentService.updateComment(commentId, updates);
      
      if (error) throw new Error(error);
      
      // Mettre à jour le commentaire dans la liste
      setComments(prev => 
        prev.map(c => c.id === commentId ? comment : c)
      );
      
      return { comment, error: null };
    } catch (err) {
      const errorMessage = err.message;
      setError(errorMessage);
      return { comment: null, error: errorMessage };
    }
  }, []);

  // Fonction pour supprimer un commentaire
  const deleteComment = useCallback(async (commentId) => {
    try {
      setError(null);
      
      const { error } = await commentService.deleteComment(commentId);
      
      if (error) throw new Error(error);
      
      // Supprimer le commentaire de la liste
      setComments(prev => prev.filter(c => c.id !== commentId));
      
      // Rafraîchir les statistiques
      fetchStats();
      
      return { error: null };
    } catch (err) {
      const errorMessage = err.message;
      setError(errorMessage);
      return { error: errorMessage };
    }
  }, [fetchStats]);

  // Fonction pour signaler un commentaire
  const reportComment = useCallback(async (commentId, reportData) => {
    try {
      setError(null);
      
      const { report, error } = await commentService.reportComment(commentId, reportData);
      
      if (error) throw new Error(error);
      
      return { report, error: null };
    } catch (err) {
      const errorMessage = err.message;
      setError(errorMessage);
      return { report: null, error: errorMessage };
    }
  }, []);

  // Fonction pour changer de page
  const changePage = useCallback((newPage) => {
    fetchComments({ page: newPage });
  }, [fetchComments]);

  // Fonction pour changer les filtres
  const changeFilters = useCallback((newFilters) => {
    fetchComments({ ...newFilters, page: 1 }); // Retour à la première page
  }, [fetchComments]);

  // Fonction pour rafraîchir les données
  const refresh = useCallback(() => {
    fetchComments();
    fetchStats();
  }, [fetchComments, fetchStats]);

  // Chargement initial - CORRIGÉ : pas de dépendances qui causent des re-renders
  useEffect(() => {
    console.log('🔍 [useComments] useEffect déclenché avec listingId:', listingId);
    
    if (listingId) {
      console.log('🔍 [useComments] Lancement du chargement initial...');
      fetchComments();
      fetchStats();
    } else {
      console.log('❌ [useComments] Pas de listingId, pas de chargement');
    }
  }, [listingId]); // Seulement listingId comme dépendance

  return {
    // État
    comments,
    loading,
    error,
    pagination,
    stats,
    
    // Actions
    fetchComments,
    addComment,
    updateComment,
    deleteComment,
    reportComment,
    changePage,
    changeFilters,
    refresh,
    fetchStats
  };
};

// Hook pour les commentaires d'un utilisateur
export const useUserComments = (userId, options = {}) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});

  const fetchUserComments = useCallback(async (newOptions = {}) => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      
      const { comments: newComments, pagination: newPagination, error } = 
        await commentService.getUserComments(userId, { ...options, ...newOptions });
      
      if (error) throw new Error(error);
      
      setComments(newComments);
      setPagination(newPagination);
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors du chargement des commentaires utilisateur:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, JSON.stringify(options)]);

  const changePage = useCallback((newPage) => {
    fetchUserComments({ page: newPage });
  }, [fetchUserComments]);

  useEffect(() => {
    if (userId) {
      fetchUserComments();
    }
  }, [userId]); // Seulement userId comme dépendance

  return {
    comments,
    loading,
    error,
    pagination,
    fetchUserComments,
    changePage
  };
};

// Hook pour la modération (admin)
export const useCommentsModeration = (options = {}) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});

  const fetchPendingComments = useCallback(async (newOptions = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const { comments: newComments, pagination: newPagination, error } = 
        await commentService.getPendingComments({ ...options, ...newOptions });
      
      if (error) throw new Error(error);
      
      setComments(newComments);
      setPagination(newPagination);
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors du chargement des commentaires en attente:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(options)]);

  const moderateComment = useCallback(async (commentId, action, reason = null) => {
    try {
      setError(null);
      
      const { comment, error } = await commentService.moderateComment(commentId, action, reason);
      
      if (error) throw new Error(error);
      
      // Retirer le commentaire modéré de la liste
      setComments(prev => prev.filter(c => c.id !== commentId));
      
      return { comment, error: null };
    } catch (err) {
      const errorMessage = err.message;
      setError(errorMessage);
      return { comment: null, error: errorMessage };
    }
  }, []);

  const changePage = useCallback((newPage) => {
    fetchPendingComments({ page: newPage });
  }, [fetchPendingComments]);

  useEffect(() => {
    fetchPendingComments();
  }, []); // Pas de dépendances pour éviter les re-renders

  return {
    comments,
    loading,
    error,
    pagination,
    fetchPendingComments,
    moderateComment,
    changePage
  };
};
