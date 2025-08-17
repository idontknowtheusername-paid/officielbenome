import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import OptimizedImage from '@/components/OptimizedImage';

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
      <div className={`relative aspect-video bg-muted flex items-center justify-center ${className}`}>
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Aucune image</p>
        </div>
      </div>
    );
  }

  const currentImage = validImages[currentIndex];

  return (
    <div 
      className={`relative aspect-video bg-muted overflow-hidden group ${className}`}
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
          <OptimizedImage
            src={currentImage}
            alt={`${title} - Image ${currentIndex + 1}`}
            className="w-full h-full"
            context="card"
            quality="medium"
            showSkeleton={true}
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation par flèches (visible au survol) */}
      {validImages.length > 1 && (
        <>
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Indicateurs d'images (visible au survol) */}
      {validImages.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {validImages.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                goToImage(index);
              }}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Aller à l'image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Compteur d'images */}
      {validImages.length > 1 && (
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {currentIndex + 1} / {validImages.length}
        </div>
      )}
    </div>
  );
});

export default MiniImageGallery;