import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SimilarListingsCarousel = ({ listings = [], title = "Annonces similaires", currentListing = null }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const carouselRef = useRef(null);
  const autoPlayRef = useRef(null);

  // Nombre de cartes visibles selon la taille d'écran
  const getVisibleCards = () => {
    if (typeof window === 'undefined') return 4;
    if (window.innerWidth < 640) return 2;      // Mobile: 2 carte
    if (window.innerWidth < 768) return 3;      // Small: 3 cartes
    if (window.innerWidth < 1024) return 4;     // Medium: 4 cartes
    return 4;                                    // Large: 4 cartes
  };

  const [visibleCards, setVisibleCards] = useState(getVisibleCards());

  useEffect(() => {
    const handleResize = () => {
      setVisibleCards(getVisibleCards());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, listings.length - visibleCards);

  // Navigation
  const goToNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  // Auto-play
  useEffect(() => {
    if (isAutoPlaying && listings.length > visibleCards) {
      autoPlayRef.current = setInterval(goToNext, 4000);
    }
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, currentIndex, listings.length, visibleCards]);

  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);
  // Formatage du prix
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Si pas d'annonces, afficher un message
  if (!listings || listings.length === 0) {
    return (
      <div className="mt-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <p>Aucune annonce similaire trouvée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      {/* Titre */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>

      {/* Carrousel avec flèches */}
      <div className="relative group">
        {/* Flèche gauche */}
        {listings.length > visibleCards && (
          <Button
            variant="outline"
            size="icon"
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-background/90 backdrop-blur-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-background"
            aria-label="Précédent"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}

        {/* Flèche droite */}
        {listings.length > visibleCards && (
          <Button
            variant="outline"
            size="icon"
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-background/90 backdrop-blur-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-background"
            aria-label="Suivant"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        )}

        {/* Contenu du carrousel */}
        <div
          className="relative overflow-hidden"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          ref={carouselRef}
        >
          <div
            className="flex transition-transform duration-500 ease-out gap-4"
            style={{
              transform: `translateX(-${currentIndex * (100 / visibleCards)}%)`
            }}
          >
            {listings.map((listing) => (
          <Link 
            key={listing.id}
            to={`/annonce/${listing.id}`}
                className="group block flex-shrink-0"
                style={{ width: `calc(${100 / visibleCards}% - ${(visibleCards - 1) * 16 / visibleCards}px)` }}
          >
                <div className="rounded-lg border border-border overflow-hidden transition-all duration-300 hover:border-primary hover:shadow-lg h-full">
              {/* Image */}
              <div className="aspect-video relative overflow-hidden">
                <img   
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  alt={listing.title}
                  src={listing.images?.[0] || '/placeholder-image.jpg'}
                  loading="lazy"
                />
                
                {/* Badge Premium */}
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
        ))}
          </div>
        </div>
      </div>

      {/* Bouton "Voir plus d'annonces" */}
      {currentListing && (
        <div className="mt-8 text-center">
          <Link 
            to={`/marketplace?category=${currentListing.category}`}
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Voir toutes les annonces similaires ({listings.length})
          </Link>
        </div>
      )}
    </div>
  );
};

export default SimilarListingsCarousel;
