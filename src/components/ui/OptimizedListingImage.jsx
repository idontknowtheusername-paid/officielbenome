import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLazyImage } from '@/hooks/useLazyImage';
import { cn } from '@/lib/utils';

/**
 * Composant d'image optimisé spécialement pour les cartes d'annonces
 */
const OptimizedListingImage = ({
  src,
  alt = '',
  className = '',
  placeholder = null,
  errorPlaceholder = null,
  onLoad = null,
  onError = null,
  priority = 'medium', // 'low', 'medium', 'high'
  showSkeleton = true,
  enableAnimations = true,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  
  // Configuration du lazy loading selon la priorité
  const lazyOptions = {
    rootMargin: priority === 'high' ? '50px' : priority === 'medium' ? '100px' : '150px',
    threshold: 0.1
  };

  const { imgRef, isLoaded, isInView, error } = useLazyImage(src, lazyOptions);

  // Gérer les erreurs
  const handleError = useCallback(() => {
    setImageError(true);
    if (onError) onError();
  }, [onError]);

  // Gérer le chargement
  const handleLoad = useCallback(() => {
    if (onLoad) onLoad();
  }, [onLoad]);

  // Placeholder par défaut optimisé pour les cartes
  const defaultPlaceholder = (
    <div className={cn(
      "bg-gradient-to-br from-muted to-muted/50 animate-pulse flex items-center justify-center",
      className
    )}>
      <div className="w-8 h-8 text-muted-foreground/50">
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    </div>
  );

  // Placeholder d'erreur optimisé pour les cartes
  const defaultErrorPlaceholder = (
    <div className={cn(
      "bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center text-muted-foreground/50",
      className
    )}>
      <div className="text-center">
        <div className="w-6 h-6 mx-auto mb-1">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
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
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {placeholder || defaultPlaceholder}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // Image chargée, l'afficher avec animation
  return (
    <AnimatePresence>
      <motion.img
        ref={imgRef}
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-all duration-300",
          enableAnimations && "hover:scale-105",
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        initial={enableAnimations ? { opacity: 0, scale: 1.05 } : { opacity: 0 }}
        animate={enableAnimations ? { 
          opacity: 1, 
          scale: 1 
        } : { opacity: 1 }}
        transition={enableAnimations ? { 
          duration: 0.4, 
          ease: "easeOut" 
        } : { duration: 0.2 }}
        loading={priority === 'high' ? 'eager' : 'lazy'}
        decoding="async"
        {...props}
      />
    </AnimatePresence>
  );
};

/**
 * Composant d'image optimisé pour les galeries d'annonces
 */
export const OptimizedGalleryImage = ({
  src,
  alt = '',
  className = '',
  onLoad = null,
  onError = null,
  ...props
}) => {
  return (
    <OptimizedListingImage
      src={src}
      alt={alt}
      className={cn("rounded-lg", className)}
      priority="medium"
      showSkeleton={true}
      enableAnimations={true}
      onLoad={onLoad}
      onError={onError}
      {...props}
    />
  );
};

/**
 * Composant d'image optimisé pour les images hero
 */
export const OptimizedHeroImage = ({
  src,
  alt = '',
  className = '',
  onLoad = null,
  onError = null,
  ...props
}) => {
  return (
    <OptimizedListingImage
      src={src}
      alt={alt}
      className={cn("rounded-xl", className)}
      priority="high"
      showSkeleton={true}
      enableAnimations={true}
      onLoad={onLoad}
      onError={onError}
      {...props}
    />
  );
};

export default OptimizedListingImage;
