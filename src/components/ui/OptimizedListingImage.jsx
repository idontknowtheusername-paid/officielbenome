import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLazyImage } from '@/hooks/useLazyImage';
import { cn } from '@/lib/utils';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder';

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

  // Placeholder par défaut avec logo MaxiMarket
  const defaultPlaceholder = (
    <ImagePlaceholder
      className={cn("w-full h-full", className)}
      size="medium"
      animate={true}
    />
  );

  // Placeholder d'erreur avec logo MaxiMarket (sans animation)
  const defaultErrorPlaceholder = (
    <ImagePlaceholder
      className={cn("w-full h-full", className)}
      size="medium"
      animate={false}
    />
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
