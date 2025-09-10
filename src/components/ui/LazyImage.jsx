import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLazyImage } from '@/hooks/useLazyImage';
import { cn } from '@/lib/utils';

/**
 * Composant d'image avec lazy loading optimisé
 */
const LazyImage = ({
  src,
  alt = '',
  className = '',
  placeholder = null,
  errorPlaceholder = null,
  onLoad = null,
  onError = null,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  const { imgRef, isLoaded, isInView, error } = useLazyImage(src);

  // Gérer les erreurs
  const handleError = () => {
    setImageError(true);
    if (onError) onError();
  };

  // Gérer le chargement
  const handleLoad = () => {
    if (onLoad) onLoad();
  };

  // Placeholder par défaut
  const defaultPlaceholder = (
    <div className={cn(
      "bg-muted animate-pulse flex items-center justify-center",
      className
    )}>
      <div className="w-8 h-8 text-muted-foreground">
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    </div>
  );

  // Placeholder d'erreur par défaut
  const defaultErrorPlaceholder = (
    <div className={cn(
      "bg-muted flex items-center justify-center text-muted-foreground",
      className
    )}>
      <div className="text-center">
        <div className="w-8 h-8 mx-auto mb-2">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <span className="text-xs">Image non disponible</span>
      </div>
    </div>
  );

  // Si erreur, afficher le placeholder d'erreur
  if (error || imageError) {
    return errorPlaceholder || defaultErrorPlaceholder;
  }

  // Si pas encore en vue, afficher le placeholder
  if (!isInView) {
    return (
      <div ref={imgRef} className={className}>
        {placeholder || defaultPlaceholder}
      </div>
    );
  }

  // Si en vue mais pas encore chargé, afficher le placeholder avec animation
  if (!isLoaded) {
    return (
      <div ref={imgRef} className={className}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {placeholder || defaultPlaceholder}
        </motion.div>
      </div>
    );
  }

  // Image chargée, l'afficher avec animation
  return (
    <motion.img
      ref={imgRef}
      src={src}
      alt={alt}
      className={cn("transition-opacity duration-300", className)}
      onLoad={handleLoad}
      onError={handleError}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      {...props}
    />
  );
};

/**
 * Composant d'image lazy loading avec préchargement
 */
export const LazyImageWithPreload = ({
  src,
  preload = false,
  ...props
}) => {
  const [shouldPreload, setShouldPreload] = useState(preload);

  // Précharger l'image si demandé
  React.useEffect(() => {
    if (preload && src) {
      const img = new Image();
      img.src = src;
      setShouldPreload(true);
    }
  }, [preload, src]);

  return (
    <LazyImage
      src={src}
      {...props}
    />
  );
};

/**
 * Composant d'image lazy loading avec cache
 */
export const LazyImageWithCache = ({
  src,
  cacheKey,
  ...props
}) => {
  const [cachedSrc, setCachedSrc] = useState(null);

  // Vérifier le cache
  React.useEffect(() => {
    if (!src) return;

    // Vérifier si l'image est en cache
    const img = new Image();
    img.onload = () => {
      setCachedSrc(src);
    };
    img.onerror = () => {
      setCachedSrc(null);
    };
    img.src = src;
  }, [src]);

  return (
    <LazyImage
      src={cachedSrc || src}
      {...props}
    />
  );
};

export default LazyImage;
