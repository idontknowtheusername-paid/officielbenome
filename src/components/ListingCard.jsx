import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Heart, Eye, Phone, Mail, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import MiniImageGallery from '@/components/MiniImageGallery';
import { useListingImages } from '@/hooks';
import PremiumBadge from '@/components/PremiumBadge';
import BoostStatus from '@/components/BoostStatus';
import { cn } from '@/lib/utils';

const ListingCard = ({ listing, onToggleFavorite, showActions = true }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { images } = useListingImages(listing);
  const [isFavorite, setIsFavorite] = useState(listing.is_favorite || false);
  const [isToggling, setIsToggling] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'real_estate':
        return '🏠';
      case 'automobile':
        return '🚗';
      case 'services':
        return '🔧';
      case 'marketplace':
        return '🛍️';
      default:
        return '📋';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="badge-approved">Approuvé</Badge>;
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeté</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Fonction pour afficher les badges premium
  const getPremiumBadges = () => {
    const badges = [];
    
    if (listing.featured) {
      badges.push(
        <PremiumBadge 
          key="featured" 
          type="featured" 
          size="small" 
          className="mr-1"
        />
      );
    }
    
    if (listing.boosted) {
      badges.push(
        <PremiumBadge 
          key="boosted" 
          type="boosted" 
          size="small" 
          className="mr-1"
        />
      );
    }
    
    // Si c'est premium mais pas explicitement featured/boosted
    if (!listing.featured && !listing.boosted && (listing.is_premium || listing.premium)) {
      badges.push(
        <PremiumBadge 
          key="premium" 
          type="premium" 
          size="small" 
          className="mr-1"
        />
      );
    }
    
    return badges;
  };

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    
    if (!user) {
      navigate('/connexion');
      return;
    }

    if (isToggling) return; // Éviter les clics multiples

    try {
      setIsToggling(true);
      
      // Mise à jour optimiste de l'interface
      const newFavoriteState = !isFavorite;
      setIsFavorite(newFavoriteState);
      
      if (onToggleFavorite) {
        await onToggleFavorite(listing.id);
      }
      
      // L'état sera mis à jour par le hook parent
    } catch (error) {
      // En cas d'erreur, remettre l'état précédent
      setIsFavorite(!isFavorite);
      console.error('Erreur lors du basculement des favoris:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const handleCardClick = () => {
    if (!listing.id) {
      return;
    }
    navigate(`/annonce/${listing.id}`);
  };

  // Mettre à jour l'état local quand la prop change
  React.useEffect(() => {
    setIsFavorite(listing.is_favorite || false);
  }, [listing.is_favorite]);

  // Vérifier si l'annonce est premium
  const isPremium = listing.featured || listing.boosted || listing.is_premium || listing.premium;
  
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        "group rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden",
        isPremium 
          ? "bg-gradient-to-br from-amber-50/50 to-yellow-100/50 border-2 border-amber-300/50 shadow-amber-200/50" 
          : "bg-card border border-border/50"
      )}
      onClick={handleCardClick}
    >
      {/* Image - Hauteur responsive */}
      <div className="relative h-40 sm:h-48 md:h-56 bg-muted overflow-hidden">
        <MiniImageGallery 
          images={images}
          title={listing.title}
          className="h-full"
        />
        
        {/* Badges - Plus compacts sur mobile */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 sm:flex-row sm:gap-2">
          <Badge variant="secondary" className="bg-black/70 text-white text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-1.5">
            {getCategoryIcon(listing.category)} {listing.category === 'real_estate' ? 'Immobilier' : listing.category === 'automobile' ? 'Automobile' : listing.category === 'services' ? 'Services' : 'Marketplace'}
          </Badge>
          {getStatusBadge(listing.status)}
        </div>

        {/* Badges Premium - Positionnés en haut à droite */}
        <div className="absolute top-2 right-16 sm:right-20 flex flex-col gap-1">
          {getPremiumBadges()}
        </div>
        
        {/* Favorite Button - Taille adaptée */}
        {showActions && (
          <motion.button
            onClick={handleFavoriteClick}
            disabled={isToggling}
            className={`absolute top-2 right-2 p-1.5 sm:p-2 rounded-full transition-all duration-200 ${
              isFavorite 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-black/20 hover:bg-black/40 text-white'
            } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart 
              className={`h-4 w-4 sm:h-5 sm:w-5 ${isFavorite ? 'fill-current' : ''}`} 
            />
          </motion.button>
        )}
      </div>

      {/* Content - Padding responsive */}
      <div className="p-3 sm:p-4 md:p-6">
        {/* Title - Taille responsive */}
        <h3 className="text-lg sm:text-xl font-semibold mb-2 truncate group-hover:text-primary transition-colors">
          {listing.title}
        </h3>
        
        {/* Location - Icône et texte adaptés */}
        <div className="flex items-center text-muted-foreground mb-2 sm:mb-3">
          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
          <span className="truncate text-sm sm:text-base">
            {listing.location && typeof listing.location === 'object' && listing.location.city && listing.location.country 
              ? `${listing.location.city}, ${listing.location.country}`
              : listing.location?.city || listing.location?.country || 'Localisation non spécifiée'
            }
          </span>
        </div>
        
        {/* Price - Taille responsive */}
        <div className="text-xl sm:text-2xl font-bold text-primary mb-2 sm:mb-3">
          {listing.price ? formatPrice(listing.price) : 'Prix sur demande'}
        </div>
        
        {/* Description - Ligne limitée sur mobile */}
        <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base line-clamp-2 sm:line-clamp-2">
          {listing.description || 'Aucune description disponible'}
        </p>
        
        {/* Footer - Plus compact sur mobile */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
            <span className="text-xs sm:text-sm">
              {listing.created_at ? formatDate(listing.created_at) : 'Date inconnue'}
            </span>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            {listing.views_count > 0 && (
              <div className="flex items-center">
                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                <span className="text-xs sm:text-sm">{listing.views_count}</span>
              </div>
            )}
            
            {listing.favorites_count > 0 && (
              <div className="flex items-center">
                <Heart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                <span className="text-xs sm:text-sm">{listing.favorites_count}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Boost Status - Affiché seulement pour le propriétaire de l'annonce */}
        <BoostStatus 
          listingId={listing.id}
          listing={listing}
          size="small"
          showActions={showActions}
          className="mt-3 pt-3 border-t border-border/20"
        />
      </div>
    </motion.div>
  );
};

export default ListingCard; 