import { useEffect, useRef, useState, useCallback } from 'react';

export const useIntersectionObserver = (options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    root = null,
    triggerOnce = false
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef(null);

  const callback = useCallback((entries) => {
    const [entry] = entries;
    
    if (entry.isIntersecting) {
      setIsIntersecting(true);
      if (triggerOnce && !hasIntersected) {
        setHasIntersected(true);
      }
    } else {
      if (!triggerOnce) {
        setIsIntersecting(false);
      }
    }
  }, [triggerOnce, hasIntersected]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(callback, {
      threshold,
      rootMargin,
      root
    });

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [callback, threshold, rootMargin, root]);

  return [elementRef, isIntersecting];
};

// Hook spécialisé pour le lazy loading d'images
export const useImageLazyLoading = (options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '100px',
    placeholder = null,
    onLoad = null,
    onError = null
  } = options;

  const [imageState, setImageState] = useState({
    src: null,
    isLoading: false,
    hasLoaded: false,
    hasError: false
  });

  const [elementRef, isIntersecting] = useIntersectionObserver({
    threshold,
    rootMargin,
    triggerOnce: true
  });

  const loadImage = useCallback((src) => {
    if (!src || imageState.src === src) return;

    setImageState(prev => ({
      ...prev,
      src,
      isLoading: true,
      hasLoaded: false,
      hasError: false
    }));

    const img = new Image();
    
    img.onload = () => {
      setImageState(prev => ({
        ...prev,
        isLoading: false,
        hasLoaded: true
      }));
      onLoad?.(src);
    };

    img.onerror = () => {
      setImageState(prev => ({
        ...prev,
        isLoading: false,
        hasError: true
      }));
      onError?.(src);
    };

    img.src = src;
  }, [imageState.src, onLoad, onError]);

  // Charger l'image quand elle devient visible
  useEffect(() => {
    if (isIntersecting && imageState.src) {
      loadImage(imageState.src);
    }
  }, [isIntersecting, imageState.src, loadImage]);

  const setImageSrc = useCallback((src) => {
    if (src !== imageState.src) {
      setImageState(prev => ({ ...prev, src }));
    }
  }, [imageState.src]);

  return {
    elementRef,
    isIntersecting,
    imageState,
    setImageSrc,
    loadImage
  };
};

// Hook pour le lazy loading de plusieurs images
export const useMultiImageLazyLoading = (images = [], options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '100px',
    preloadCount = 2
  } = options;

  const [loadedImages, setLoadedImages] = useState(new Set());
  const [loadingImages, setLoadingImages] = useState(new Set());
  const [errorImages, setErrorImages] = useState(new Set());

  const [elementRef, isIntersecting] = useIntersectionObserver({
    threshold,
    rootMargin,
    triggerOnce: true
  });

  const loadImage = useCallback((src) => {
    if (!src || loadedImages.has(src) || loadingImages.has(src)) return;

    setLoadingImages(prev => new Set([...prev, src]));

    const img = new Image();
    
    img.onload = () => {
      setLoadedImages(prev => new Set([...prev, src]));
      setLoadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(src);
        return newSet;
      });
    };

    img.onerror = () => {
      setErrorImages(prev => new Set([...prev, src]));
      setLoadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(src);
        return newSet;
      });
    };

    img.src = src;
  }, [loadedImages, loadingImages]);

  // Charger les images quand elles deviennent visibles
  useEffect(() => {
    if (isIntersecting && images.length > 0) {
      // Charger les premières images
      const imagesToLoad = images.slice(0, preloadCount);
      imagesToLoad.forEach(loadImage);
    }
  }, [isIntersecting, images, preloadCount, loadImage]);

  const isImageLoaded = useCallback((src) => {
    return loadedImages.has(src);
  }, [loadedImages]);

  const isImageLoading = useCallback((src) => {
    return loadingImages.has(src);
  }, [loadingImages]);

  const isImageError = useCallback((src) => {
    return errorImages.has(src);
  }, [errorImages]);

  return {
    elementRef,
    isIntersecting,
    loadedImages,
    loadingImages,
    errorImages,
    isImageLoaded,
    isImageLoading,
    isImageError,
    loadImage
  };
};

// Hook pour le lazy loading avec placeholder
export const useLazyImageWithPlaceholder = (src, placeholderSrc, options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '100px',
    fadeInDuration = 300
  } = options;

  const [imageState, setImageState] = useState({
    currentSrc: placeholderSrc,
    targetSrc: src,
    isTransitioning: false,
    hasLoaded: false
  });

  const [elementRef, isIntersecting] = useIntersectionObserver({
    threshold,
    rootMargin,
    triggerOnce: true
  });

  useEffect(() => {
    if (isIntersecting && src && src !== imageState.targetSrc) {
      setImageState(prev => ({
        ...prev,
        targetSrc: src,
        isTransitioning: true
      }));

      const img = new Image();
      img.onload = () => {
        setImageState(prev => ({
          ...prev,
          currentSrc: src,
          hasLoaded: true,
          isTransitioning: false
        }));
      };
      img.src = src;
    }
  }, [isIntersecting, src, imageState.targetSrc]);

  return {
    elementRef,
    isIntersecting,
    imageState,
    shouldShowPlaceholder: !imageState.hasLoaded || imageState.isTransitioning
  };
}; 