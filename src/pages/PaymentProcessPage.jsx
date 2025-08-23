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
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { boostService, paymentService } from '@/services';
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
        }
      }
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des données du boost');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodSelected = async (methodData) => {
    try {
      setPaymentData(methodData);
      setCurrentStep('payment-processing');
      
      // Créer la transaction de paiement
      const paymentResult = await paymentService.createPayment({
        userId: user.id,
        amount: methodData.amount,
        currency: methodData.currency,
        paymentMethod: methodData.method,
        paymentGateway: methodData.method,
        boostId: boostId,
        packageName: methodData.packageName,
        listingId: boostData?.listing_id,
        description: `Boost premium - ${methodData.packageName}`
      });

      if (paymentResult.success) {
        // Initier le paiement selon la méthode
        let paymentInitiation;
        
        switch (methodData.method) {
          case 'orange_money':
            paymentInitiation = await paymentService.initiateOrangeMoneyPayment(
              paymentResult.paymentId,
              methodData.phoneNumber
            );
            break;
          case 'mtn_mobile_money':
            paymentInitiation = await paymentService.initiateMTNPayment(
              paymentResult.paymentId,
              methodData.phoneNumber
            );
            break;
          case 'card':
            paymentInitiation = await paymentService.initiateCardPayment(
              paymentResult.paymentId,
              methodData.cardData
            );
            break;
          default:
            throw new Error('Méthode de paiement non supportée');
        }

        if (paymentInitiation.success) {
          // Simuler le processus de paiement
          await simulatePaymentProcess(paymentResult.paymentId);
        } else {
          throw new Error('Erreur lors de l\'initiation du paiement');
        }
      } else {
        throw new Error('Erreur lors de la création de la transaction');
      }
    } catch (err) {
      setError(err.message || 'Erreur lors du traitement du paiement');
      setCurrentStep('error');
    }
  };

  const simulatePaymentProcess = async (paymentId) => {
    // Simulation du processus de paiement
    setPaymentStatus('processing');
    
    // Attendre quelques secondes pour simuler le traitement
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Simuler la confirmation du paiement
    const confirmationResult = await paymentService.confirmPayment(paymentId, {
      userId: user.id,
      transactionId: `TXN-${Date.now()}`,
      amount: paymentData.amount,
      currency: paymentData.currency,
      paymentMethod: paymentData.method
    });

    if (confirmationResult.success) {
      // Activer le boost
      const boostActivation = await boostService.activateBoost(paymentId, user.id);
      
      if (boostActivation.success) {
        setPaymentStatus('completed');
        setCurrentStep('success');
        
        toast({
          title: 'Paiement réussi !',
          description: 'Votre boost a été activé avec succès.',
        });
      } else {
        throw new Error('Erreur lors de l\'activation du boost');
      }
    } else {
      throw new Error('Erreur lors de la confirmation du paiement');
    }
  };

  const handleBackToMethodSelection = () => {
    setCurrentStep('method-selection');
    setPaymentData(null);
    setPaymentStatus('pending');
    setError(null);
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
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-4">Connexion requise</h1>
          <p className="text-muted-foreground mb-6">
            Vous devez être connecté pour effectuer un paiement.
          </p>
          <Button onClick={() => navigate('/connexion')}>
            Se connecter
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error && currentStep === 'error') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">Erreur de paiement</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleBackToMethodSelection} variant="outline">
              Réessayer
            </Button>
            <Button onClick={() => navigate(-1)}>
              Retour
            </Button>
          </div>
        </div>
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
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            💳 Processus de Paiement
          </h1>
          <p className="text-muted-foreground text-lg">
            Finalisez votre achat de boost premium en toute sécurité
          </p>
        </motion.div>

        {/* Étapes du processus */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${currentStep === 'method-selection' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                currentStep === 'method-selection' ? 'border-primary bg-primary text-white' : 'border-muted-foreground'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Méthode de paiement</span>
            </div>
            
            <div className="w-8 h-1 bg-muted-foreground/30"></div>
            
            <div className={`flex items-center ${currentStep === 'payment-processing' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                currentStep === 'payment-processing' ? 'border-primary bg-primary text-white' : 'border-muted-foreground'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Traitement</span>
            </div>
            
            <div className="w-8 h-1 bg-muted-foreground/30"></div>
            
            <div className={`flex items-center ${currentStep === 'success' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                currentStep === 'success' ? 'border-primary bg-primary text-white' : 'border-muted-foreground'
              }`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium">Confirmation</span>
            </div>
          </div>
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
              className="max-w-md mx-auto text-center"
            >
              <Card>
                <CardContent className="p-8">
                  <div className="mb-6">
                    {getPaymentMethodIcon(paymentData?.method)}
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2">
                    Traitement en cours...
                  </h3>
                  
                  <p className="text-muted-foreground mb-6">
                    Votre paiement via {getPaymentMethodName(paymentData?.method)} est en cours de traitement.
                  </p>
                  
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Vérification de la transaction</p>
                    <p>• Confirmation du paiement</p>
                    <p>• Activation de votre boost</p>
                  </div>
                  
                  <div className="mt-6">
                    <Button
                      onClick={handleBackToMethodSelection}
                      variant="outline"
                      size="sm"
                    >
                      Annuler
                    </Button>
                  </div>
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
              className="max-w-md mx-auto text-center"
            >
              <Card className="border-green-200 bg-green-50/50">
                <CardContent className="p-8">
                  <div className="text-6xl mb-4">🎉</div>
                  
                  <h3 className="text-2xl font-bold text-green-800 mb-2">
                    Paiement réussi !
                  </h3>
                  
                  <p className="text-green-700 mb-6">
                    Votre boost premium a été activé avec succès.
                  </p>
                  
                  <div className="bg-white p-4 rounded-lg border border-green-200 mb-6">
                    <div className="text-sm text-green-800 space-y-1">
                      <p><strong>Package :</strong> {boostData?.boost_packages?.name}</p>
                      <p><strong>Montant :</strong> {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(boostData?.boost_packages?.price || 0)}</p>
                      <p><strong>Méthode :</strong> {getPaymentMethodName(paymentData?.method)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Button
                      onClick={handleViewReceipt}
                      variant="outline"
                      className="w-full"
                    >
                      <Receipt className="h-4 w-4 mr-2" />
                      Voir le reçu
                    </Button>
                    
                    <Button
                      onClick={() => navigate(`/booster-annonce/${boostData?.listing_id}`)}
                      className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Voir mon boost
                    </Button>
                    
                    <Button
                      onClick={() => navigate('/mes-boosts')}
                      variant="ghost"
                      className="w-full"
                    >
                      Mes boosts
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

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
      </div>
    </div>
  );
};

export default PaymentProcessPage;
