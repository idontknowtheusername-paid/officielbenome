import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Heart, Eye, Phone, Mail, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ListingCard = ({ listing, onToggleFavorite, showActions = true }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
        return <Badge variant="default" className="bg-green-500">Approuvé</Badge>;
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
    if (onToggleFavorite) {
      await onToggleFavorite(listing.id);
    }
  };

  const handleCardClick = () => {
    console.log('🔍 ListingCard click - listing.id:', listing.id, 'Type:', typeof listing.id);
    
    if (!listing.id) {
      console.error('❌ Listing sans ID:', listing);
      return;
    }
    
    navigate(`/annonce/${listing.id}`);
  };

  const getListingImage = () => {
    // Utiliser l'image principale ou une image par défaut
    if (listing.images && listing.images.length > 0) {
      return listing.images[0];
    }
    
    // Images par défaut selon la catégorie
    const defaultImages = {
      real_estate: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop',
      automobile: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop',
      services: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      marketplace: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop'
    };
    
    return defaultImages[listing.category] || defaultImages.marketplace;
  };

  const getListingDetails = () => {
    const category = listing.category;
    
    switch (category) {
      case 'real_estate':
        const realEstate = listing.real_estate_details || {};
        return {
          type: realEstate.type || 'Propriété',
          rooms: realEstate.rooms ? `${realEstate.rooms} pièces` : null,
          surface: realEstate.surface ? `${realEstate.surface}m²` : null,
          bedrooms: realEstate.bedrooms ? `${realEstate.bedrooms} chambres` : null,
          bathrooms: realEstate.bathrooms ? `${realEstate.bathrooms} salles de bain` : null
        };
      
      case 'automobile':
        const auto = listing.automobile_details || {};
        return {
          type: auto.type || 'Véhicule',
          brand: auto.brand,
          model: auto.model,
          year: auto.year,
          mileage: auto.mileage ? `${auto.mileage}km` : null,
          fuel: auto.fuel
        };
      
      case 'services':
        const service = listing.service_details || {};
        return {
          type: service.type || 'Service',
          duration: service.duration,
          availability: service.availability
        };
      
      default:
        return {
          type: 'Produit',
          condition: listing.product_details?.condition
        };
    }
  };

  const details = getListingDetails();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-card rounded-lg shadow-lg overflow-hidden hover:shadow-primary/20 transition-all duration-300 glassmorphic-card cursor-pointer group"
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="relative h-56 bg-muted overflow-hidden">
        <img  
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          alt={listing.title}
          src={getListingImage()}
          loading="lazy"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-2">
                  <Badge variant="secondary" className="bg-black/70 text-white">
          {getCategoryIcon(listing.category)} {listing.category === 'real_estate' ? 'Immobilier' : listing.category === 'automobile' ? 'Automobile' : listing.category === 'services' ? 'Services' : 'Marketplace'}
        </Badge>
          {getStatusBadge(listing.status)}
        </div>
        
        {/* Favorite Button */}
        {showActions && (
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors duration-200"
          >
            <Heart 
              className={`h-5 w-5 ${listing.is_favorite ? 'fill-red-500 text-red-500' : 'text-white'}`} 
            />
          </button>
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
            {listing.location && typeof listing.location === 'object' && listing.location.city 
              ? `${listing.location.city}, ${listing.location.country || ''}` 
              : 'Localisation non spécifiée'
            }
          </span>
        </div>
        
        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 h-12 overflow-hidden line-clamp-2">
          {listing.description}
        </p>
        
        {/* Details spécifiques à la catégorie */}
        <div className="flex flex-wrap gap-2 mb-4">
          {details.type && (
            <Badge variant="outline" className="text-xs">
              {details.type}
            </Badge>
          )}
          {details.rooms && (
            <Badge variant="outline" className="text-xs">
              {details.rooms}
            </Badge>
          )}
          {details.surface && (
            <Badge variant="outline" className="text-xs">
              {details.surface}
            </Badge>
          )}
          {details.brand && (
            <Badge variant="outline" className="text-xs">
              {details.brand}
            </Badge>
          )}
          {details.year && (
            <Badge variant="outline" className="text-xs">
              {details.year}
            </Badge>
          )}
        </div>
        
        {/* Price and Actions */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-2xl font-bold text-primary">
              {formatPrice(listing.price)}
            </p>
            <p className="text-xs text-muted-foreground">
              Publié le {formatDate(listing.created_at)}
            </p>
          </div>
          
          {showActions && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Eye className="mr-1 h-4 w-4" />
                Voir
              </Button>
              <Button variant="outline" size="sm">
                <Phone className="mr-1 h-4 w-4" />
                Contacter
              </Button>
            </div>
          )}
        </div>
        
        {/* User Info */}
        {listing.users && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">
                    {listing.users.first_name?.[0]}{listing.users.last_name?.[0]}
                  </span>
                </div>
                <div className="ml-2">
                  <p className="text-sm font-medium">
                    {listing.users.first_name} {listing.users.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Membre depuis {formatDate(listing.users.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ListingCard; 