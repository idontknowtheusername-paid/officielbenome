import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Heart, Phone, Mail, Calendar, Eye, Flag, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { listingService, messageService } from '@/services';
import ImageGallery from '@/components/ImageGallery';
import ShareListing from '@/components/ShareListing';
import CommentsSection from '@/components/CommentsSection';
import { useListingImages } from '@/hooks';
import ReportModal from '@/components/ReportModal';

const ListingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [listing, setListing] = useState(null);
  const [relatedListings, setRelatedListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [showSecurityDetails, setShowSecurityDetails] = useState(false);
  const [showSecurityTooltip, setShowSecurityTooltip] = useState(false);
  const { images } = useListingImages(listing);

  useEffect(() => {
    const fetchListing = async () => {
      setIsLoading(true);
      try {
        // Verifier que l'ID est valide (peut etre un UUID ou un nombre)
        if (!id || id === '' || typeof id !== 'string') {
          throw new Error(`ID d'annonce invalide: "${id}"`);
        }
        
        // Recuperer l'annonce specifique par ID (peut etre un UUID)
        const foundListing = await listingService.getListingById(id);
        
        if (foundListing) {
          setListing(foundListing);
          // Incrementer les vues de facon asynchrone (sans bloquer)
          try { listingService.incrementViews(foundListing.id); } catch {}
          
          // Afficher un avertissement si l'annonce n'est pas approuvee
          if (foundListing.status !== 'approved') {
            toast({
              title: "Annonce en attente",
              description: "Cette annonce est en cours de modération.",
              variant: "default",
            });
          }
          
          // Recuperer des annonces similaires
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

  // Injecter un contexte global pour le chatbot quand l'annonce est chargee
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && listing) {
        const locationCity = (listing?.location && typeof listing.location === 'object') ? (listing.location.city || '') : '';
        window.__MAXIMARKET_CONTEXT = {
          listing: {
            id: listing.id,
            title: listing.title,
            price: listing.price,
            locationCity,
            sellerId: listing.user_id,
            category: listing.category,
          }
        };
      }
    } catch {}
    return () => {
      try {
            if (typeof window !== 'undefined' && window.__MAXIMARKET_CONTEXT) {
      delete window.__MAXIMARKET_CONTEXT;
        }
      } catch {}
    };
  }, [listing]);

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
    // WhatsApp et téléphone : pas de compte requis
    if (type === 'whatsapp' || type === 'phone') {
      // Logique intelligente pour le numero de telephone
      const phoneNumber = listing.contact_info?.phone || listing.users?.phone_number;
      
      if (!phoneNumber) {
        toast({
          title: "Pas de numéro disponible",
          description: "Aucun numéro de téléphone n'est disponible pour cette annonce.",
          variant: "destructive",
        });
        return;
      }

      // Nettoyer le numero (enlever espaces, tirets, etc.)
      const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
      
      // Ajouter l'indicatif pays si necessaire (pour le Senegal)
      const formattedNumber = cleanNumber.startsWith('+') ? cleanNumber : 
                             cleanNumber.startsWith('221') ? `+${cleanNumber}` :
                             `+221${cleanNumber}`;

      if (type === 'phone') {
        // Ouvrir l'appel telephonique
        window.open(`tel:${formattedNumber}`, '_blank');
        
        toast({
          title: "Appel en cours",
          description: `Appel vers ${formattedNumber}`,
        });
      } else if (type === 'whatsapp') {
        // Message pre-rempli pour WhatsApp
        const message = encodeURIComponent(
          `Bonjour ! Je suis intéressé(e) par votre annonce "${listing.title}".\n\nPouvez-vous me donner plus d'informations ?`
        );
        
        // Ouvrir WhatsApp
        window.open(`https://wa.me/${formattedNumber}?text=${message}`, '_blank');
        
        toast({
          title: "WhatsApp ouvert",
          description: `Conversation WhatsApp avec ${formattedNumber}`,
        });
      }
      return;
    }

    // Message interne : compte requis
    if (type === 'message') {
      if (!user) {
        toast({
          title: "Connexion requise",
          description: "Connectez-vous pour envoyer un message privé au vendeur.",
          variant: "default",
        });
        navigate('/connexion');
        return;
      }

      // Empecher l'utilisateur de se contacter lui-meme
      if (listing.user_id === user.id) {
        toast({
          title: "Action impossible",
          description: "Vous ne pouvez pas vous contacter vous-même.",
          variant: "destructive",
        });
        return;
      }

      // Verifier que l'annonce a un user_id valide (sauf pour les tests)
      const isTestListing = !listing.user_id || listing.user_id === 'test-user-1';
      
      if (isTestListing) {
        toast({
          title: "Annonce de test",
          description: "Cette annonce est en mode test. Les fonctionnalités de contact ne sont pas disponibles.",
          variant: "default",
        });
        return;
      }

      try {
        // Creer ou recuperer une conversation existante
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
      }
    }
  };

  const handleReport = () => {
    if (!user) {
      navigate('/connexion');
      return;
    }
    
    setIsReportModalOpen(true);
  };

  const handleReportSubmitted = () => {
    // Optionnel : logique supplémentaire après signalement
    console.log('Signalement soumis avec succès');
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
            <ImageGallery 
              images={images} 
              title={listing.title}
            />
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
                  <ShareListing listing={listing} variant="compact" />
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
                <Badge variant="default" className="badge-approved">Approuvé</Badge>
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

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  onClick={() => handleContact('whatsapp')}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                
                <Button 
                  className="w-full" 
                  onClick={() => handleContact('phone')}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Appeler
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleContact('message')}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Message
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleFavorite}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  {isFavorite ? 'Retirer' : 'Favoris'}
                </Button>
              </div>
              
              {/* Indication pour les visiteurs non connectés */}
              {!user && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    💡 <strong>Conseil :</strong> Vous pouvez contacter le vendeur directement par WhatsApp ou téléphone sans créer de compte. 
                    Connectez-vous uniquement si vous souhaitez utiliser la messagerie privée.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Informations de sécurité - Version compacte */}
          <div className="mb-6">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-amber-600 dark:text-amber-400 text-lg mr-2">⚠️</span>
                  <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">Conseils de sécurité</h3>
                </div>
                <button 
                  onClick={() => setShowSecurityDetails(!showSecurityDetails)}
                  className="text-xs text-amber-600 dark:text-amber-400 hover:underline"
                >
                  {showSecurityDetails ? 'Masquer' : 'Voir plus'}
                </button>
              </div>
              
              <div className="text-xs text-amber-700 dark:text-amber-300 mb-2">
                🤝 Lieu public • 🔍 Vérifiez le bien • 💰 Paiement sécurisé • 🚨 Signalez les problèmes
              </div>
              
              {showSecurityDetails && (
                <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-700">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <strong className="text-amber-800 dark:text-amber-200">Rencontre :</strong>
                      <div className="text-amber-700 dark:text-amber-300">Lieu public, évitez les heures tardives</div>
                    </div>
                    <div>
                      <strong className="text-amber-800 dark:text-amber-200">Vérification :</strong>
                      <div className="text-amber-700 dark:text-amber-300">Inspectez, testez, demandez les documents</div>
                    </div>
                    <div>
                      <strong className="text-amber-800 dark:text-amber-200">Paiement :</strong>
                      <div className="text-amber-700 dark:text-amber-300">Espèces privilégiées, méfiez-vous des prix bas</div>
                    </div>
                    <div>
                      <strong className="text-amber-800 dark:text-amber-200">Signalement :</strong>
                      <div className="text-amber-700 dark:text-amber-300">Conservez les communications, signalez les abus</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ALTERNATIVE 2 : Badge Flottant Intelligent (à décommenter si vous préférez) */}
          {/*
          <div className="fixed bottom-4 right-4 z-50">
            <div className="relative">
              <button
                onClick={() => setShowSecurityTooltip(!showSecurityTooltip)}
                className="bg-amber-500 hover:bg-amber-600 text-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110"
                title="Conseils de sécurité"
              >
                <span className="text-lg">⚠️</span>
              </button>
              
              {showSecurityTooltip && (
                <div className="absolute bottom-full right-0 mb-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-amber-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Sécurité</h3>
                    <button 
                      onClick={() => setShowSecurityTooltip(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <div>🤝 <strong>Rencontre :</strong> Lieu public, heures de jour</div>
                    <div>🔍 <strong>Vérification :</strong> Inspectez, testez, documents</div>
                    <div>💰 <strong>Paiement :</strong> Espèces privilégiées</div>
                    <div>🚨 <strong>Signalement :</strong> Conservez les preuves</div>
                  </div>
                </div>
              )}
            </div>
          </div>
          */}

          {/* Section Commentaires et Avis */}
          <div className="mb-8">
            <CommentsSection 
              listingId={listing.id}
              listing={listing}
              className="mt-8"
            />
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
                          src={relatedListing.images?.[0] || images[0]}
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

      {/* Modal de signalement */}
      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        listing={listing}
        onReportSubmitted={handleReportSubmitted} 
      />
    </motion.div>
  );
};

export default ListingDetailPage; 