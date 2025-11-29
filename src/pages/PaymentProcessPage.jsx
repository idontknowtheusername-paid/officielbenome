import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  CreditCard,
  Smartphone,
  Circle,
  Wifi,
  Shield,
  Lock,
  Download,
  Receipt,
  TrendingUp,
  Zap,
  Star,
  Eye,
  EyeOff,
  RefreshCw,
  X,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { boostService, paymentService } from '@/services';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import PaymentMethodSelector from '@/components/PaymentMethodSelector';

const PaymentProcessPage = () => {
  const { boostId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState('method-selection');
  const [boostData, setBoostData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [progress, setProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);

  useEffect(() => {
    if (boostId) {
      loadBoostData();
    }
  }, [boostId]);

  const loadBoostData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer les données du boost depuis l'état de navigation
      if (location.state?.boostData) {
        setBoostData(location.state.boostData);
      } else {
        // Fallback : récupérer depuis le service
        const boostInfo = await boostService.getBoostStatus(boostId);
        if (boostInfo.currentBoost) {
          setBoostData(boostInfo.currentBoost);
        } else {
          // Si pas de boost actuel, récupérer directement depuis listing_boosts
          const { data: boost, error } = await supabase
            .from('listing_boosts')
            .select(`
              *,
              boost_packages (*)
            `)
            .eq('id', boostId)
            .single();
            
          if (error || !boost) {
            throw new Error('Boost non trouvé');
          }
          
          setBoostData(boost);
        }
      }
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des données du boost');
      toast({
        title: 'Erreur',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodSelected = async (paymentData) => {
    try {
      setCurrentStep('payment-processing');
      setProgress(0);
      
      // Récupérer les données du package
      const packageData = boostData.boost_packages;
      const amount = packageData?.price || 0;
      
      // Créer le paiement
      const paymentResult = await paymentService.createPayment({
        userId: user.id,
        amount: amount,
        currency: 'XOF',
        paymentMethod: paymentData.method,
        boostId: boostData.id,
        packageName: packageData?.name || 'Package Premium',
        listingId: boostData.listing_id,
        description: `Boost ${packageData?.name || 'Premium'}`,
        phoneNumber: paymentData.phoneNumber,
        email: user.email,
        country: paymentData.country,
        cardData: paymentData.cardData
      });

      if (!paymentResult.success) {
        throw new Error('Erreur lors de la création du paiement');
      }

      setProgress(30);

        // Initier le paiement selon la méthode
        let paymentInitiation;
      if (paymentData.method === 'orange_money') {
            paymentInitiation = await paymentService.initiateOrangeMoneyPayment(
              paymentResult.paymentId,
          paymentData.phoneNumber
            );
      } else if (paymentData.method === 'mtn_mobile_money') {
            paymentInitiation = await paymentService.initiateMTNPayment(
              paymentResult.paymentId,
          paymentData.phoneNumber
        );
      } else if (paymentData.method === 'moov_money') {
        paymentInitiation = await paymentService.initiateMoovPayment(
          paymentResult.paymentId, 
          paymentData.phoneNumber
        );
      } else if (paymentData.method === 'card') {
            paymentInitiation = await paymentService.initiateCardPayment(
              paymentResult.paymentId,
          paymentData.cardData
        );
      }

      setProgress(60);

      if (!paymentInitiation.success) {
        throw new Error('Erreur lors de l\'initialisation du paiement');
      }

      setProgress(80);

      // Rediriger vers la page de paiement Kkiapay
      if (paymentInitiation.paymentUrl) {
        // Ouvrir dans une nouvelle fenêtre pour éviter de perdre la session
        window.open(paymentInitiation.paymentUrl, '_blank', 'noopener,noreferrer');
      } else {
        throw new Error('URL de paiement non disponible');
      }

      setProgress(100);
    } catch (error) {
      console.error('Erreur lors du traitement du paiement:', error);
      setError(error.message);
      setCurrentStep('error');
    }
  };

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    setError(null);
    setCurrentStep('method-selection');
  };

  const handleBackToMethodSelection = () => {
    setCurrentStep('method-selection');
    setPaymentData(null);
    setPaymentStatus('pending');
    setError(null);
    setProgress(0);
  };

  const handleViewReceipt = () => {
    setShowReceipt(true);
  };

  const handleDownloadReceipt = async () => {
    try {
      const receiptResult = await paymentService.generateReceipt(paymentData?.paymentId);
      if (receiptResult.success) {
        // Simuler le téléchargement
        const link = document.createElement('a');
        link.href = receiptResult.receiptUrl;
        link.download = `receipt-${boostId}.pdf`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Téléchargement évident - pas de notification
      }
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de télécharger le reçu',
        variant: 'destructive',
      });
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'orange_money':
        return <Circle className="h-6 w-6 text-orange-500" />;
      case 'mtn_mobile_money':
        return <Wifi className="h-6 w-6 text-yellow-500" />;
      case 'card':
        return <CreditCard className="h-6 w-6 text-blue-500" />;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };

  const getPaymentMethodName = (method) => {
    switch (method) {
      case 'orange_money':
        return 'Orange Money';
      case 'mtn_mobile_money':
        return 'MTN Mobile Money';
      case 'card':
        return 'Carte Bancaire';
      default:
        return 'Méthode de paiement';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'processing': return 'text-blue-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-slate-50 to-blue-50/30 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-4">Connexion requise</h1>
          <p className="text-muted-foreground mb-6">
            Vous devez être connecté pour effectuer un paiement.
          </p>
            <Button onClick={() => navigate('/connexion')} className="w-full">
            Se connecter
          </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-slate-50 to-blue-50/30 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-lg font-semibold mb-2">Chargement...</h2>
            <p className="text-muted-foreground">Préparation de votre paiement</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && currentStep === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-slate-50 to-blue-50/30 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">Erreur de paiement</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
            
            {retryCount < 3 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Tentative {retryCount + 1} sur 3
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              {retryCount < 3 && (
                <Button onClick={handleRetry} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
              )}
              <Button onClick={handleBackToMethodSelection} variant="outline" className="w-full">
                Changer de méthode
              </Button>
              <Button onClick={() => navigate(-1)} variant="ghost" className="w-full">
              Retour
            </Button>
          </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-slate-50 to-blue-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="mb-4 hover:bg-white/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              💳 Paiement Sécurisé
          </h1>
          <p className="text-muted-foreground text-lg">
            Finalisez votre achat de boost premium en toute sécurité
          </p>
          </div>
        </motion.div>

        {/* Étapes du processus */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className={`flex items-center ${currentStep === 'method-selection' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                currentStep === 'method-selection' ? 'border-primary bg-primary text-white shadow-lg' : 'border-muted-foreground'
              }`}>
                1
              </div>
              <span className="ml-3 text-sm font-medium hidden sm:block">Méthode de paiement</span>
            </div>
            
            <div className="w-8 h-1 bg-muted-foreground/30"></div>
            
            <div className={`flex items-center ${currentStep === 'payment-processing' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                currentStep === 'payment-processing' ? 'border-primary bg-primary text-white shadow-lg' : 'border-muted-foreground'
              }`}>
                2
              </div>
              <span className="ml-3 text-sm font-medium hidden sm:block">Traitement</span>
            </div>
            
            <div className="w-8 h-1 bg-muted-foreground/30"></div>
            
            <div className={`flex items-center ${currentStep === 'success' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                currentStep === 'success' ? 'border-primary bg-primary text-white shadow-lg' : 'border-muted-foreground'
              }`}>
                3
              </div>
              <span className="ml-3 text-sm font-medium hidden sm:block">Confirmation</span>
            </div>
          </div>
          
          {/* Barre de progression */}
          {currentStep === 'payment-processing' && (
            <div className="max-w-md mx-auto">
              <Progress value={progress} className="h-2" />
              <p className="text-center text-sm text-muted-foreground mt-2">
                {progress}% terminé
              </p>
            </div>
          )}
        </div>

        {/* Contenu des étapes */}
        <AnimatePresence mode="wait">
          {currentStep === 'method-selection' && (
            <motion.div
              key="method-selection"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="max-w-2xl mx-auto"
            >
              <PaymentMethodSelector
                amount={boostData?.boost_packages?.price || 0}
                currency="XOF"
                packageName={boostData?.boost_packages?.name || 'Package Premium'}
                onPaymentMethodSelected={handlePaymentMethodSelected}
                onClose={() => navigate(-1)}
              />
            </motion.div>
          )}

          {currentStep === 'payment-processing' && (
            <motion.div
              key="payment-processing"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="max-w-md mx-auto"
            >
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mb-6"
                  >
                    {getPaymentMethodIcon(paymentData?.method)}
                  </motion.div>
                  
                  <h3 className="text-xl font-semibold mb-2">
                    Traitement en cours...
                  </h3>
                  
                  <p className="text-muted-foreground mb-6">
                    Votre paiement via {getPaymentMethodName(paymentData?.method)} est en cours de traitement.
                  </p>
                  
                  <div className="space-y-3 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Vérification de la transaction</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Confirmation du paiement</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span>Activation de votre boost</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Info className="h-4 w-4" />
                      <span className="text-sm">Ne fermez pas cette page pendant le traitement</span>
                    </div>
                  </div>
                  
                    <Button
                      onClick={handleBackToMethodSelection}
                      variant="outline"
                      size="sm"
                    >
                      Annuler
                    </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-md mx-auto"
            >
              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-xl">
                <CardContent className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="text-6xl mb-4"
                  >
                    🎉
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold text-green-800 mb-2">
                    Paiement réussi !
                  </h3>
                  
                  <p className="text-green-700 mb-6">
                    Votre boost premium a été activé avec succès.
                  </p>
                  
                  <div className="bg-white p-4 rounded-lg border border-green-200 mb-6 shadow-sm">
                    <div className="text-sm text-green-800 space-y-2">
                      <div className="flex justify-between">
                        <span>Package :</span>
                        <span className="font-semibold">{boostData?.boost_packages?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Montant :</span>
                        <span className="font-bold">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(boostData?.boost_packages?.price || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Méthode :</span>
                        <span>{getPaymentMethodName(paymentData?.method)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Button
                      onClick={handleViewReceipt}
                      variant="outline"
                      className="w-full hover:bg-green-50"
                    >
                      <Receipt className="h-4 w-4 mr-2" />
                      Voir le reçu
                    </Button>
                    
                    <Button
                      onClick={() => navigate(`/booster-annonce/${boostData?.listing_id}`)}
                      className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Voir mon boost
                    </Button>
                    
                    <Button
                      onClick={() => navigate('/mes-boosts')}
                      variant="ghost"
                      className="w-full hover:bg-green-50"
                    >
                      Mes boosts
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Informations de sécurité */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-white/50 px-4 py-2 rounded-full border">
            <Shield className="h-4 w-4" />
            <span>Paiement 100% sécurisé SSL</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSecurityInfo(true)}
              className="h-6 w-6 p-0"
            >
              <Info className="h-3 w-3" />
            </Button>
          </div>
        </motion.div>

        {/* Modal du reçu */}
        <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Reçu de paiement
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Numéro de transaction :</span>
                    <span className="font-mono">TXN-{Date.now()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date :</span>
                    <span>{new Date().toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Package :</span>
                    <span>{boostData?.boost_packages?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Montant :</span>
                    <span className="font-bold">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(boostData?.boost_packages?.price || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Méthode :</span>
                    <span>{getPaymentMethodName(paymentData?.method)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleDownloadReceipt}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
                
                <Button
                  onClick={() => setShowReceipt(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Fermer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal d'informations de sécurité */}
        <Dialog open={showSecurityInfo} onOpenChange={setShowSecurityInfo}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Sécurité du paiement
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Chiffrement SSL</h4>
                    <p className="text-sm text-muted-foreground">Vos données sont protégées par un chiffrement de niveau bancaire</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Conformité PCI DSS</h4>
                    <p className="text-sm text-muted-foreground">Nos partenaires de paiement respectent les standards internationaux</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Eye className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Aucun stockage</h4>
                    <p className="text-sm text-muted-foreground">Nous ne stockons jamais vos informations de paiement</p>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => setShowSecurityInfo(false)}
                className="w-full"
              >
                Compris
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PaymentProcessPage;
