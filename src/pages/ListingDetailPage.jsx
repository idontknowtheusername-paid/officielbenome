import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Heart, Phone, Mail, Calendar, Eye, Share2, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { listingService, messageService } from '@/services/supabase.service';

const ListingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [listing, setListing] = useState(null);
  const [relatedListings, setRelatedListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      setIsLoading(true);
      try {
        // Vérifier que l'ID est valide (peut être un UUID ou un nombre)
        if (!id || id === '' || typeof id !== 'string') {
          throw new Error(`ID d'annonce invalide: "${id}"`);
        }
        
        // Récupérer l'annonce spécifique par ID (peut être un UUID)
        const foundListing = await listingService.getListingById(id);
        
        if (foundListing) {
          setListing(foundListing);
          
          // Afficher un avertissement si l'annonce n'est pas approuvée
          if (foundListing.status !== 'approved') {
            toast({
              title: "Annonce en attente",
              description: "Cette annonce est en cours de modération.",
              variant: "default",
            });
          }
          
          // Récupérer des annonces similaires
          const { data: related } = await listingService.getAllListings({
            category: foundListing.category,
            status: 'approved',
            limit: 10
          });
          
          setRelatedListings(related.filter(l => l.id !== foundListing.id).slice(0, 3));
        } else {
          toast({
            title: "Annonce non trouvée",
            description: "L'annonce que vous recherchez n'existe pas ou a été supprimée.",
            variant: "destructive",
          });
          navigate('/marketplace');
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'annonce:', error);
        console.error('Détails de l\'erreur:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        toast({
          title: "Erreur",
          description: `Impossible de charger les détails de l'annonce: ${error.message}`,
          variant: "destructive",
        });
        navigate('/marketplace');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchListing();
    }
  }, [id, navigate, toast]);

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
      month: 'long',
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

  const getCategoryName = (category) => {
    switch (category) {
      case 'real_estate':
        return 'Immobilier';
      case 'automobile':
        return 'Automobile';
      case 'services':
        return 'Services';
      case 'marketplace':
        return 'Marketplace';
      default:
        return 'Autre';
    }
  };

  const getListingImage = () => {
    if (listing?.images && listing.images.length > 0) {
      return listing.images[0];
    }
    // Image par défaut selon la catégorie
    switch (listing?.category) {
      case 'real_estate':
        return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop';
      case 'automobile':
        return 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop';
      case 'services':
        return 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop';
      default:
        return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop';
    }
  };

  const handleFavorite = async () => {
    if (!user) {
      navigate('/connexion');
      return;
    }
    
    try {
      // Logique pour ajouter/retirer des favoris
      setIsFavorite(!isFavorite);
      toast({
        title: isFavorite ? "Retiré des favoris" : "Ajouté aux favoris",
        description: isFavorite ? "L'annonce a été retirée de vos favoris." : "L'annonce a été ajoutée à vos favoris.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier les favoris.",
        variant: "destructive",
      });
    }
  };

  const handleContact = async (type) => {
    if (!user) {
      navigate('/connexion');
      return;
    }

    // Empêcher l'utilisateur de se contacter lui-même
    if (listing.user_id === user.id) {
      toast({
        title: "Action impossible",
        description: "Vous ne pouvez pas vous contacter vous-même.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (type === 'message') {
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
      } else if (type === 'phone') {
        // Pour l'instant, afficher un message d'information
        toast({
          title: "Contact téléphonique",
          description: "Utilisez la messagerie pour échanger vos coordonnées en toute sécurité.",
        });
      } else if (type === 'email') {
        // Rediriger vers la messagerie
        const conversation = await messageService.createConversation(
          listing.user_id, 
          listing.id
        );
        navigate(`/messages?conversation=${conversation.id}&listing=${listing.id}`);
        
        toast({
          title: "Messagerie",
          description: "Vous avez été redirigé vers la messagerie.",
        });
      }
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la conversation. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing?.title,
        text: listing?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Lien copié",
        description: "Le lien de l'annonce a été copié dans le presse-papiers.",
      });
    }
  };

  const handleReport = () => {
    if (!user) {
      navigate('/connexion');
      return;
    }
    
    toast({
      title: "Signaler",
      description: "Fonctionnalité de signalement en cours de développement.",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-muted-foreground">Chargement de l'annonce...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      {/* Header avec bouton retour */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link to="/" className="hover:text-primary">Accueil</Link>
          <span>/</span>
          <Link to={`/${listing.category === 'real_estate' ? 'immobilier' : listing.category === 'automobile' ? 'automobile' : listing.category === 'services' ? 'services' : 'marketplace'}`} className="hover:text-primary">
            {getCategoryName(listing.category)}
          </Link>
          <span>/</span>
          <span className="text-foreground">{listing.title}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Contenu principal */}
        <div>
          {/* Images */}
          <div className="mb-8">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              <img
                src={getListingImage()}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Informations principales */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>
                      {listing.location && typeof listing.location === 'object' && listing.location.city 
                        ? `${listing.location.city}, ${listing.location.country || ''}` 
                        : 'Localisation non spécifiée'
                      }
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Publié le {formatDate(listing.created_at)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Partager
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReport}
                >
                  <Flag className="h-4 w-4 mr-1" />
                  Signaler
                </Button>
              </div>
            </div>

            {/* Prix */}
            <div className="text-3xl font-bold text-primary mb-4">
              {formatPrice(listing.price)}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {getCategoryIcon(listing.category)} {getCategoryName(listing.category)}
              </Badge>
              {listing.status === 'approved' && (
                <Badge variant="default" className="bg-green-500">Approuvé</Badge>
              )}
            </div>
          </div>

          <Separator className="my-8" />

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <div className="prose prose-invert max-w-none">
              <p className="whitespace-pre-line">{listing.description}</p>
            </div>
          </div>

          {/* Détails spécifiques à la catégorie */}
          {listing.real_estate_details && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Détails immobiliers</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {listing.real_estate_details.type && (
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium">{listing.real_estate_details.type}</p>
                  </div>
                )}
                {listing.real_estate_details.rooms && (
                  <div>
                    <p className="text-sm text-muted-foreground">Pièces</p>
                    <p className="font-medium">{listing.real_estate_details.rooms}</p>
                  </div>
                )}
                {listing.real_estate_details.surface && (
                  <div>
                    <p className="text-sm text-muted-foreground">Surface</p>
                    <p className="font-medium">{listing.real_estate_details.surface} m²</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {listing.automobile_details && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Détails automobile</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {listing.automobile_details.brand && (
                  <div>
                    <p className="text-sm text-muted-foreground">Marque</p>
                    <p className="font-medium">{listing.automobile_details.brand}</p>
                  </div>
                )}
                {listing.automobile_details.model && (
                  <div>
                    <p className="text-sm text-muted-foreground">Modèle</p>
                    <p className="font-medium">{listing.automobile_details.model}</p>
                  </div>
                )}
                {listing.automobile_details.year && (
                  <div>
                    <p className="text-sm text-muted-foreground">Année</p>
                    <p className="font-medium">{listing.automobile_details.year}</p>
                  </div>
                )}
                {listing.automobile_details.fuel && (
                  <div>
                    <p className="text-sm text-muted-foreground">Carburant</p>
                    <p className="font-medium">{listing.automobile_details.fuel}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Carte de contact */}
          <div className="mt-12 mb-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Contacter le vendeur</h3>
              
              {listing.users && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">Vendeur</p>
                  <p className="font-medium">
                    {listing.users.first_name} {listing.users.last_name}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button 
                  className="w-full" 
                  onClick={() => handleContact('message')}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Envoyer un message
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleFavorite}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  {isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                </Button>
              </div>
            </div>
          </div>

          {/* Informations de sécurité */}
          <div className="mb-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Conseils de sécurité</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Rencontrez le vendeur dans un lieu public</li>
                <li>• Vérifiez l'état du bien avant l'achat</li>
                <li>• Évitez les paiements en espèces</li>
                <li>• Signalez tout comportement suspect</li>
              </ul>
            </div>
          </div>

          {/* Annonces similaires */}
          {relatedListings.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Annonces similaires</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedListings.map((relatedListing) => (
                  <Link 
                    key={relatedListing.id} 
                    to={`/annonce/${relatedListing.id}`}
                    className="group block"
                  >
                    <div className="rounded-lg border border-border overflow-hidden transition-all duration-300 hover:border-primary">
                      <div className="aspect-video relative overflow-hidden">
                        <img   
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          alt={relatedListing.title}
                          src={relatedListing.images?.[0] || getListingImage()}
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">
                          {relatedListing.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {relatedListing.description}
                        </p>
                        <p className="text-lg font-bold text-primary mt-2">
                          {formatPrice(relatedListing.price)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ListingDetailPage; 