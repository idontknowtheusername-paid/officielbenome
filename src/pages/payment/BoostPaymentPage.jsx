import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Zap, 
  CreditCard, 
  Smartphone,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { listingService, boostService } from '@/services';
import { lygosService } from '@/services/payment/lygos.service';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

function BoostPaymentPage() {
  const navigate = useNavigate();
  const { listingId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentReference, setPaymentReference] = useState(null);

  // Vérifier si on revient d'un paiement
  const reference = searchParams.get('reference');
  const status = searchParams.get('status');

  // Fetch listing
  const { data: listing, isLoading: listingLoading } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      return await listingService.getListingById(listingId);
    },
    enabled: !!listingId
  });

  // Fetch boost packages
  const { data: packagesData } = useQuery({
    queryKey: ['boostPackages'],
    queryFn: async () => {
      return await boostService.getBoostPackages();
    }
  });

  const packages = packagesData?.packages || [];

  // Vérifier le statut du paiement au retour
  useEffect(() => {
    if (reference && status) {
      verifyPaymentStatus(reference);
    }
  }, [reference, status]);

  const verifyPaymentStatus = async (ref) => {
    try {
      setIsProcessing(true);
      const result = await lygosService.verifyPayment(ref);

      if (result.success && result.isPaid) {
        setPaymentStatus('success');
        toast({
          title: '✅ Paiement réussi',
          description: 'Votre annonce a été boostée avec succès',
        });

        // Activer le boost
        const boostId = result.data.metadata?.boostId;
        if (boostId) {
          await boostService.activateBoost(boostId);
        }

        // Rediriger après 3 secondes
        setTimeout(() => {
          navigate(`/annonce/${listingId}`);
        }, 3000);
      } else {
        setPaymentStatus('failed');
        toast({
          title: '❌ Paiement échoué',
          description: 'Le paiement n\'a pas pu être complété',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Erreur vérification paiement:', error);
      setPaymentStatus('error');
      toast({
        title: '❌ Erreur',
        description: 'Impossible de vérifier le statut du paiement',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async (pkg) => {
    if (!user) {
      toast({
        title: '🔒 Connexion requise',
        description: 'Vous devez être connecté pour effectuer un paiement',
        variant: 'destructive'
      });
      navigate('/connexion');
      return;
    }

    try {
      setIsProcessing(true);
      setSelectedPackage(pkg);

      // Créer le boost en attente
      const boostResult = await boostService.purchaseBoost(pkg.id, listingId, user.id);

      if (!boostResult.success) {
        throw new Error(boostResult.message || 'Erreur lors de la création du boost');
      }

      const boostId = boostResult.boostId;

      // Initialiser le paiement Lygos
      const appUrl = window.location.origin;
      const orderId = `BOOST-${boostId}`;
      const paymentData = {
        amount: pkg.price,
        currency: 'XOF',
        description: `Boost ${pkg.name} - ${listing?.title || 'Annonce'}`,
        customerName: user.full_name || user.email,
        customerEmail: user.email,
        customerPhone: user.phone,
        returnUrl: `${appUrl}/paiement/boost/${listingId}?reference=${orderId}&status=success`,
        cancelUrl: `${appUrl}/paiement/boost/${listingId}?status=cancelled`,
        metadata: {
          boostId,
          listingId,
          userId: user.id,
          packageId: pkg.id,
          packageName: pkg.name,
          orderId
        }
      };

      const paymentResult = await lygosService.initializePayment(paymentData);

      console.log('🔍 Résultat paiement:', paymentResult);

      if (!paymentResult.success) {
        throw new Error(paymentResult.message || 'Erreur lors de l\'initialisation du paiement');
      }

      const paymentUrl = paymentResult.data?.paymentUrl;
      console.log('🔗 URL de paiement:', paymentUrl);

      if (!paymentUrl) {
        throw new Error('URL de paiement non reçue de Lygos');
      }

      setPaymentReference(paymentResult.data.reference);

      // Créer un lien temporaire et le cliquer (contourne le blocage des popups)
      const link = document.createElement('a');
      link.href = paymentUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Message pour l'utilisateur
      toast({
        title: '💳 Paiement ouvert',
        description: 'Complétez le paiement dans le nouvel onglet',
      });
      
      setIsProcessing(false);

    } catch (error) {
      console.error('Erreur paiement:', error);
      toast({
        title: '❌ Erreur',
        description: error.message || 'Une erreur est survenue lors du paiement',
        variant: 'destructive'
      });
      setIsProcessing(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Affichage du statut de paiement
  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Paiement réussi !</h2>
            <p className="text-muted-foreground mb-4">
              Votre annonce a été boostée avec succès
            </p>
            <div className="animate-pulse text-sm text-muted-foreground">
              Redirection en cours...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStatus === 'failed' || paymentStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="mb-4">
              <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Paiement échoué</h2>
            <p className="text-muted-foreground mb-6">
              Le paiement n'a pas pu être complété
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate(`/annonce/${listingId}`)}>
                Retour à l'annonce
              </Button>
              <Button onClick={() => window.location.reload()}>
                Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (listingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Annonce introuvable</h2>
            <Button onClick={() => navigate('/booster')}>
              Retour
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-slate-50 to-blue-50/30">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
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

          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            ⚡ Booster votre annonce
          </h1>
          <p className="text-muted-foreground text-lg">
            Choisissez un package pour augmenter la visibilité
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Listing Info */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Votre annonce</CardTitle>
              </CardHeader>
              <CardContent>
                {listing.images && listing.images.length > 0 && (
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="font-semibold text-lg mb-2">{listing.title}</h3>
                <div className="text-2xl font-bold text-primary mb-4">
                  {formatPrice(listing.price)}
                </div>
                <Badge variant="outline">{listing.category}</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Packages */}
          <div className="lg:col-span-2">
            {!lygosService.isConfigured() && (
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Le système de paiement n'est pas encore configuré. Veuillez contacter l'administrateur.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {packages.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={`relative hover:shadow-lg transition-all duration-200 ${
                    pkg.name === 'Premium' ? 'border-primary border-2' : ''
                  }`}
                >
                  {pkg.name === 'Premium' && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                      ⭐ Recommandé
                    </Badge>
                  )}
                  
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{pkg.name}</span>
                      <Zap className="h-5 w-5 text-primary" />
                    </CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="mb-6">
                      <div className="text-3xl font-bold text-primary mb-1">
                        {formatPrice(pkg.price)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Pour {pkg.duration_days} jours
                      </div>
                    </div>

                    {pkg.features && (
                      <ul className="space-y-2 mb-6">
                        {(Array.isArray(pkg.features) ? pkg.features : 
                          typeof pkg.features === 'string' ? JSON.parse(pkg.features) : 
                          Object.values(pkg.features)).map((feature, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <Button
                      onClick={() => handlePayment(pkg)}
                      disabled={isProcessing || !lygosService.isConfigured()}
                      className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                    >
                      {isProcessing && selectedPackage?.id === pkg.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Traitement...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Payer maintenant
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Payment Methods Info */}
            <Card className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  Méthodes de paiement acceptées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl mb-1">📱</div>
                    <div className="text-sm font-medium">Mobile Money</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl mb-1">💳</div>
                    <div className="text-sm font-medium">Carte bancaire</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl mb-1">🏦</div>
                    <div className="text-sm font-medium">Virement</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl mb-1">🔒</div>
                    <div className="text-sm font-medium">Sécurisé</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Paiement sécurisé par Lygos - Tous vos paiements sont protégés
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BoostPaymentPage;
