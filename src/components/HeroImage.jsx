import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useImageLazyLoading } from '@/hooks';
import { optimizeImageUrl } from '@/utils/imageOptimizer';

const HeroImage = ({ 
  src, 
  alt, 
  className = "", 
  fallbackSrc = null,
  showSkeleton = true,
  priority = "high"
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Optimiser l'URL de l'image selon le contexte
  const optimizedSrc = useMemo(() => {
    return optimizeImageUrl(src, 'hero', priority === 'high' ? 'high' : 'medium');
  }, [src, priority]);

  // Fallback intelligent
  const fallbackImage = useMemo(() => {
    if (fallbackSrc) return fallbackSrc;
    
    // Images par défaut selon le contexte
    const defaultImages = {
      hero: "https://images.unsplash.com/photo-1542044896530-05d85be9b11a?q=80&w=2070&auto=format&fit=crop",
      city: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=1920&auto=format&fit=crop",
      business: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop"
    };
    
    return defaultImages.hero;
  }, [fallbackSrc]);

  // Lazy loading avec Intersection Observer
  const { isVisible, ref } = useImageLazyLoading({
    threshold: 0.1,
    rootMargin: '50px'
  });

  // Gestion du chargement
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(false);
  }, []);

  // Image finale à afficher
  const finalSrc = imageError ? fallbackImage : optimizedSrc;

  return (
    <div 
      ref={ref}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Skeleton Loading */}
      {showSkeleton && !imageLoaded && !imageError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-r from-slate-300 via-slate-200 to-slate-300 animate-pulse"
        />
      )}

      {/* Image principale */}
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.img
            key={finalSrc}
            src={finalSrc}
            alt={alt}
            className="w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ 
              opacity: imageLoaded ? 1 : 0.7, 
              scale: imageLoaded ? 1 : 1.05 
            }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ 
              duration: 0.8, 
              ease: "easeOut",
              opacity: { duration: 0.5 }
            }}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading={priority === 'high' ? 'eager' : 'lazy'}
            decoding="async"
          />
        )}
      </AnimatePresence>

      {/* Overlay de transition */}
      {imageLoaded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20"
        />
      )}

      {/* Indicateur de chargement */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full"
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(HeroImage); 