import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Users, 
  Edit, 
  MoreVertical, 
  RefreshCw, 
  Trash2,
  TrendingUp,
  Calendar,
  MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';
import MiniImageGallery from '@/components/MiniImageGallery';

const ListingCard = ({ 
  listing, 
  onEdit, 
  onDelete, 
  onRefresh, 
  onBoost,
  showActions = true 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'pending':
        return 'En attente';
      case 'expired':
        return 'Expirée';
      case 'draft':
        return 'Brouillon';
      default:
        return status;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'immobilier':
        return '🏠';
      case 'automobile':
        return '🚗';
      case 'services':
        return '🔧';
      case 'marketplace':
        return '🛍️';
      default:
        return '📦';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="relative">
        <MiniImageGallery 
          images={listing.images || [listing.image]}
          title={listing.title}
          className="h-48"
        />
        <div className="absolute top-2 right-2 flex space-x-1">
          <Badge 
            variant="secondary"
            className={cn("text-xs font-medium", getStatusColor(listing.status))}
          >
            {getStatusText(listing.status)}
          </Badge>
          {listing.featured && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
              ⭐ Premium
            </Badge>
          )}
        </div>
        <div className="absolute top-2 left-2">
          <span className="text-2xl">{getCategoryIcon(listing.category)}</span>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg mb-1 line-clamp-2">{listing.title}</h3>
            <p className="text-primary font-bold text-lg">{listing.price}</p>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {listing.location && typeof listing.location === 'object' && listing.location.city && listing.location.country
                ? `${listing.location.city}, ${listing.location.country}`
                : listing.location?.city || listing.location?.country || 'Localisation non spécifiée'
              }
            </span>
            <span className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {listing.createdAt}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                {listing.views} vues
              </span>
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {listing.contacts} contacts
              </span>
            </div>
            {listing.boosted && (
              <Badge variant="outline" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Boosté
              </Badge>
            )}
          </div>

          {showActions && (
            <div className="flex space-x-2 pt-2 border-t">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={() => onEdit?.(listing)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Modifier
              </Button>
              
              {listing.status === 'active' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onBoost?.(listing)}
                  className="flex-1"
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Booster
                </Button>
              )}
              
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onRefresh?.(listing)}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onDelete?.(listing)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ListingCard; 