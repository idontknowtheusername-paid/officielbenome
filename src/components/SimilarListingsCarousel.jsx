import React from 'react';
import { Link } from 'react-router-dom';

const SimilarListingsCarousel = ({ listings = [], title = "Annonces similaires", currentListing = null }) => {
  // Formatage du prix
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Limiter à 8 annonces maximum
  const limitedListings = listings.slice(0, 8);

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

      {/* Grille des annonces */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {limitedListings.map((listing) => (
          <Link 
            key={listing.id}
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

      {/* Bouton "Voir plus d'annonces" */}
      {listings.length > 8 && currentListing && (
        <div className="mt-8 text-center">
          <Link 
            to={`/marketplace?category=${currentListing.category}`}
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Voir plus d'annonces similaires ({listings.length - 8} autres)
          </Link>
        </div>
      )}
    </div>
  );
};

export default SimilarListingsCarousel;
