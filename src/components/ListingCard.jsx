import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Heart, Eye, Phone, Mail, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import MiniImageGallery from '@/components/MiniImageGallery';
import { useListingImages } from '@/hooks';

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

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group bg-card rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-border/50 overflow-hidden"
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="relative h-56 bg-muted overflow-hidden">
        <MiniImageGallery 
          images={images}
          title={listing.title}
          className="h-full"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-2">
          <Badge variant="secondary" className="bg-black/70 text-white">
            {getCategoryIcon(listing.category)} {listing.category === 'real_estate' ? 'Immobilier' : listing.category === 'automobile' ? 'Automobile' : listing.category === 'services' ? 'Services' : 'Marketplace'}
          </Badge>
          {getStatusBadge(listing.status)}
        </div>
        
        {/* Favorite Button - AMÉLIORÉ */}
        {showActions && (
          <motion.button
            onClick={handleFavoriteClick}
            disabled={isToggling}
            className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 ${
              isFavorite 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-black/20 hover:bg-black/40 text-white'
            } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart 
              className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} 
            />
          </motion.button>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-semibold mb-2 truncate group-hover:text-primary transition-colors">
          {listing.title}
        </h3>
        
        {/* Location */}
        <div className="flex items-center text-muted-foreground mb-3">
          <MapPin className="h-4 w-4 mr-2" />
          <span className="truncate">
            {listing.location && typeof listing.location === 'object' && listing.location.city && listing.location.country 
              ? `${listing.location.city}, ${listing.location.country}`
              : listing.location?.city || listing.location?.country || 'Localisation non spécifiée'
            }
          </span>
        </div>
        
        {/* Price */}
        <div className="text-2xl font-bold text-primary mb-3">
          {listing.price ? formatPrice(listing.price) : 'Prix sur demande'}
        </div>
        
        {/* Description */}
        <p className="text-muted-foreground mb-4 line-clamp-2">
          {listing.description || 'Aucune description disponible'}
        </p>
        
        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {listing.created_at ? formatDate(listing.created_at) : 'Date inconnue'}
          </div>
          
          <div className="flex items-center space-x-2">
            {listing.views_count > 0 && (
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                {listing.views_count}
              </div>
            )}
            
            {listing.favorites_count > 0 && (
              <div className="flex items-center">
                <Heart className="h-4 w-4 mr-1" />
                {listing.favorites_count}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ListingCard; 