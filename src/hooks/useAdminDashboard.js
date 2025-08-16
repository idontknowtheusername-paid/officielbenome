import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  listingService, 
  userService, 
  notificationService,
  messageService 
} from '@/services';
import { toast } from 'sonner';

/**
 * Hook personnalisé pour gérer les données du tableau de bord d'administration avec Supabase
 * @param {Object} options - Options de configuration
 * @param {string} [options.dataType] - Type de données à récupérer ('listings', 'users', 'transactions')
 * @param {string} [options.queryKey] - Clé de requête pour le cache
 * @param {Object} [options.defaultFilters] - Filtres par défaut
 * @param {boolean} [options.enabled] - Si la requête doit être exécutée immédiatement
 * @returns {Object} - Données et méthodes pour gérer le tableau de bord
 */
const useAdminDashboard = (options = {}) => {
  const {
    dataType = 'listings',
    queryKey = 'admin-dashboard',
    defaultFilters = {},
    enabled = true,
  } = options;

  const queryClient = useQueryClient();
  
  // État pour la pagination et le tri
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  
  const [sorting, setSorting] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fonction pour recuperer les donnees selon le type
  const fetchDataByType = useCallback(async () => {
    const from = (pagination.page - 1) * pagination.pageSize;
    const to = from + pagination.pageSize - 1;
    
    let queryFilters = { ...filters };
    
    // Ajouter la recherche si presente
    if (searchQuery) {
      queryFilters.search = searchQuery;
    }
    
    // Ajouter le tri si present
    if (sorting.length > 0) {
      queryFilters.sortBy = sorting[0].id;
      queryFilters.sortOrder = sorting[0].desc ? 'desc' : 'asc';
    }
    
    switch (dataType) {
      case 'listings':
        return await listingService.getAllListings(queryFilters);
      case 'users':
        return await userService.getAllUsers();
      case 'notifications':
        return await notificationService.getUserNotifications();
      case 'messages':
        return await messageService.getUserConversations();
      default:
        return await listingService.getAllListings(queryFilters);
    }
  }, [dataType, pagination, sorting, filters, searchQuery]);
  
  // Requete pour recuperer les donnees
  const fetchData = async () => {
    const data = await fetchDataByType();
    
    // Calculer le total pour la pagination
    const total = Array.isArray(data) ? data.length : 0;
    
    // Mettre a jour la pagination avec le total
    setPagination(prev => ({
      ...prev,
      total,
    }));
    
    return data;
  };
  
  // Utiliser React Query pour gerer les requetes
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [queryKey, { pagination, sorting, filters, searchQuery }],
    queryFn: fetchData,
    enabled,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
  
  // Gerer le changement de page
  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      page,
    }));
  };
  
  // Gerer le changement de taille de page
  const handlePageSizeChange = (pageSize) => {
    setPagination(prev => ({
      ...prev,
      pageSize,
      page: 1, // Retour a la premiere page
    }));
  };
  
  // Gerer le tri
  const handleSortingChange = (newSorting) => {
    setSorting(newSorting);
    setPagination(prev => ({
      ...prev,
      page: 1, // Retour a la premiere page lors du tri
    }));
  };
  
  // Gerer la recherche
  const handleSearch = (query) => {
    setSearchQuery(query);
    setPagination(prev => ({
      ...prev,
      page: 1, // Retour a la premiere page lors d'une nouvelle recherche
    }));
  };
  
  // Gerer les filtres
  const handleFilter = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
    setPagination(prev => ({
      ...prev,
      page: 1, // Retour a la premiere page lors de l'application de nouveaux filtres
    }));
  };
  
  // Reinitialiser les filtres
  const resetFilters = () => {
    setFilters(defaultFilters);
    setSearchQuery('');
    setSorting([]);
    setPagination(prev => ({
      ...prev,
      page: 1,
    }));
  };
  
  // Mutation pour mettre a jour un element selon le type
  const updateMutation = useMutation({
    mutationFn: async ({ id, data: updateData }) => {
      switch (dataType) {
        case 'listings':
          return await listingService.updateListing(id, updateData);
        case 'users':
          return await userService.updateUserStatus(id, updateData.status);
        default:
          throw new Error(`Type de données non supporté: ${dataType}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries([queryKey]);
      toast.success('Élément mis à jour avec succès');
    },
    onError: (error) => {
      toast.error(error.message || 'Une erreur est survenue');
    },
  });
  
  // Mutation pour supprimer un element selon le type
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      switch (dataType) {
        case 'listings':
          return await listingService.deleteListing(id);
        default:
          throw new Error(`Type de données non supporté: ${dataType}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries([queryKey]);
      toast.success('Élément supprimé avec succès');
    },
    onError: (error) => {
      toast.error(error.message || 'Une erreur est survenue');
    },
  });
  
  // Mutation pour approuver/rejeter une annonce
  const approveRejectMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      return await listingService.updateListingStatus(id, status);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries([queryKey]);
      const action = variables.status === 'approved' ? 'approuvée' : 'rejetée';
      toast.success(`Annonce ${action} avec succès`);
    },
    onError: (error) => {
      toast.error(error.message || 'Une erreur est survenue');
    },
  });
  
  // Exposer les methodes et etats
  return {
    // Donnees
    data,
    isLoading,
    isError,
    error,
    
    // Pagination
    pagination,
    page: pagination.page,
    pageSize: pagination.pageSize,
    total: pagination.total,
    
    // Tri et filtres
    sorting,
    filters,
    searchQuery,
    
    // Methodes
    refetch,
    setPagination: handlePageChange,
    setPageSize: handlePageSizeChange,
    setSorting: handleSortingChange,
    setSearchQuery: handleSearch,
    setFilters: handleFilter,
    resetFilters,
    
    // Mutations
    updateItem: updateMutation.mutate,
    updateItemAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isLoading,
    
    deleteItem: deleteMutation.mutate,
    deleteItemAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isLoading,
    
    approveRejectItem: approveRejectMutation.mutate,
    approveRejectItemAsync: approveRejectMutation.mutateAsync,
    isApprovingRejecting: approveRejectMutation.isLoading,
    
    // Utilitaires
    hasNextPage: pagination.page * pagination.pageSize < pagination.total,
    hasPreviousPage: pagination.page > 1,
    totalPages: Math.ceil(pagination.total / pagination.pageSize),
  };
};

export default useAdminDashboard;
