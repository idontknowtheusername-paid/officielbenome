import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useImagePreloader, useGalleryTouchGestures } from '@/hooks';
import OptimizedImage from '@/components/OptimizedImage';

const ImageGallery = React.memo(({ images = [], title = "Galerie d'images" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const containerRef = useRef(null);

  // Préchargement intelligent des images
  const { isImagePreloaded, getImageLoadingState } = useImagePreloader(images, currentIndex);

  // Gestes tactiles améliorés
  const { touchHandlers, zoomLevel, resetZoom } = useGalleryTouchGestures(
    () => setCurrentIndex((prev) => (prev + 1) % images.length),
    () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length),
    (level) => setIsZoomed(level > 1)
  );

  // Navigation
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goToImage = (index) => {
    setCurrentIndex(index);
  };

  // Gestion du clavier
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isFullscreen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
        case 'Escape':
          e.preventDefault();
          setIsFullscreen(false);
          setIsZoomed(false);
          break;
        case ' ':
          e.preventDefault();
          setIsZoomed(!isZoomed);
          break;
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen, isZoomed, goToNext, goToPrevious]);



  // Zoom et pan
  const handleImageClick = () => {
    if (isFullscreen) {
      setIsZoomed(!isZoomed);
    } else {
      setIsFullscreen(true);
    }
  };

  const handleZoomToggle = () => {
    setIsZoomed(!isZoomed);
  };

  // Si pas d'images, afficher un placeholder
  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-video rounded-lg overflow-hidden bg-muted flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>Aucune image disponible</p>
        </div>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <>
      {/* Galerie principale */}
      <div className="relative">
        {/* Image principale */}
        <div 
          ref={containerRef}
          className="relative aspect-video rounded-lg overflow-hidden bg-muted cursor-pointer group"
          {...touchHandlers}
          onClick={handleImageClick}
        >
          <OptimizedImage
            src={currentImage}
            alt={`${title} - Image ${currentIndex + 1}`}
            className="w-full h-full"
            context="gallery"
            quality="high"
            showSkeleton={true}
          />
          
          {/* Overlay avec contrôles */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
            {/* Bouton plein écran */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={(e) => {
                e.stopPropagation();
                setIsFullscreen(true);
              }}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation par flèches (visible au hover) */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Indicateurs d'images */}
        {images.length > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-primary scale-125' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Aller à l'image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Compteur d'images */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Modal plein écran */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            {...touchHandlers}
          >
            {/* Bouton fermer */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white z-10"
              onClick={() => {
                setIsFullscreen(false);
                setIsZoomed(false);
              }}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Bouton zoom */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-16 bg-black/50 hover:bg-black/70 text-white z-10"
              onClick={handleZoomToggle}
            >
              {isZoomed ? <ZoomOut className="h-6 w-6" /> : <ZoomIn className="h-6 w-6" />}
            </Button>

            {/* Image principale */}
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <OptimizedImage
                src={currentImage}
                alt={`${title} - Image ${currentIndex + 1}`}
                className={`max-w-full max-h-full object-contain transition-transform duration-300 ${
                  isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
                }`}
                context="fullscreen"
                quality="high"
                showSkeleton={false}
                onClick={handleImageClick}
                style={{
                  transform: `scale(${zoomLevel})`,
                  cursor: isZoomed ? 'zoom-out' : 'zoom-in'
                }}
              />
            </div>

            {/* Navigation par flèches */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="lg"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="lg"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            {/* Indicateurs en bas */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-3">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentIndex 
                        ? 'bg-white scale-125' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                    aria-label={`Aller à l'image ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Compteur */}
            <div className="absolute bottom-4 right-4 bg-black/50 text-white text-sm px-3 py-1 rounded">
              {currentIndex + 1} / {images.length}
            </div>

            {/* Instructions */}
            <div className="absolute top-4 left-4 text-white/70 text-sm">
              <p>← → Navigation • Espace Zoom • Échap Fermer</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ImageGallery; 