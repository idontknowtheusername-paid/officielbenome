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
  priority = 'medium', // 'low', 'medium', 'high'
  fallbackSrc = null,
  // Props pour les animations hero
  enableHeroAnimations = false,
  // Props pour les overlays
  showOverlay = false,
  overlayGradient = 'to-b from-transparent via-transparent to-black/20',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fonction pour extraire l'URL de l'image - CORRIGÉE
  const extractImageUrl = (imageSrc) => {
    if (!imageSrc) return null;
    
    // Si c'est une chaîne (URL directe)
    if (typeof imageSrc === 'string') return imageSrc;
    
    // Si c'est un objet avec une URL
    if (imageSrc?.url) return imageSrc.url;
    
    // Si c'est un objet avec un fichier (preview)
    if (imageSrc?.file) return URL.createObjectURL(imageSrc.file);
    
    // Si c'est un objet avec une source
    if (imageSrc?.src) return imageSrc.src;
    
    // Si c'est un objet avec displayUrl (depuis ListingPreview)
    if (imageSrc?.displayUrl) return imageSrc.displayUrl;
    
    return null;
  };

  // Optimiser l'URL de l'image - CORRIGÉE
  const optimizedSrc = useMemo(() => {
    const imageUrl = extractImageUrl(src);
    if (!imageUrl) return null;
    return optimizeImageUrl(imageUrl, context, quality);
  }, [src, context, quality]);

  // Fallback intelligent
  const fallbackImage = useMemo(() => {
    if (fallbackSrc) return fallbackSrc;
    
    // Images par défaut selon le contexte
    const defaultImages = {
      hero: "https://images.unsplash.com/photo-1542044896530-05d85be9b11a?q=80&w=2070&auto=format&fit=crop",
      city: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=1920&auto=format&fit=crop",
      business: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop"
    };
    
    return defaultImages[context] || defaultImages.hero;
  }, [fallbackSrc, context]);

  // Lazy loading avec Intersection Observer
  const { elementRef, isIntersecting, imageState, setImageSrc } = useImageLazyLoading({
    threshold: 0.1,
    rootMargin: priority === 'high' ? '50px' : '100px',
    onLoad: (loadedSrc) => {
      setIsLoaded(true);
      setHasError(false);
      onLoad?.(loadedSrc);
    },
    onError: (errorSrc) => {
      setHasError(true);
      setIsLoaded(false);
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

  // Image finale à afficher
  const finalSrc = hasError ? fallbackImage : (imageState.src || extractImageUrl(src));

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

  // Vérifier si on a une URL valide
  const hasValidUrl = extractImageUrl(src) !== null;

  return (
    <div ref={elementRef} className={`relative overflow-hidden ${className}`}>
      {/* Skeleton de chargement */}
      {showSkeleton && !isLoaded && !hasError && hasValidUrl && (
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
      {placeholder && !isLoaded && !hasError && hasValidUrl && (
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

      {/* Image principale - CORRIGÉE avec animations hero */}
      <AnimatePresence mode="wait">
        {!hasError && hasValidUrl && (
          <motion.img
            key={finalSrc}
            src={finalSrc}
            alt={alt}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            initial={enableHeroAnimations ? { opacity: 0, scale: 1.1 } : { opacity: 0 }}
            animate={enableHeroAnimations ? { 
              opacity: isLoaded ? 1 : 0.7, 
              scale: isLoaded ? 1 : 1.05 
            } : { opacity: isLoaded ? 1 : 0 }}
            exit={enableHeroAnimations ? { opacity: 0, scale: 0.95 } : { opacity: 0 }}
            transition={enableHeroAnimations ? { 
              duration: 0.8, 
              ease: "easeOut",
              opacity: { duration: 0.5 }
            } : { duration: 0.3 }}
            onLoad={() => {
              if (finalSrc) {
                setIsLoaded(true);
                setHasError(false);
                onLoad?.(finalSrc);
              }
            }}
            onError={() => {
              setHasError(true);
              setIsLoaded(false);
              onError?.(finalSrc);
            }}
            onClick={handleClick}
            loading={priority === 'high' ? 'eager' : 'lazy'}
            decoding="async"
            {...props}
          />
        )}
      </AnimatePresence>

      {/* Overlay de transition pour hero */}
      {showOverlay && isLoaded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className={`absolute inset-0 bg-gradient-${overlayGradient}`}
        />
      )}

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
      {imageState.isLoading && !isLoaded && !hasError && hasValidUrl && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
          />
        </div>
      )}

      {/* Message si pas d'URL valide */}
      {!hasValidUrl && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-muted">
          <div className="text-center text-muted-foreground">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Format d'image non supporté</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant mémoïsé pour optimiser les re-renders
export default React.memo(OptimizedImage); 