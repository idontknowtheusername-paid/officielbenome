import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useImageLazyLoading } from '@/hooks/useIntersectionObserver';
import { optimizeImageUrl } from '@/utils/imageOptimizer';

const OptimizedImage = ({
  src,
  alt,
  className = "",
  placeholder = null,
  context = 'gallery',
  quality = 'medium',
  onLoad = null,
  onError = null,
  showSkeleton = true,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Optimiser l'URL de l'image
  const optimizedSrc = useMemo(() => {
    if (!src) return null;
    return optimizeImageUrl(src, context, quality);
  }, [src, context, quality]);

  // Lazy loading avec Intersection Observer
  const { elementRef, isIntersecting, imageState, setImageSrc } = useImageLazyLoading({
    threshold: 0.1,
    rootMargin: '100px',
    onLoad: (loadedSrc) => {
      setIsLoaded(true);
      onLoad?.(loadedSrc);
    },
    onError: (errorSrc) => {
      setHasError(true);
      onError?.(errorSrc);
    }
  });

  // Définir la source de l'image quand elle devient visible
  React.useEffect(() => {
    if (isIntersecting && optimizedSrc) {
      setImageSrc(optimizedSrc);
    }
  }, [isIntersecting, optimizedSrc, setImageSrc]);

  // Gérer le clic sur l'image
  const handleClick = useCallback((e) => {
    if (props.onClick) {
      props.onClick(e);
    }
  }, [props.onClick]);

  // Skeleton de chargement
  const ImageSkeleton = () => (
    <div className="animate-pulse bg-muted rounded-lg">
      <div className="w-full h-full bg-gradient-to-r from-muted via-muted/50 to-muted" />
    </div>
  );

  // Placeholder d'erreur
  const ErrorPlaceholder = () => (
    <div className="flex items-center justify-center w-full h-full bg-muted text-muted-foreground">
      <div className="text-center">
        <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm">Image non disponible</p>
      </div>
    </div>
  );

  // Si pas de source, afficher le placeholder d'erreur
  if (!src) {
    return (
      <div className={className}>
        <ErrorPlaceholder />
      </div>
    );
  }

  return (
    <div ref={elementRef} className={`relative overflow-hidden ${className}`}>
      {/* Skeleton de chargement */}
      {showSkeleton && !isLoaded && !hasError && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-10"
          >
            <ImageSkeleton />
          </motion.div>
        </AnimatePresence>
      )}

      {/* Placeholder personnalisé */}
      {placeholder && !isLoaded && !hasError && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-10"
          >
            <img
              src={placeholder}
              alt="Placeholder"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>
      )}

      {/* Image principale */}
      <AnimatePresence>
        {!hasError && (
          <motion.img
            src={imageState.src || placeholder}
            alt={alt}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => {
              if (imageState.src) {
                setIsLoaded(true);
                onLoad?.(imageState.src);
              }
            }}
            onError={() => {
              setHasError(true);
              onError?.(imageState.src);
            }}
            onClick={handleClick}
            loading="lazy"
            {...props}
          />
        )}
      </AnimatePresence>

      {/* Placeholder d'erreur */}
      {hasError && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-20"
          >
            <ErrorPlaceholder />
          </motion.div>
        </AnimatePresence>
      )}

      {/* Indicateur de chargement */}
      {imageState.isLoading && !isLoaded && !hasError && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/10">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

// Composant mémoïsé pour optimiser les re-renders
export default React.memo(OptimizedImage); 