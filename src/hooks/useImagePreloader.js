import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook pour précharger des images en batch
 * @param {Array} imageUrls - URLs des images à précharger
 * @param {Object} options - Options de préchargement
 * @returns {Object} - État du préchargement
 */
export const useImagePreloader = (imageUrls = [], options = {}) => {
  const {
    batchSize = 3, // Nombre d'images à charger simultanément
    delay = 100, // Délai entre les batches (ms)
    priority = 'medium', // 'low', 'medium', 'high'
    onProgress = null,
    onComplete = null,
    onError = null
  } = options;

  const [preloadState, setPreloadState] = useState({
    loaded: new Set(),
    loading: new Set(),
    errors: new Set(),
    progress: 0,
    isComplete: false
  });

  const batchRef = useRef(0);
  const timeoutRef = useRef(null);

  // Fonction pour charger une image
  const loadImage = useCallback((url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        setPreloadState(prev => ({
          ...prev,
          loaded: new Set([...prev.loaded, url]),
          loading: new Set([...prev.loading].filter(u => u !== url))
        }));
        resolve(url);
      };
      
      img.onerror = () => {
        setPreloadState(prev => ({
          ...prev,
          errors: new Set([...prev.errors, url]),
          loading: new Set([...prev.loading].filter(u => u !== url))
        }));
        reject(new Error(`Failed to load image: ${url}`));
      };
      
      img.src = url;
    });
  }, []);

  // Fonction pour charger un batch d'images
  const loadBatch = useCallback(async (urls) => {
    setPreloadState(prev => ({
      ...prev,
      loading: new Set([...prev.loading, ...urls])
    }));

    try {
      await Promise.allSettled(urls.map(loadImage));
    } catch (error) {
      console.warn('Batch loading error:', error);
    }
  }, [loadImage]);

  // Fonction pour démarrer le préchargement
  const startPreloading = useCallback(() => {
    if (imageUrls.length === 0) return;

    setPreloadState({
      loaded: new Set(),
      loading: new Set(),
      errors: new Set(),
      progress: 0,
      isComplete: false
    });

    batchRef.current = 0;

    const processBatches = async () => {
      const batches = [];
      for (let i = 0; i < imageUrls.length; i += batchSize) {
        batches.push(imageUrls.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        await loadBatch(batch);
        
        // Mettre à jour le progrès
        const currentLoaded = preloadState.loaded.size + batch.length;
        const progress = Math.min((currentLoaded / imageUrls.length) * 100, 100);
        
        setPreloadState(prev => ({
          ...prev,
          progress
        }));

        if (onProgress) {
          onProgress(progress, currentLoaded, imageUrls.length);
        }

        // Délai entre les batches (sauf pour le dernier)
        if (batch !== batches[batches.length - 1]) {
          await new Promise(resolve => {
            timeoutRef.current = setTimeout(resolve, delay);
          });
        }
      }

      // Préchargement terminé
      setPreloadState(prev => ({
        ...prev,
        isComplete: true
      }));

      if (onComplete) {
        onComplete(preloadState.loaded.size, preloadState.errors.size);
      }
    };

    processBatches();
  }, [imageUrls, batchSize, delay, loadBatch, onProgress, onComplete, preloadState.loaded.size, preloadState.errors.size]);

  // Démarrer le préchargement automatiquement
  useEffect(() => {
    if (imageUrls.length > 0) {
      startPreloading();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [imageUrls, startPreloading]);

  // Fonctions utilitaires
  const isImageLoaded = useCallback((url) => {
    return preloadState.loaded.has(url);
  }, [preloadState.loaded]);

  const isImageLoading = useCallback((url) => {
    return preloadState.loading.has(url);
  }, [preloadState.loading]);

  const isImageError = useCallback((url) => {
    return preloadState.errors.has(url);
  }, [preloadState.errors]);

  const retryFailedImages = useCallback(() => {
    const failedUrls = Array.from(preloadState.errors);
    if (failedUrls.length > 0) {
      loadBatch(failedUrls);
    }
  }, [preloadState.errors, loadBatch]);

  return {
    ...preloadState,
    isImageLoaded,
    isImageLoading,
    isImageError,
    retryFailedImages,
    startPreloading
  };
};

/**
 * Hook pour précharger les images d'une liste d'annonces
 * @param {Array} listings - Liste des annonces
 * @param {Object} options - Options de préchargement
 * @returns {Object} - État du préchargement
 */
export const useListingsImagePreloader = (listings = [], options = {}) => {
  const {
    maxImages = 20, // Nombre maximum d'images à précharger
    priority = 'medium',
    ...preloaderOptions
  } = options;

  // Extraire les URLs d'images des annonces
  const imageUrls = listings
    .slice(0, maxImages)
    .flatMap(listing => {
      if (!listing.images || !Array.isArray(listing.images)) return [];
      
      return listing.images
        .map(img => {
          if (typeof img === 'string') return img;
          if (img?.url) return img.url;
          if (img?.src) return img.src;
          return null;
        })
        .filter(Boolean);
    });

  return useImagePreloader(imageUrls, {
    ...preloaderOptions,
    priority
  });
};

/**
 * Hook pour précharger les images hero
 * @param {Array} heroListings - Liste des annonces hero
 * @returns {Object} - État du préchargement
 */
export const useHeroImagePreloader = (heroListings = []) => {
  return useListingsImagePreloader(heroListings, {
    maxImages: 6,
    priority: 'high',
    batchSize: 2,
    delay: 50
  });
};