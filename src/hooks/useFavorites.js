import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoriteService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';

export const useFavorites = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  // Charger les favoris de l'utilisateur
  const {
    data: favorites,
    isLoading: isLoadingFavorites,
    error: favoritesError,
    refetch: refetchFavorites
  } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: () => favoriteService.getUserFavorites(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Charger les IDs des favoris pour une vérification rapide
  const {
    data: favoriteIdsData,
    isLoading: isLoadingIds,
    error: idsError
  } = useQuery({
    queryKey: ['favoriteIds', user?.id],
    queryFn: () => favoriteService.getUserFavoritesWithStatus(),
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mettre à jour l'état local quand les données changent
  useEffect(() => {
    if (favoriteIdsData) {
      setFavoriteIds(favoriteIdsData);
    }
  }, [favoriteIdsData]);

  // Mutation pour basculer les favoris
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (listingId) => {
      if (!user) {
        throw new Error('Vous devez être connecté pour ajouter aux favoris');
      }
      
      const result = await favoriteService.toggleFavorite(listingId);
      return { ...result, listingId };
    },
    onMutate: async (listingId) => {
      // Annuler les requêtes en cours
      await queryClient.cancelQueries(['favorites', user?.id]);
      await queryClient.cancelQueries(['favoriteIds', user?.id]);

      // Sauvegarder l'état précédent
      const previousFavorites = queryClient.getQueryData(['favorites', user?.id]);
      const previousIds = queryClient.getQueryData(['favoriteIds', user?.id]);

      // Mise à jour optimiste
      const newFavoriteIds = new Set(favoriteIds);
      const isCurrentlyFavorite = newFavoriteIds.has(listingId);
      
      if (isCurrentlyFavorite) {
        newFavoriteIds.delete(listingId);
      } else {
        newFavoriteIds.add(listingId);
      }

      setFavoriteIds(newFavoriteIds);

      // Mise à jour optimiste du cache
      queryClient.setQueryData(['favoriteIds', user?.id], newFavoriteIds);

      return { previousFavorites, previousIds, listingId };
    },
    onSuccess: (result, listingId) => {
      // Invalider et recharger les données
      queryClient.invalidateQueries(['favorites', user?.id]);
      queryClient.invalidateQueries(['favoriteIds', user?.id]);
      
      // Invalider les listings pour mettre à jour l'état des favoris
      queryClient.invalidateQueries(['listings']);
      
      // Invalider les statistiques utilisateur
      queryClient.invalidateQueries(['userStats']);
    },
    onError: (error, listingId, context) => {
      // En cas d'erreur, remettre l'état précédent
      if (context?.previousIds) {
        setFavoriteIds(context.previousIds);
        queryClient.setQueryData(['favoriteIds', user?.id], context.previousIds);
      }
      
      console.error('Erreur lors du basculement des favoris:', error);
    }
  });

  // Fonction pour vérifier si une annonce est en favori
  const isFavorite = (listingId) => {
    return favoriteIds.has(listingId);
  };

  // Fonction pour basculer les favoris
  const toggleFavorite = (listingId) => {
    toggleFavoriteMutation.mutate(listingId);
  };

  // Fonction pour ajouter aux favoris
  const addToFavorites = (listingId) => {
    if (!isFavorite(listingId)) {
      toggleFavorite(listingId);
    }
  };

  // Fonction pour retirer des favoris
  const removeFromFavorites = (listingId) => {
    if (isFavorite(listingId)) {
      toggleFavorite(listingId);
    }
  };

  // Fonction pour recharger les favoris
  const refreshFavorites = () => {
    refetchFavorites();
  };

  return {
    // Données
    favorites: favorites || [],
    favoriteIds,
    
    // États
    isLoading: isLoadingFavorites || isLoadingIds,
    error: favoritesError || idsError,
    isToggling: toggleFavoriteMutation.isLoading,
    
    // Fonctions
    isFavorite,
    toggleFavorite,
    addToFavorites,
    removeFromFavorites,
    refreshFavorites,
    
    // Statistiques
    totalFavorites: favorites?.length || 0,
    
    // Mutation
    toggleFavoriteMutation
  };
};
