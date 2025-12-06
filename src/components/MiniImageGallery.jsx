import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import OptimizedListingImage from '@/components/ui/OptimizedListingImage';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder';

// Détecter si on est sur mobile (une seule fois)
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

const MiniImageGallery = React.memo(({ images = [], title = "Galerie d'images", className = "" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Fonction pour extraire l'URL de l'image - mémorisée
  const extractImageUrl = useCallback((image) => {
    if (!image) return null;
    if (typeof image === 'string') return image;
    if (image?.url) return image.url;
    if (image?.file) return URL.createObjectURL(image.file);
    if (image?.src) return image.src;
    if (image?.displayUrl) return image.displayUrl;
    return null;
  }, []);

  // Filtrer les images valides - MÉMORISÉ
  const validImages = useMemo(() =>
    images.filter(img => extractImageUrl(img) !== null),
    [images, extractImageUrl]
  );

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

  // Si pas d'images, afficher le logo MaxiMarket
  if (!validImages || validImages.length === 0) {
    return (
      <ImagePlaceholder
        className={`relative ${className}`}
        size="medium"
        animate={false}
      />
    );
  }

  const currentImage = validImages[currentIndex];

  return (
    <div 
      className={`relative bg-muted overflow-hidden group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image principale - Optimisée (CSS sur mobile, pas de framer-motion) */}
      <div
        key={currentIndex}
        className={`w-full h-full ${isMobile ? 'transition-opacity duration-200' : 'transition-all duration-300'}`}
      >
        <OptimizedListingImage
          src={currentImage}
          alt={`${title} - Image ${currentIndex + 1}`}
          className="w-full h-full object-cover"
          priority="medium"
          showSkeleton={true}
          enableAnimations={!isMobile}
        />
      </div>

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

      {/* Image indicators - Limité à 5 max pour performance */}
      {validImages.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-1.5">
          {validImages.length <= 5 ? (
            // Afficher tous les indicateurs si 5 ou moins
            validImages.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  goToImage(index);
                }}
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-200 ${index === currentIndex
                    ? 'bg-white'
                    : 'bg-white/50 hover:bg-white/75'
                  }`}
                aria-label={`Aller à l'image ${index + 1}`}
              />
            ))
          ) : (
            // Plus de 5 images : afficher compteur simple
            <span className="text-white text-xs bg-black/50 px-2 py-0.5 rounded-full">
              {currentIndex + 1}/{validImages.length}
            </span>
          )}
        </div>
      )}
    </div>
  );
});

export default MiniImageGallery;