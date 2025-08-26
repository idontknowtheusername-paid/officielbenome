import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const SimilarListingsCarousel = ({ listings = [], title = "Annonces similaires" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Configuration du carrousel responsive
  const getItemsPerView = () => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth < 640) return 1; // Mobile: 1 annonce
    if (window.innerWidth < 768) return 2; // Small: 2 annonces
    if (window.innerWidth < 1024) return 3; // Medium: 3 annonces
    return 4; // Large: 4 annonces
  };

  const [itemsPerView, setItemsPerView] = useState(getItemsPerView());
  const maxIndex = Math.max(0, listings.length - itemsPerView);

  // Mettre à jour le nombre d'items visibles selon la taille d'écran
  useEffect(() => {
    const handleResize = () => {
      setItemsPerView(getItemsPerView());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Si moins d'annonces que d'items par vue, pas besoin de carrousel
  if (listings.length <= itemsPerView) {
    return (
      <div className="mt-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {listings.map((listing, index) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
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
        </div>
      </div>
    );
  }

  return (
    <div 
      className="mt-12"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>

      {/* Container du carrousel */}
      <div className="relative overflow-hidden">
        {/* Flèches de navigation sur les annonces */}
        {listings.length > itemsPerView && maxIndex > 0 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 p-0 bg-black/20 hover:bg-black/40 text-white shadow-lg border-0 backdrop-blur-sm"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 p-0 bg-black/20 hover:bg-black/40 text-white shadow-lg border-0 backdrop-blur-sm"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex gap-4"
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              width: `${(listings.length / itemsPerView) * 100}%`,
              display: 'flex',
              gap: '1rem'
            }}
          >
            {listings.map((listing, index) => (
                             <motion.div
                 key={listing.id}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5, delay: index * 0.1 }}
                 className="w-full sm:w-[calc(50%-8px)] md:w-[calc(33.333%-8px)] lg:w-[calc(25%-12px)] flex-shrink-0"
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

      {/* Indicateurs de progression en bas */}
      {listings.length > itemsPerView && maxIndex > 0 && (
        <div className="mt-6 flex justify-center">
          <div className="flex gap-2">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-primary scale-125' 
                    : 'bg-muted hover:bg-muted-foreground'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimilarListingsCarousel;
