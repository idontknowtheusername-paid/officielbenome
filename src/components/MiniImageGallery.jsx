import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import OptimizedListingImage from '@/components/ui/OptimizedListingImage';

const MiniImageGallery = React.memo(({ images = [], title = "Galerie d'images", className = "" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Fonction pour extraire l'URL de l'image - CORRIGÉE
  const extractImageUrl = (image) => {
    if (!image) return null;
    
    // Si c'est une chaîne (URL directe)
    if (typeof image === 'string') return image;
    
    // Si c'est un objet avec une URL
    if (image?.url) return image.url;
    
    // Si c'est un objet avec un fichier (preview)
    if (image?.file) return URL.createObjectURL(image.file);
    
    // Si c'est un objet avec une source
    if (image?.src) return image.src;
    
    // Si c'est un objet avec displayUrl
    if (image?.displayUrl) return image.displayUrl;
    
    return null;
  };

  // Filtrer les images valides
  const validImages = images.filter(img => extractImageUrl(img) !== null);

  // Auto-play au survol
  useEffect(() => {
    if (!isHovered || validImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isHovered, validImages.length]);

  const goToNext = () => {
    if (validImages.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % validImages.length);
    }
  };

  const goToPrevious = () => {
    if (validImages.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
    }
  };

  const goToImage = (index) => {
    if (index >= 0 && index < validImages.length) {
      setCurrentIndex(index);
    }
  };

  // Si pas d'images, afficher un placeholder
  if (!validImages || validImages.length === 0) {
    return (
      <div className={`relative bg-muted flex items-center justify-center ${className}`}>
        <div className="text-center text-muted-foreground">
          <p className="text-xs sm:text-sm">Aucune image</p>
        </div>
      </div>
    );
  }

  const currentImage = validImages[currentIndex];

  return (
    <div 
      className={`relative bg-muted overflow-hidden group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image principale - CORRIGÉE */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full"
        >
          <OptimizedListingImage
            src={currentImage}
            alt={`${title} - Image ${currentIndex + 1}`}
            className="w-full h-full object-cover"
            priority="medium"
            showSkeleton={true}
            enableAnimations={true}
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows - Plus petits sur mobile */}
      {validImages.length > 1 && (
        <>
          {/* Previous Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 sm:p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
            aria-label="Image précédente"
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>

          {/* Next Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 sm:p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
            aria-label="Image suivante"
          >
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
        </>
      )}

      {/* Image indicators - Plus compacts sur mobile */}
      {validImages.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-1.5">
          {validImages.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                goToImage(index);
              }}
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-white' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Aller à l'image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default MiniImageGallery;