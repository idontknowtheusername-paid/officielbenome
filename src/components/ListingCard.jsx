import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Heart, Eye, Phone, Mail, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import MiniImageGallery from '@/components/MiniImageGallery';
import { useListingImages } from '@/hooks';
import BoostStatus from '@/components/BoostStatus';
import { cn } from '@/lib/utils';


const ListingCard = ({ listing, onToggleFavorite, showActions = true, showNewBadge = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { images } = useListingImages(listing);
  const [isFavorite, setIsFavorite] = useState(listing.is_favorite || false);
  const [isToggling, setIsToggling] = useState(false);
  const formatCurrency = (price, currency = 'XOF') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  const formatPrice = (price) => {
    return formatCurrency(price, listing.currency || 'XOF');
  };

  const formatListingDate = (dateString) => {
    return formatDate(new Date(dateString), 'P');
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
    const baseClasses = "text-xs px-1 py-0.5 sm:px-2 sm:py-1 md:px-3 md:py-1.5 inline-flex items-center whitespace-nowrap";
    
    switch (status) {
      case 'approved':
        return <Badge variant="default" className={`badge-approved ${baseClasses}`}>Approuvé</Badge>;
      case 'pending':
        return <Badge variant="secondary" className={baseClasses}>En attente</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className={baseClasses}>Rejeté</Badge>;
      default:
        return <Badge variant="outline" className={baseClasses}>{status}</Badge>;
    }
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
        <div className="absolute top-2 left-2 flex flex-col gap-1 sm:flex-row sm:gap-2 items-start">
          <div className="flex items-center space-x-2">
            {showNewBadge ? (
              <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 text-xs px-2 py-1 inline-flex items-center whitespace-nowrap shadow-lg shadow-cyan-500/50 animate-pulse">
                <Clock className="h-3 w-3 mr-1" />
                Nouveau
              </Badge>
            ) : (
                <Badge variant="secondary" className="bg-black/70 text-white text-xs px-1 py-0.5 sm:px-2 sm:py-1 md:px-3 md:py-1.5 inline-flex items-center whitespace-nowrap">
                  <span className="inline-flex items-center">
                    {getCategoryIcon(listing.category)} {listing.category === 'real_estate' ? 'Immobilier' : listing.category === 'automobile' ? 'Automobile' : listing.category === 'services' ? 'Services' : 'Marketplace'}
                  </span>
                </Badge>
            )}
            {/*
              Masquer le badge "Approuvé" sur mobile uniquement pour les annonces premium.
              Sur mobile (taille < sm) : si l'annonce est premium et le status est 'approved', ne pas afficher le badge.
              Sur >= sm : afficher normalement.
            */}
            {listing.status === 'approved' && isPremium ? (
              <span className="hidden sm:inline-flex">{getStatusBadge(listing.status)}</span>
            ) : (
              getStatusBadge(listing.status)
            )}
          </div>

          {/* Premium badges - placés ici pour éviter tout chevauchement */}
          {/* Supprimé : Plus de badges premium en haut à gauche, seulement le type d'annonce */}
        </div>

  {/* Premium badges moved to the left container to avoid overlap on mobile */}
        
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

      {/* Content - Padding réduit et compact */}
      <div className="p-2 sm:p-2.5 md:p-3">
        {/* Title - Taille réduite */}
        <h3 className="text-base sm:text-lg font-semibold mb-0.5 truncate group-hover:text-primary transition-colors">
          {listing.title}
        </h3>
        
        {/* Location - Compact */}
        <div className="flex items-center text-muted-foreground mb-0.5 sm:mb-1">
          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="truncate text-xs sm:text-sm">
            {listing.location && typeof listing.location === 'object' && listing.location.city && listing.location.country 
              ? `${listing.location.city}, ${listing.location.country}`
              : listing.location?.city || listing.location?.country || 'Localisation non spécifiée'
            }
          </span>
        </div>
        
        {/* Price - Taille réduite */}
        <div className={cn(
          "text-lg sm:text-xl font-bold mb-1 sm:mb-1.5",
          isPremium 
            ? "text-slate-800"
            : "text-primary"
        )}>
          {listing.price ? formatPrice(listing.price) : 'Prix sur demande'}
        </div>

        {/* Badge Premium Simple - Compact */}
        {isPremium && (
          <div className="mb-1">
            <Badge variant="secondary" className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-300 text-xs font-medium py-0.5 px-2">
              ⭐ Premium
            </Badge>
          </div>
        )}
        
        {/* Footer - Très compact */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="text-xs">
              {listing.created_at ? formatListingDate(listing.created_at) : 'Date inconnue'}
            </span>
          </div>
          
          <div className="flex items-center space-x-1.5">
            {listing.views_count > 0 && (
              <div className="flex items-center">
                <Eye className="h-3 w-3 mr-0.5 flex-shrink-0" />
                <span className="text-xs">{listing.views_count}</span>
              </div>
            )}
            
            {listing.favorites_count > 0 && (
              <div className="flex items-center">
                <Heart className="h-3 w-3 mr-0.5 flex-shrink-0" />
                <span className="text-xs">{listing.favorites_count}</span>
              </div>
            )}
          </div>
        </div>
        

        
        {/* Boost Status - Plus compact */}
        <BoostStatus 
          listingId={listing.id}
          listing={listing}
          size="small"
          showActions={showActions}
          className="mt-1 pt-1 border-t border-border/20"
        />
      </div>
    </motion.div>
  );
};

export default ListingCard; 