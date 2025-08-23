import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  ArrowRight,
  Home,
  Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { paymentService } from '@/services/payment.service';
import { useToast } from '@/components/ui/use-toast';

const PaymentCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [status, setStatus] = useState('processing');
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    handlePaymentCallback();
  }, []);

  const handlePaymentCallback = async () => {
    try {
      setLoading(true);
      
      // Récupérer les paramètres de l'URL
      const paymentId = searchParams.get('payment_id');
      const transactionId = searchParams.get('transaction_id');
      const status = searchParams.get('status');
      const reference = searchParams.get('reference');

      if (!paymentId) {
        throw new Error('ID de paiement manquant');
      }

      // Vérifier le statut du paiement
      if (status === 'success' || status === 'successful') {
        // Confirmer le paiement
        const confirmationResult = await paymentService.confirmPayment(paymentId, {
          transactionId,
          reference,
          status: 'successful'
        });

        if (confirmationResult.success) {
          setStatus('success');
          setPaymentData(confirmationResult.paymentData);
          
          toast({
            title: '🎉 Paiement réussi !',
            description: 'Votre boost a été activé avec succès.',
          });
        } else {
          throw new Error('Erreur lors de la confirmation du paiement');
        }
      } else if (status === 'failed' || status === 'cancelled') {
        setStatus('failed');
        setError('Le paiement a échoué ou a été annulé');
        
        toast({
          title: '❌ Paiement échoué',
          description: 'Le paiement n\'a pas pu être traité.',
          variant: 'destructive',
        });
      } else {
        // Statut inconnu, vérifier manuellement
        const paymentStatus = await paymentService.getPaymentStatus(paymentId);
        
        if (paymentStatus.status === 'completed') {
          setStatus('success');
          setPaymentData(paymentStatus);
        } else if (paymentStatus.status === 'failed' || paymentStatus.status === 'cancelled') {
          setStatus('failed');
          setError('Le paiement a échoué');
        } else {
          setStatus('pending');
          setError('Le statut du paiement est en attente de confirmation');
        }
      }
    } catch (err) {
      console.error('Erreur callback paiement:', err);
      setStatus('error');
      setError(err.message);
      
      toast({
        title: 'Erreur',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'failed':
      case 'error':
        return <XCircle className="h-16 w-16 text-red-500" />;
      case 'pending':
        return <Clock className="h-16 w-16 text-yellow-500" />;
      default:
        return <AlertCircle className="h-16 w-16 text-blue-500" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'success':
        return 'Paiement réussi !';
      case 'failed':
        return 'Paiement échoué';
      case 'error':
        return 'Erreur de paiement';
      case 'pending':
        return 'Paiement en attente';
      default:
        return 'Traitement en cours...';
    }
  };

  const getStatusDescription = () => {
    switch (status) {
      case 'success':
        return 'Votre boost premium a été activé avec succès.';
      case 'failed':
        return 'Le paiement n\'a pas pu être traité. Veuillez réessayer.';
      case 'error':
        return 'Une erreur s\'est produite lors du traitement du paiement.';
      case 'pending':
        return 'Votre paiement est en cours de traitement.';
      default:
        return 'Vérification du statut de votre paiement...';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-slate-50 to-blue-50/30 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-lg font-semibold mb-2">Vérification du paiement...</h2>
            <p className="text-muted-foreground">Veuillez patienter pendant que nous vérifions votre transaction</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-slate-50 to-blue-50/30">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="shadow-xl border-0">
              <CardContent className="p-8 text-center">
                {/* Icône de statut */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
                  className="mb-6"
                >
                  {getStatusIcon()}
                </motion.div>

                {/* Titre et description */}
                <h1 className="text-2xl font-bold mb-2">
                  {getStatusTitle()}
                </h1>
                
                <p className="text-muted-foreground mb-6">
                  {getStatusDescription()}
                </p>

                {/* Détails du paiement si succès */}
                {status === 'success' && paymentData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6"
                  >
                    <div className="text-sm text-green-800 space-y-2">
                      <div className="flex justify-between">
                        <span>Référence :</span>
                        <span className="font-mono">{paymentData.reference}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Montant :</span>
                        <span className="font-bold">
                          {new Intl.NumberFormat('fr-FR', { 
                            style: 'currency', 
                            currency: paymentData.currency || 'XOF' 
                          }).format(paymentData.amount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Méthode :</span>
                        <span>{paymentData.paymentMethod}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Message d'erreur si échec */}
                {status === 'failed' || status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-red-50 p-4 rounded-lg border border-red-200 mb-6"
                  >
                    <div className="text-sm text-red-800">
                      <p className="font-medium mb-1">Détails de l'erreur :</p>
                      <p>{error}</p>
                    </div>
                  </motion.div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                  {status === 'success' && (
                    <>
                      <Button
                        onClick={() => navigate('/mes-boosts')}
                        className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Voir mes boosts
                      </Button>
                      
                      <Button
                        onClick={() => navigate('/dashboard')}
                        variant="outline"
                        className="w-full"
                      >
                        <Home className="h-4 w-4 mr-2" />
                        Retour au tableau de bord
                      </Button>
                    </>
                  )}

                  {(status === 'failed' || status === 'error') && (
                    <>
                      <Button
                        onClick={() => navigate(-2)}
                        className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Réessayer le paiement
                      </Button>
                      
                      <Button
                        onClick={() => navigate('/')}
                        variant="outline"
                        className="w-full"
                      >
                        <Home className="h-4 w-4 mr-2" />
                        Retour à l'accueil
                      </Button>
                    </>
                  )}

                  {status === 'pending' && (
                    <>
                      <Button
                        onClick={() => window.location.reload()}
                        className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Actualiser le statut
                      </Button>
                      
                      <Button
                        onClick={() => navigate('/')}
                        variant="outline"
                        className="w-full"
                      >
                        <Home className="h-4 w-4 mr-2" />
                        Retour à l'accueil
                      </Button>
                    </>
                  )}
                </div>

                {/* Informations supplémentaires */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-xs text-muted-foreground">
                    Si vous avez des questions, contactez notre support client.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCallbackPage;
