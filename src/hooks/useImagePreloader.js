import { useState, useEffect, useRef, useCallback } from 'react';

export const useImagePreloader = (images, currentIndex) => {
  const [preloadedImages, setPreloadedImages] = useState(new Set());
  const [loadingStates, setLoadingStates] = useState(new Map());
  const abortControllers = useRef(new Map());

  // Nettoyer les contrôleurs d'abort lors du démontage
  useEffect(() => {
    return () => {
      abortControllers.current.forEach(controller => controller.abort());
      abortControllers.current.clear();
    };
  }, []);

  // Précharger les images intelligemment
  useEffect(() => {
    if (!images || images.length === 0) return;

    // Déterminer quelles images précharger
    const imagesToPreload = [
      images[currentIndex], // Image actuelle
      images[(currentIndex + 1) % images.length], // Image suivante
      images[(currentIndex - 1 + images.length) % images.length], // Image précédente
      images[(currentIndex + 2) % images.length], // Image suivante + 1
      images[(currentIndex - 2 + images.length) % images.length] // Image précédente - 1
    ].filter(Boolean);

    imagesToPreload.forEach((src, index) => {
      if (src && !preloadedImages.has(src) && !loadingStates.has(src)) {
        // Annuler le préchargement précédent si existant
        if (abortControllers.current.has(src)) {
          abortControllers.current.get(src).abort();
        }

        // Créer un nouveau contrôleur d'abort
        const controller = new AbortController();
        abortControllers.current.set(src, controller);

        // Marquer comme en cours de chargement
        setLoadingStates(prev => new Map(prev).set(src, 'loading'));

        // Précharger l'image
        const img = new Image();
        img.onload = () => {
          setPreloadedImages(prev => new Set([...prev, src]));
          setLoadingStates(prev => {
            const newMap = new Map(prev);
            newMap.set(src, 'loaded');
            return newMap;
          });
          abortControllers.current.delete(src);
        };
        img.onerror = () => {
          setLoadingStates(prev => {
            const newMap = new Map(prev);
            newMap.set(src, 'error');
            return newMap;
          });
          abortControllers.current.delete(src);
        };
        img.src = src;
      }
    });
  }, [currentIndex, images]);

  // Vérifier si une image est préchargée
  const isImagePreloaded = useCallback((src) => {
    return preloadedImages.has(src);
  }, [preloadedImages]);

  // Obtenir l'état de chargement d'une image
  const getImageLoadingState = useCallback((src) => {
    return loadingStates.get(src) || 'idle';
  }, [loadingStates]);

  // Précharger une image spécifique
  const preloadImage = useCallback((src) => {
    if (src && !preloadedImages.has(src) && !loadingStates.has(src)) {
      const controller = new AbortController();
      abortControllers.current.set(src, controller);

      setLoadingStates(prev => new Map(prev).set(src, 'loading'));

      const img = new Image();
      img.onload = () => {
        setPreloadedImages(prev => new Set([...prev, src]));
        setLoadingStates(prev => {
          const newMap = new Map(prev);
          newMap.set(src, 'loaded');
          return newMap;
        });
        abortControllers.current.delete(src);
      };
      img.onerror = () => {
        setLoadingStates(prev => {
          const newMap = new Map(prev);
          newMap.set(src, 'error');
          return newMap;
        });
        abortControllers.current.delete(src);
      };
      img.src = src;
    }
  }, [preloadedImages, loadingStates]);

  return {
    preloadedImages,
    loadingStates,
    isImagePreloaded,
    getImageLoadingState,
    preloadImage
  };
}; 