import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryConfigs } from '@/lib/queryClient';

export const usePreload = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Précharger les données essentielles
    const preloadData = async () => {
      try {
        // Vérifier que le queryClient est disponible
        if (!queryClient) {
          console.warn('⚠️ QueryClient non disponible pour le préchargement');
          return;
        }

        // Précharger les catégories (si le service existe)
        await queryClient.prefetchQuery({
          queryKey: ['categories'],
          queryFn: async () => {
            // Simuler un appel API pour les catégories
            return [
              { id: 'immobilier', name: 'Immobilier', slug: 'immobilier' },
              { id: 'automobile', name: 'Automobile', slug: 'automobile' },
              { id: 'services', name: 'Services', slug: 'services' },
              { id: 'general', name: 'Général', slug: 'general' }
            ];
          },
          staleTime: queryConfigs.categories.staleTime,
        });

        // Précharger les annonces populaires
        await queryClient.prefetchQuery({
          queryKey: ['listings', 'popular'],
          queryFn: async () => {
            // Simuler un appel API pour les annonces populaires
            return {
              data: [],
              hasMore: false
            };
          },
          staleTime: queryConfigs.listings.staleTime,
        });

        console.log('✅ Préchargement des données terminé');
      } catch (error) {
        console.warn('⚠️ Erreur lors du préchargement:', error);
        // Ne pas propager l'erreur pour éviter de casser l'app
      }
    };

    // Délai pour ne pas bloquer le rendu initial
    const timer = setTimeout(preloadData, 1000);
    
    return () => clearTimeout(timer);
  }, [queryClient]);
}; 