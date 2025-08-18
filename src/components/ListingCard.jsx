import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Heart, Eye, Phone, Mail, Calendar, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import MiniImageGallery from '@/components/MiniImageGallery';
import { useListingImages } from '@/hooks';
import BoostStatus from '@/components/BoostStatus';
import { cn } from '@/lib/utils';
import { messageService } from '@/services';
import { useToast } from '@/components/ui/use-toast';

const ListingCard = ({ listing, onToggleFavorite, showActions = true }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { images } = useListingImages(listing);
  const [isFavorite, setIsFavorite] = useState(listing.is_favorite || false);
  const [isToggling, setIsToggling] = useState(false);
  const [isContacting, setIsContacting] = useState(false);

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

  const handleContactSeller = async (e) => {
    e.stopPropagation();
    
    if (!user) {
      navigate('/connexion');
      return;
    }

    // Empêcher de se contacter soi-même
    if (listing.user_id === user.id) {
      toast({
        title: "Action impossible",
        description: "Vous ne pouvez pas vous contacter vous-même.",
        variant: "destructive",
      });
      return;
    }

    if (isContacting) return;

    try {
      setIsContacting(true);
      
      // Créer ou récupérer une conversation existante
      const conversation = await messageService.createConversation(
        listing.user_id,
        listing.id
      );

      // Rediriger vers la messagerie avec la conversation
      navigate(`/messages?conversation=${conversation.id}&listing=${listing.id}`);
      
      toast({
        title: "Conversation créée",
        description: "Vous avez été redirigé vers la messagerie.",
      });
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la conversation. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsContacting(false);
    }
  };

  const handleCardClick = () => {
    if (!listing.id) {
      return;
    }
    navigate(`/annonce/${listing.id}`);
  };

  // Vérifier si l'annonce est premium
  const isPremium = listing.featured || listing.is_premium || listing.boost_level === 'premium';

  return (
    <motion.div
      onClick={handleCardClick}
      className={cn(
        "group cursor-pointer bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-border/50",
        isPremium && "ring-2 ring-amber-200 shadow-lg"
      )}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Image Container - Hauteur responsive */}
      <div className="relative h-48 sm:h-56 md:h-64 lg:h-72">
        <MiniImageGallery
          images={images || [listing.image]}
          title={listing.title}
          className="h-full w-full object-cover"
        />
        
        {/* Category Icon - Position absolue en haut à gauche */}
        <div className="absolute top-2 left-2">
          <span className="text-2xl sm:text-3xl">{getCategoryIcon(listing.category)}</span>
        </div>

        {/* Status Badge - Position absolue en haut à droite */}
        {listing.status && (
          <div className="absolute top-2 right-2">
            {getStatusBadge(listing.status)}
          </div>
        )}

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
        <div className={cn(
          "text-xl sm:text-2xl font-bold mb-2 sm:mb-3",
          isPremium 
            ? "text-slate-800" // Prix premium en couleur sombre pour un meilleur contraste
            : "text-primary" // Prix normal en bleu
        )}>
          {listing.price ? formatPrice(listing.price) : 'Prix sur demande'}
        </div>
        
        {/* Description - Ligne limitée sur mobile */}
        <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base line-clamp-2 sm:line-clamp-2">
          {listing.description || 'Aucune description disponible'}
        </p>
        
        {/* Badge Premium Simple - Affiché seulement si l'annonce est premium */}
        {isPremium && (
          <div className="mb-3">
            <Badge variant="secondary" className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-300 text-xs font-medium">
              ⭐ Premium
            </Badge>
          </div>
        )}

        {/* Actions - Boutons de contact et favoris */}
        {showActions && (
          <div className="flex space-x-2 mb-3">
            <Button
              onClick={handleContactSeller}
              disabled={isContacting || listing.user_id === user?.id}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {isContacting ? 'Contact...' : 'Contacter'}
            </Button>
            
            <Button
              onClick={handleFavoriteClick}
              disabled={isToggling}
              variant="outline"
              size="sm"
              className="px-3"
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
            </Button>
          </div>
        )}
        
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