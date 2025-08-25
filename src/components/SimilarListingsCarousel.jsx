import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const SimilarListingsCarousel = ({ listings = [], title = "Annonces similaires" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Configuration du carrousel
  const itemsPerView = 3; // Nombre d'items visibles à la fois
  const maxIndex = Math.max(0, listings.length - itemsPerView);

  // Auto-play toutes les 5 secondes
  useEffect(() => {
    if (!isAutoPlaying || listings.length <= itemsPerView || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % (maxIndex + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, listings.length, itemsPerView, maxIndex, isHovered]);

  // Pause auto-play au survol
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  // Navigation manuelle
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % (maxIndex + 1));
  }, [maxIndex]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + (maxIndex + 1)) % (maxIndex + 1));
  }, [maxIndex]);

  const goToSlide = useCallback((index) => {
    setCurrentIndex(Math.max(0, Math.min(index, maxIndex)));
  }, [maxIndex]);

  // Formatage du prix
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (!listings || listings.length === 0) {
    return null;
  }

  return (
    <div 
      className="mt-12"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        
        {/* Contrôles de navigation */}
        {listings.length > itemsPerView && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevious}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {/* Indicateurs */}
            <div className="flex gap-1">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-primary' 
                      : 'bg-muted hover:bg-muted-foreground'
                  }`}
                />
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={goToNext}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Container du carrousel */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              width: `${(listings.length / itemsPerView) * 100}%`,
              display: 'flex',
              gap: '1.5rem'
            }}
          >
            {listings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="min-w-[300px] flex-shrink-0"
              >
                <Link 
                  to={`/annonce/${listing.id}`}
                  className="group block"
                >
                  <div className="rounded-lg border border-border overflow-hidden transition-all duration-300 hover:border-primary hover:shadow-lg">
                    {/* Image */}
                    <div className="aspect-video relative overflow-hidden">
                      <img   
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        alt={listing.title}
                        src={listing.images?.[0] || '/placeholder-image.jpg'}
                        loading="lazy"
                      />
                      
                      {/* Badge Premium si applicable */}
                      {(listing.is_featured || listing.is_boosted || listing.is_premium) && (
                        <div className="absolute top-2 right-2">
                          <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                            ⭐ Premium
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Contenu */}
                    <div className="p-4">
                      <h3 className="font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">
                        {listing.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {listing.description}
                      </p>
                      
                      {/* Localisation */}
                      {listing.location && (
                        <div className="flex items-center text-xs text-muted-foreground mb-2">
                          <span className="mr-1">📍</span>
                          <span>
                            {listing.location.city && listing.location.country 
                              ? `${listing.location.city}, ${listing.location.country}`
                              : 'Localisation non spécifiée'
                            }
                          </span>
                        </div>
                      )}
                      
                      {/* Prix */}
                      <p className="text-lg font-bold text-primary">
                        {formatPrice(listing.price)}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicateur de progression */}
      {listings.length > itemsPerView && (
        <div className="mt-4 text-center">
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {maxIndex + 1}
          </span>
        </div>
      )}
    </div>
  );
};

export default SimilarListingsCarousel;
