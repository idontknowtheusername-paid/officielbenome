import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  Zap, 
  ArrowLeft,
  Eye,
  Heart,
  MessageSquare,
  Star,
  Clock,
  MapPin,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { listingService, boostService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

function BoostPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch user's listings
  const { data: listings, isLoading, isError } = useQuery({
    queryKey: ['userListings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await listingService.getUserListings(user.id);
    },
    enabled: !!user?.id
  });

  // Fetch boost packages
  const { data: packages } = useQuery({
    queryKey: ['boostPackages'],
    queryFn: async () => {
      return await boostService.getBoostPackages();
    }
  });

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

  const handleBoostListing = (listingId) => {
    navigate(`/booster-annonce/${listingId}`);
  };

  const filteredListings = listings?.filter(listing =>
    listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.category?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-4">Connexion requise</h1>
          <p className="text-muted-foreground mb-6">
            Vous devez être connecté pour booster vos annonces.
          </p>
          <Button onClick={() => navigate('/connexion')}>
            Se connecter
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-slate-50 to-blue-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                ⚡ Booster vos Annonces
              </h1>
              <p className="text-muted-foreground text-lg">
                Augmentez la visibilité de vos annonces et obtenez plus de contacts
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une annonce..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Boost Packages Info */}
        {packages && packages.length > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Packages de Boost Disponibles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{pkg.name}</h3>
                      <Badge variant="default">{pkg.duration_days} jours</Badge>
                    </div>
                    <p className="text-2xl font-bold text-primary mb-2">
                      {formatPrice(pkg.price)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {pkg.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Listings */}
        <Card>
          <CardHeader>
            <CardTitle>Vos Annonces</CardTitle>
            <p className="text-sm text-muted-foreground">
              Sélectionnez une annonce à booster
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Chargement de vos annonces...</span>
              </div>
            ) : isError ? (
              <div className="text-center py-12">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold mb-2">Erreur</h3>
                <p className="text-muted-foreground">
                  Impossible de charger vos annonces
                </p>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold mb-2">
                  {searchTerm ? 'Aucune annonce trouvée' : 'Aucune annonce'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm 
                    ? 'Essayez avec d\'autres mots-clés'
                    : 'Créez votre première annonce pour commencer'
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={() => navigate('/creer-annonce')}>
                    Créer une annonce
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                {filteredListings.map((listing) => (
                  <Card
                    key={listing.id}
                    className="hover:shadow-lg transition-all duration-200"
                  >
                    <CardContent className="p-6">
                      {/* Image */}
                      {listing.images && listing.images.length > 0 && (
                        <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                          {listing.is_boosted && (
                            <Badge
                              className="absolute top-2 right-2 bg-yellow-500"
                            >
                              <Zap className="h-3 w-3 mr-1" />
                              Boosté
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Content */}
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">
                            {listing.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline">{listing.category}</Badge>
                            {listing.location && (
                              <>
                                <span>•</span>
                                <div className="flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {typeof listing.location === 'object' 
                                    ? `${listing.location.city || ''}${listing.location.city && listing.location.country ? ', ' : ''}${listing.location.country || ''}`
                                    : listing.location
                                  }
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-bold text-primary">
                            {formatPrice(listing.price)}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {listing.views || 0}
                            </div>
                            <div className="flex items-center">
                              <Heart className="h-4 w-4 mr-1" />
                              {listing.favorites_count || 0}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Publié le {formatDate(listing.created_at)}
                          </div>
                          <Badge
                            variant={listing.status === 'active' ? 'default' : 'secondary'}
                          >
                            {listing.status === 'active' ? 'Active' : listing.status}
                          </Badge>
                        </div>

                        <Button
                          onClick={() => handleBoostListing(listing.id)}
                          className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                        >
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Booster cette annonce
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="mt-8 bg-gradient-to-br from-primary/10 to-blue-500/10 border-primary/20">
          <CardContent className="p-8 text-center">
            <div className="text-4xl mb-4">💡</div>
            <h3 className="text-2xl font-semibold mb-2">
              Pourquoi booster vos annonces ?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div>
                <div className="text-3xl mb-2">👁️</div>
                <h4 className="font-semibold mb-1">Plus de visibilité</h4>
                <p className="text-sm text-muted-foreground">
                  Votre annonce apparaît en premier
                </p>
              </div>
              <div>
                <div className="text-3xl mb-2">📈</div>
                <h4 className="font-semibold mb-1">Plus de contacts</h4>
                <p className="text-sm text-muted-foreground">
                  Augmentez vos chances de vente
                </p>
              </div>
              <div>
                <div className="text-3xl mb-2">⚡</div>
                <h4 className="font-semibold mb-1">Vente rapide</h4>
                <p className="text-sm text-muted-foreground">
                  Vendez plus rapidement
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default BoostPage;
