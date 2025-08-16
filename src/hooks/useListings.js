import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listingService, favoriteService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { queryConfigs } from '@/lib/queryClient';

export const useListings = (category = null, filters = {}) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Requête principale avec pagination infinie
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['listings', category, filters],
    queryFn: ({ pageParam = 0 }) => {
      const serviceFilters = {
        status: 'approved',
        category,
        search: filters.search,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        location: filters.location,
        page: pageParam,
        limit: 12,
        ...filters
      };
      
      return listingService.getAllListings(serviceFilters);
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length : undefined;
    },
    staleTime: queryConfigs.listings.staleTime,
    gcTime: queryConfigs.listings.gcTime,
    keepPreviousData: true,
  });

  // Mutation pour créer une annonce
  const createListingMutation = useMutation({
    mutationFn: (listingData) => {
      if (!user) {
        throw new Error('Vous devez être connecté pour créer une annonce');
      }

      return listingService.createListing({
        ...listingData,
        user_id: user.id,
        status: 'pending'
      });
    },
    onSuccess: () => {
      // Invalider le cache des listings
      queryClient.invalidateQueries(['listings']);
    },
  });

  // Mutation pour mettre à jour une annonce
  const updateListingMutation = useMutation({
    mutationFn: ({ id, updates }) => listingService.updateListing(id, updates),
    onSuccess: (data, variables) => {
      // Mise à jour optimiste du cache
      queryClient.setQueryData(['listings'], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            data: page.data.map(listing => 
              listing.id === variables.id 
                ? { ...listing, ...variables.updates }
                : listing
            )
          }))
        };
      });
    },
  });

  // Mutation pour supprimer une annonce
  const deleteListingMutation = useMutation({
    mutationFn: (id) => listingService.deleteListing(id),
    onSuccess: (_, id) => {
      // Mise à jour optimiste du cache
      queryClient.setQueryData(['listings'], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            data: page.data.filter(listing => listing.id !== id)
          }))
        };
      });
    },
  });

  // Mutation pour basculer les favoris
  const toggleFavoriteMutation = useMutation({
    mutationFn: (listingId) => {
      if (!user) {
        throw new Error('Vous devez être connecté pour ajouter aux favoris');
      }
      return favoriteService.toggleFavorite(listingId);
    },
    onSuccess: (result, listingId) => {
      // Mise à jour optimiste du cache
      queryClient.setQueryData(['listings'], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            data: page.data.map(listing => 
          listing.id === listingId 
            ? { ...listing, is_favorite: result.is_favorite }
            : listing
        )
          }))
        };
      });
    },
  });

  return {
    // Données et état de chargement
    listings: data?.pages.flatMap(page => page.data) || [],
    loading: isLoading,
    error,
    hasMore: hasNextPage,
    isFetchingMore: isFetchingNextPage,
    
    // Actions
    loadMore: fetchNextPage,
    refresh: refetch,
    
    // Mutations
    createListing: createListingMutation.mutate,
    updateListing: updateListingMutation.mutate,
    deleteListing: deleteListingMutation.mutate,
    toggleFavorite: toggleFavoriteMutation.mutate,
    
    // États des mutations
    isCreating: createListingMutation.isLoading,
    isUpdating: updateListingMutation.isLoading,
    isDeleting: deleteListingMutation.isLoading,
    isTogglingFavorite: toggleFavoriteMutation.isLoading,
  };
}; 