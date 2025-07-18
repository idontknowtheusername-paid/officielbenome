import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/hooks/useApi';
import { toast } from 'sonner';

/**
 * Hook personnalisé pour gérer les données du tableau de bord d'administration
 * @param {Object} options - Options de configuration
 * @param {string} [options.endpoint] - Endpoint de base pour les requêtes
 * @param {string} [options.queryKey] - Clé de requête pour le cache
 * @param {Object} [options.defaultFilters] - Filtres par défaut
 * @param {boolean} [options.enabled] - Si la requête doit être exécutée immédiatement
 * @returns {Object} - Données et méthodes pour gérer le tableau de bord
 */
const useAdminDashboard = (options = {}) => {
  const {
    endpoint = '',
    queryKey = 'admin-dashboard',
    defaultFilters = {},
    enabled = true,
  } = options;

  const api = useApi();
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
  
  // Construire les paramètres de requête
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    
    // Pagination
    params.append('page', pagination.page);
    params.append('limit', pagination.pageSize);
    
    // Tri
    if (sorting.length > 0) {
      const sort = sorting[0];
      params.append('sortBy', sort.id);
      params.append('sortOrder', sort.desc ? 'desc' : 'asc');
    }
    
    // Recherche
    if (searchQuery) {
      params.append('search', searchQuery);
    }
    
    // Filtres
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.append(key, value.join(','));
          }
        } else if (typeof value === 'object') {
          // Gérer les plages de dates
          if (value.from) params.append(`${key}From`, value.from);
          if (value.to) params.append(`${key}To`, value.to);
        } else {
          params.append(key, value);
        }
      }
    });
    
    return params.toString();
  }, [pagination, sorting, searchQuery, filters]);
  
  // Requête pour récupérer les données
  const fetchData = async () => {
    const queryParams = buildQueryParams();
    const url = queryParams ? `${endpoint}?${queryParams}` : endpoint;
    
    const response = await api.get(url);
    
    // Mettre à jour la pagination avec le total
    if (response.pagination) {
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
      }));
    }
    
    return response.data || response;
  };
  
  // Utiliser React Query pour gérer les requêtes
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
  
  // Gérer le changement de page
  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      page,
    }));
  };
  
  // Gérer le changement de taille de page
  const handlePageSizeChange = (pageSize) => {
    setPagination(prev => ({
      ...prev,
      pageSize,
      page: 1, // Retour à la première page
    }));
  };
  
  // Gérer le tri
  const handleSortingChange = (newSorting) => {
    setSorting(newSorting);
    setPagination(prev => ({
      ...prev,
      page: 1, // Retour à la première page lors du tri
    }));
  };
  
  // Gérer la recherche
  const handleSearch = (query) => {
    setSearchQuery(query);
    setPagination(prev => ({
      ...prev,
      page: 1, // Retour à la première page lors d'une nouvelle recherche
    }));
  };
  
  // Gérer les filtres
  const handleFilter = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
    setPagination(prev => ({
      ...prev,
      page: 1, // Retour à la première page lors de l'application de nouveaux filtres
    }));
  };
  
  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters(defaultFilters);
    setSearchQuery('');
    setSorting([]);
    setPagination(prev => ({
      ...prev,
      page: 1,
    }));
  };
  
  // Mutation pour mettre à jour un élément
  const updateMutation = useMutation({
    mutationFn: async ({ id, data: updateData }) => {
      const response = await api.put(`${endpoint}/${id}`, updateData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries([queryKey]);
      toast.success('Élément mis à jour avec succès');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Une erreur est survenue');
    },
  });
  
  // Mutation pour supprimer un élément
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`${endpoint}/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries([queryKey]);
      toast.success('Élément supprimé avec succès');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Une erreur est survenue');
    },
  });
  
  // Exposer les méthodes et états
  return {
    // Données
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
    
    // Méthodes
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
    
    // Utilitaires
    hasNextPage: pagination.page * pagination.pageSize < pagination.total,
    hasPreviousPage: pagination.page > 1,
    totalPages: Math.ceil(pagination.total / pagination.pageSize),
  };
};

export default useAdminDashboard;
