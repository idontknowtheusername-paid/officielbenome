import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook pour le lazy loading des images avec Intersection Observer
 * @param {string} src - URL de l'image
 * @param {Object} options - Options pour l'Intersection Observer
 * @returns {Object} - { imgRef, isLoaded, isInView, error }
 */
export const useLazyImage = (src, options = {}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(null);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Options par défaut pour l'Intersection Observer
  const defaultOptions = {
    root: null,
    rootMargin: '50px', // Commencer à charger 50px avant que l'image soit visible
    threshold: 0.1,
    ...options
  };

  // Fonction pour charger l'image
  const loadImage = useCallback(() => {
    if (!src || isLoaded) return;

    const img = new Image();
    
    img.onload = () => {
      setIsLoaded(true);
      setError(null);
    };
    
    img.onerror = () => {
      setError('Erreur lors du chargement de l\'image');
      setIsLoaded(false);
    };
    
    img.src = src;
  }, [src, isLoaded]);

  // Configuration de l'Intersection Observer
  useEffect(() => {
    if (!imgRef.current || !src) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            loadImage();
            // Arrêter d'observer une fois que l'image est en vue
            observer.unobserve(entry.target);
          }
        });
      },
      defaultOptions
    );

    observerRef.current = observer;
    observer.observe(imgRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [src, loadImage, defaultOptions]);

  // Nettoyage
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    imgRef,
    isLoaded,
    isInView,
    error
  };
};

/**
 * Hook pour le lazy loading avec préchargement intelligent
 * @param {string} src - URL de l'image
 * @param {boolean} shouldPreload - Si l'image doit être préchargée
 * @returns {Object} - { imgRef, isLoaded, isInView, error, preloadImage }
 */
export const useLazyImageWithPreload = (src, shouldPreload = false) => {
  const [isPreloaded, setIsPreloaded] = useState(false);
  const lazyImage = useLazyImage(src);

  // Préchargement intelligent
  const preloadImage = useCallback(() => {
    if (!src || isPreloaded) return;

    const img = new Image();
    img.onload = () => setIsPreloaded(true);
    img.onerror = () => setIsPreloaded(false);
    img.src = src;
  }, [src, isPreloaded]);

  // Précharger si demandé
  useEffect(() => {
    if (shouldPreload) {
      preloadImage();
    }
  }, [shouldPreload, preloadImage]);

  return {
    ...lazyImage,
    isPreloaded,
    preloadImage
  };
};

/**
 * Hook pour le lazy loading avec cache d'images
 * @param {string} src - URL de l'image
 * @returns {Object} - { imgRef, isLoaded, isInView, error, cachedSrc }
 */
export const useLazyImageWithCache = (src) => {
  const [cachedSrc, setCachedSrc] = useState(null);
  const lazyImage = useLazyImage(cachedSrc || src);

  // Vérifier le cache d'images
  useEffect(() => {
    if (!src) return;

    // Vérifier si l'image est en cache
    const img = new Image();
    img.onload = () => {
      // L'image est en cache, l'utiliser directement
      setCachedSrc(src);
    };
    img.onerror = () => {
      // L'image n'est pas en cache, utiliser le lazy loading
      setCachedSrc(null);
    };
    img.src = src;
  }, [src]);

  return {
    ...lazyImage,
    cachedSrc: cachedSrc || src
  };
};
