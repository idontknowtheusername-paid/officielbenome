import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ============================================================================
// SERVICE DE GESTION DES PAIEMENTS PREMIUM - VERSION AMÉLIORÉE
// ============================================================================

// Configuration des passerelles de paiement
const PAYMENT_CONFIG = {
  orange_money: {
    name: 'Orange Money',
    apiUrl: process.env.VITE_ORANGE_MONEY_API_URL || 'https://api.orange-money.com',
    timeout: 30000,
    retryAttempts: 3
  },
  mtn_mobile_money: {
    name: 'MTN Mobile Money',
    apiUrl: process.env.VITE_MTN_API_URL || 'https://api.mtn.com',
    timeout: 30000,
    retryAttempts: 3
  },
  card: {
    name: 'Carte Bancaire',
    apiUrl: process.env.VITE_STRIPE_API_URL || 'https://api.stripe.com',
    timeout: 15000,
    retryAttempts: 2
  }
};

// Validation des données de paiement
const validatePaymentData = (paymentData) => {
  const errors = [];

  if (!paymentData.userId) errors.push('ID utilisateur manquant');
  if (!paymentData.amount || paymentData.amount <= 0) errors.push('Montant invalide');
  if (!paymentData.paymentMethod) errors.push('Méthode de paiement manquante');
  if (!paymentData.boostId) errors.push('ID boost manquant');

  // Validation spécifique par méthode
  if (paymentData.paymentMethod === 'orange_money' || paymentData.paymentMethod === 'mtn_mobile_money') {
    if (!paymentData.phoneNumber) errors.push('Numéro de téléphone manquant');
    const phoneRegex = /^(225|00225|\+225)?[0-9]{10}$/;
    if (!phoneRegex.test(paymentData.phoneNumber?.replace(/\s/g, ''))) {
      errors.push('Format de numéro de téléphone invalide');
    }
  }

  if (paymentData.paymentMethod === 'card') {
    if (!paymentData.cardData) errors.push('Données de carte manquantes');
    if (!paymentData.cardData.number) errors.push('Numéro de carte manquant');
    if (!paymentData.cardData.expiry) errors.push('Date d\'expiration manquante');
    if (!paymentData.cardData.cvv) errors.push('Code CVV manquant');
    if (!paymentData.cardData.name) errors.push('Nom sur la carte manquant');
  }

  if (errors.length > 0) {
    throw new Error(`Validation échouée: ${errors.join(', ')}`);
  }
};

// Fonction de retry avec backoff exponentiel
const retryWithBackoff = async (fn, maxAttempts = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts) {
        throw error;
      }
      
      // Backoff exponentiel
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

export const paymentService = {
  // Créer une nouvelle transaction de paiement
  createPayment: async (paymentData) => {
    // Validation des données
    validatePaymentData(paymentData);

    if (!isSupabaseConfigured) {
      console.warn('⚠️ Supabase non configuré, simulation de création de paiement');
      return {
        success: true,
        paymentId: 'test-payment-' + Date.now(),
        message: 'Paiement créé avec succès (mode test)',
        metadata: {
          mode: 'test',
          created_at: new Date().toISOString()
        }
      };
    }

    try {
      // Vérifier si un paiement en cours existe déjà
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id, status, created_at')
        .eq('user_id', paymentData.userId)
        .eq('boost_id', paymentData.boostId)
        .eq('status', 'pending')
        .single();

      if (existingPayment) {
        // Vérifier si le paiement n'est pas expiré (30 minutes)
        const paymentAge = Date.now() - new Date(existingPayment.created_at).getTime();
        if (paymentAge < 30 * 60 * 1000) {
          return {
            success: true,
            paymentId: existingPayment.id,
            message: 'Paiement en cours récupéré',
            metadata: { existing: true }
          };
        }
      }

      const { data, error } = await supabase
        .from('payments')
        .insert({
          user_id: paymentData.userId,
          amount: paymentData.amount,
          currency: paymentData.currency || 'XOF',
          payment_method: paymentData.paymentMethod,
          payment_gateway: paymentData.paymentGateway || paymentData.paymentMethod,
          status: 'pending',
          metadata: {
            boost_id: paymentData.boostId,
            package_name: paymentData.packageName,
            listing_id: paymentData.listingId,
            description: paymentData.description,
            phone_number: paymentData.phoneNumber,
            card_brand: paymentData.cardData?.brand,
            created_at: new Date().toISOString()
          },
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        paymentId: data.id,
        paymentData: data,
        message: 'Paiement créé avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la création du paiement:', error);
      throw new Error(`Erreur de création de paiement: ${error.message}`);
    }
  },

  // Initier un paiement avec Orange Money
  initiateOrangeMoneyPayment: async (paymentId, phoneNumber) => {
    if (!isSupabaseConfigured) {
      console.warn('⚠️ Supabase non configuré, simulation de paiement Orange Money');
      return await retryWithBackoff(async () => {
        // Simulation d'un délai réseau
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulation d'erreur aléatoire (10% de chance)
        if (Math.random() < 0.1) {
          throw new Error('Erreur réseau temporaire');
        }

        return {
          success: true,
          transactionId: 'OM-' + Date.now(),
          status: 'pending',
          message: 'Paiement Orange Money initié (mode test)',
          metadata: {
            phone_number: phoneNumber,
            gateway: 'orange_money',
            initiated_at: new Date().toISOString()
          }
        };
      }, PAYMENT_CONFIG.orange_money.retryAttempts);
    }

    try {
      return await retryWithBackoff(async () => {
        // Appel à l'API Orange Money
        const orangeMoneyResponse = await callOrangeMoneyAPI(paymentId, phoneNumber);
        
        // Mettre à jour le statut du paiement
        const { error: updateError } = await supabase
          .from('payments')
          .update({
            status: 'processing',
            metadata: {
              ...orangeMoneyResponse,
              phone_number: phoneNumber,
              initiated_at: new Date().toISOString(),
              gateway: 'orange_money'
            }
          })
          .eq('id', paymentId);

        if (updateError) throw updateError;

        return {
          success: true,
          transactionId: orangeMoneyResponse.transactionId,
          status: 'processing',
          message: 'Paiement Orange Money initié avec succès',
          metadata: orangeMoneyResponse
        };
      }, PAYMENT_CONFIG.orange_money.retryAttempts);
    } catch (error) {
      console.error('Erreur lors de l\'initiation du paiement Orange Money:', error);
      throw new Error(`Erreur Orange Money: ${error.message}`);
    }
  },

  // Initier un paiement avec MTN Mobile Money
  initiateMTNPayment: async (paymentId, phoneNumber) => {
    if (!isSupabaseConfigured) {
      console.warn('⚠️ Supabase non configuré, simulation de paiement MTN');
      return await retryWithBackoff(async () => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (Math.random() < 0.05) {
          throw new Error('Service MTN temporairement indisponible');
        }

        return {
          success: true,
          transactionId: 'MTN-' + Date.now(),
          status: 'pending',
          message: 'Paiement MTN initié (mode test)',
          metadata: {
            phone_number: phoneNumber,
            gateway: 'mtn_mobile_money',
            initiated_at: new Date().toISOString()
          }
        };
      }, PAYMENT_CONFIG.mtn_mobile_money.retryAttempts);
    }

    try {
      return await retryWithBackoff(async () => {
        const mtnResponse = await callMTNMobileMoneyAPI(paymentId, phoneNumber);
        
        const { error: updateError } = await supabase
          .from('payments')
          .update({
            status: 'processing',
            metadata: {
              ...mtnResponse,
              phone_number: phoneNumber,
              initiated_at: new Date().toISOString(),
              gateway: 'mtn_mobile_money'
            }
          })
          .eq('id', paymentId);

        if (updateError) throw updateError;

        return {
          success: true,
          transactionId: mtnResponse.transactionId,
          status: 'processing',
          message: 'Paiement MTN initié avec succès',
          metadata: mtnResponse
        };
      }, PAYMENT_CONFIG.mtn_mobile_money.retryAttempts);
    } catch (error) {
      console.error('Erreur lors de l\'initiation du paiement MTN:', error);
      throw new Error(`Erreur MTN: ${error.message}`);
    }
  },

  // Initier un paiement par carte
  initiateCardPayment: async (paymentId, cardData) => {
    if (!isSupabaseConfigured) {
      console.warn('⚠️ Supabase non configuré, simulation de paiement carte');
      return await retryWithBackoff(async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (Math.random() < 0.02) {
          throw new Error('Erreur de validation de carte');
        }

        return {
          success: true,
          transactionId: 'CARD-' + Date.now(),
          status: 'processing',
          message: 'Paiement carte initié (mode test)',
          metadata: {
            card_brand: cardData.brand,
            last4: cardData.number.slice(-4),
            gateway: 'stripe',
            initiated_at: new Date().toISOString()
          }
        };
      }, PAYMENT_CONFIG.card.retryAttempts);
    }

    try {
      return await retryWithBackoff(async () => {
        const stripeResponse = await callStripeAPI(paymentId, cardData);
        
        const { error: updateError } = await supabase
          .from('payments')
          .update({
            status: 'processing',
            metadata: {
              ...stripeResponse,
              card_brand: cardData.brand,
              last4: cardData.number.replace(/\s/g, '').slice(-4),
              initiated_at: new Date().toISOString(),
              gateway: 'stripe'
            }
          })
          .eq('id', paymentId);

        if (updateError) throw updateError;

        return {
          success: true,
          transactionId: stripeResponse.transactionId,
          status: 'processing',
          message: 'Paiement carte initié avec succès',
          metadata: stripeResponse
        };
      }, PAYMENT_CONFIG.card.retryAttempts);
    } catch (error) {
      console.error('Erreur lors de l\'initiation du paiement carte:', error);
      throw new Error(`Erreur carte: ${error.message}`);
    }
  },

  // Confirmer un paiement
  confirmPayment: async (paymentId, confirmationData) => {
    if (!isSupabaseConfigured) {
      console.warn('⚠️ Supabase non configuré, simulation de confirmation');
      return {
        success: true,
        message: 'Paiement confirmé (mode test)',
        metadata: {
          confirmed_at: new Date().toISOString(),
          mode: 'test'
        }
      };
    }

    try {
      const { data, error } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          metadata: {
            ...confirmationData,
            confirmed_at: new Date().toISOString()
          }
        })
        .eq('id', paymentId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        paymentData: data,
        message: 'Paiement confirmé avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la confirmation du paiement:', error);
      throw new Error(`Erreur de confirmation: ${error.message}`);
    }
  },

  // Annuler un paiement
  cancelPayment: async (paymentId, reason = 'user_cancelled') => {
    if (!isSupabaseConfigured) {
      return {
        success: true,
        message: 'Paiement annulé (mode test)'
      };
    }

    try {
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          metadata: {
            cancellation_reason: reason,
            cancelled_at: new Date().toISOString()
          }
        })
        .eq('id', paymentId);

      if (error) throw error;

      return {
        success: true,
        message: 'Paiement annulé avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de l\'annulation du paiement:', error);
      throw new Error(`Erreur d'annulation: ${error.message}`);
    }
  },

  // Rembourser un paiement
  refundPayment: async (paymentId, amount, reason = 'user_request') => {
    if (!isSupabaseConfigured) {
      return {
        success: true,
        message: 'Remboursement initié (mode test)',
        refundId: 'refund-' + Date.now()
      };
    }

    try {
      // Créer un enregistrement de remboursement
      const { data, error } = await supabase
        .from('payments')
        .insert({
          user_id: (await supabase.from('payments').select('user_id').eq('id', paymentId).single()).data.user_id,
          amount: -amount, // Montant négatif pour le remboursement
          currency: 'XOF',
          payment_method: 'refund',
          payment_gateway: 'system',
          status: 'completed',
          metadata: {
            original_payment_id: paymentId,
            refund_reason: reason,
            refunded_at: new Date().toISOString()
          },
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        refundId: data.id,
        message: 'Remboursement effectué avec succès'
      };
    } catch (error) {
      console.error('Erreur lors du remboursement:', error);
      throw new Error(`Erreur de remboursement: ${error.message}`);
    }
  },

  // Générer un reçu
  generateReceipt: async (paymentId) => {
    if (!isSupabaseConfigured) {
      return {
        success: true,
        receiptUrl: 'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsO...',
        message: 'Reçu généré (mode test)'
      };
    }

    try {
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (!payment) {
        throw new Error('Paiement non trouvé');
      }

      // Générer le PDF du reçu (simulation)
      const receiptData = {
        paymentId: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        method: payment.payment_method,
        date: payment.completed_at,
        user: payment.user_id
      };

      // En production, utiliser une librairie comme jsPDF
      const receiptUrl = `data:application/pdf;base64,${btoa(JSON.stringify(receiptData))}`;

      return {
        success: true,
        receiptUrl,
        message: 'Reçu généré avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la génération du reçu:', error);
      throw new Error(`Erreur de génération de reçu: ${error.message}`);
    }
  },

  // Obtenir l'historique des paiements d'un utilisateur
  getUserPaymentHistory: async (userId, limit = 10) => {
    if (!isSupabaseConfigured) {
      return {
        success: true,
        payments: [],
        message: 'Historique vide (mode test)'
      };
    }

    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return {
        success: true,
        payments: data || [],
        message: 'Historique récupéré avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      throw new Error(`Erreur d'historique: ${error.message}`);
    }
  },

  // Vérifier le statut d'un paiement
  getPaymentStatus: async (paymentId) => {
    if (!isSupabaseConfigured) {
      return {
        success: true,
        status: 'completed',
        message: 'Statut récupéré (mode test)'
      };
    }

    try {
      const { data, error } = await supabase
        .from('payments')
        .select('status, metadata, created_at, completed_at')
        .eq('id', paymentId)
        .single();

      if (error) throw error;

      return {
        success: true,
        status: data.status,
        metadata: data.metadata,
        created_at: data.created_at,
        completed_at: data.completed_at,
        message: 'Statut récupéré avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du statut:', error);
      throw new Error(`Erreur de statut: ${error.message}`);
    }
  }
};

// ============================================================================
// FONCTIONS D'API SIMULÉES (À REMPLACER PAR LES VRAIES APIS)
// ============================================================================

async function callOrangeMoneyAPI(paymentId, phoneNumber) {
  // Simulation d'appel API Orange Money
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    transactionId: 'OM-' + Date.now(),
    status: 'pending',
    message: 'SMS envoyé pour confirmation'
  };
}

async function callMTNMobileMoneyAPI(paymentId, phoneNumber) {
  // Simulation d'appel API MTN
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    transactionId: 'MTN-' + Date.now(),
    status: 'pending',
    message: 'SMS envoyé pour confirmation'
  };
}

async function callStripeAPI(paymentId, cardData) {
  // Simulation d'appel API Stripe
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    transactionId: 'STRIPE-' + Date.now(),
    status: 'processing',
    message: 'Paiement en cours de traitement'
  };
}
