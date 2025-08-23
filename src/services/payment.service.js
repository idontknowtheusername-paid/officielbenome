import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { kkiapayService } from './kkiapay.service';

// Détecter l'environnement
const isProduction = process.env.NODE_ENV === 'production' && process.env.VITE_KKIAPAY_PUBLIC_KEY;

export const paymentService = {
  // Créer une nouvelle transaction de paiement
  createPayment: async (paymentData) => {
    if (!isSupabaseConfigured) {
      return {
        success: true,
        paymentId: 'test-payment-' + Date.now(),
        message: 'Paiement créé avec succès (mode test)'
      };
    }

    try {
      const { data, error } = await supabase
        .from('payments')
        .insert({
          user_id: paymentData.userId,
          amount: paymentData.amount,
          currency: paymentData.currency || 'XOF',
          payment_method: paymentData.paymentMethod,
          payment_gateway: isProduction ? 'kkiapay' : 'simulation',
          status: 'pending',
          metadata: {
            boost_id: paymentData.boostId,
            package_name: paymentData.packageName,
            listing_id: paymentData.listingId,
            description: paymentData.description,
            phone_number: paymentData.phoneNumber,
            email: paymentData.email,
            country: paymentData.country || 'CI',
            created_at: new Date().toISOString()
          },
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
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
      throw new Error(`Erreur de création de paiement: ${error.message}`);
    }
  },

  // Initier un paiement avec Orange Money
  initiateOrangeMoneyPayment: async (paymentId, phoneNumber) => {
    if (isProduction) {
      try {
        const paymentData = await getPaymentData(paymentId);
        const userData = await getUserData(paymentData.user_id);
        
        const kkiapayResult = await kkiapayService.initializePayment({
          amount: paymentData.amount,
          email: userData.email,
          phone: phoneNumber,
          name: userData.full_name || userData.email,
          country: paymentData.metadata?.country || 'CI',
          payment_method: 'orange_money',
          callback_url: `${window.location.origin}/payment-callback?payment_id=${paymentId}`,
          boost_id: paymentData.metadata?.boost_id,
          listing_id: paymentData.metadata?.listing_id,
          package_name: paymentData.metadata?.package_name,
          user_id: paymentData.user_id
        });

        await updatePaymentStatus(paymentId, 'processing', {
          kkiapay_transaction_id: kkiapayResult.transactionId,
          kkiapay_reference: kkiapayResult.reference,
          payment_url: kkiapayResult.paymentUrl,
          initiated_at: new Date().toISOString()
        });

        return {
          success: true,
          paymentUrl: kkiapayResult.paymentUrl,
          transactionId: kkiapayResult.transactionId,
          status: 'processing',
          message: 'Paiement Orange Money initié avec succès via Kkiapay'
        };
      } catch (error) {
        throw new Error(`Erreur Orange Money: ${error.message}`);
      }
    } else {
      // Simulation en développement
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        success: true,
        transactionId: 'OM-' + Date.now(),
        status: 'pending',
        message: 'Paiement Orange Money initié (mode test)'
      };
    }
  },

  // Initier un paiement avec MTN Mobile Money
  initiateMTNPayment: async (paymentId, phoneNumber) => {
    if (isProduction) {
      try {
        const paymentData = await getPaymentData(paymentId);
        const userData = await getUserData(paymentData.user_id);
        
        const kkiapayResult = await kkiapayService.initializePayment({
          amount: paymentData.amount,
          email: userData.email,
          phone: phoneNumber,
          name: userData.full_name || userData.email,
          country: paymentData.metadata?.country || 'CI',
          payment_method: 'mtn_mobile_money',
          callback_url: `${window.location.origin}/payment-callback?payment_id=${paymentId}`,
          boost_id: paymentData.metadata?.boost_id,
          listing_id: paymentData.metadata?.listing_id,
          package_name: paymentData.metadata?.package_name,
          user_id: paymentData.user_id
        });

        await updatePaymentStatus(paymentId, 'processing', {
          kkiapay_transaction_id: kkiapayResult.transactionId,
          kkiapay_reference: kkiapayResult.reference,
          payment_url: kkiapayResult.paymentUrl,
          initiated_at: new Date().toISOString()
        });

        return {
          success: true,
          paymentUrl: kkiapayResult.paymentUrl,
          transactionId: kkiapayResult.transactionId,
          status: 'processing',
          message: 'Paiement MTN initié avec succès via Kkiapay'
        };
      } catch (error) {
        throw new Error(`Erreur MTN: ${error.message}`);
      }
    } else {
      // Simulation en développement
      await new Promise(resolve => setTimeout(resolve, 1500));
      return {
        success: true,
        transactionId: 'MTN-' + Date.now(),
        status: 'pending',
        message: 'Paiement MTN initié (mode test)'
      };
    }
  },

  // Initier un paiement par carte
  initiateCardPayment: async (paymentId, cardData) => {
    if (isProduction) {
      try {
        const paymentData = await getPaymentData(paymentId);
        const userData = await getUserData(paymentData.user_id);
        
        const kkiapayResult = await kkiapayService.initializePayment({
          amount: paymentData.amount,
          email: userData.email,
          phone: userData.phone || '',
          name: cardData.name,
          country: paymentData.metadata?.country || 'CI',
          payment_method: 'card',
          callback_url: `${window.location.origin}/payment-callback?payment_id=${paymentId}`,
          boost_id: paymentData.metadata?.boost_id,
          listing_id: paymentData.metadata?.listing_id,
          package_name: paymentData.metadata?.package_name,
          user_id: paymentData.user_id
        });

        await updatePaymentStatus(paymentId, 'processing', {
          kkiapay_transaction_id: kkiapayResult.transactionId,
          kkiapay_reference: kkiapayResult.reference,
          payment_url: kkiapayResult.paymentUrl,
          card_brand: cardData.brand,
          last4: cardData.number.replace(/\s/g, '').slice(-4),
          initiated_at: new Date().toISOString()
        });

        return {
          success: true,
          paymentUrl: kkiapayResult.paymentUrl,
          transactionId: kkiapayResult.transactionId,
          status: 'processing',
          message: 'Paiement carte initié avec succès via Kkiapay'
        };
      } catch (error) {
        throw new Error(`Erreur carte: ${error.message}`);
      }
    } else {
      // Simulation en développement
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        success: true,
        transactionId: 'CARD-' + Date.now(),
        status: 'processing',
        message: 'Paiement carte initié (mode test)'
      };
    }
  },

  // Confirmer un paiement
  confirmPayment: async (paymentId, confirmationData) => {
    if (isProduction) {
      try {
        const paymentData = await getPaymentData(paymentId);
        const kkiapayTransactionId = paymentData.metadata?.kkiapay_transaction_id;
        
        if (!kkiapayTransactionId) {
          throw new Error('ID de transaction Kkiapay manquant');
        }

        const verificationResult = await kkiapayService.verifyPayment(kkiapayTransactionId);
        
        if (verificationResult.status === 'successful') {
          await updatePaymentStatus(paymentId, 'completed', {
            ...verificationResult,
            confirmed_at: new Date().toISOString()
          });

          return {
            success: true,
            paymentData: verificationResult,
            message: 'Paiement confirmé avec succès via Kkiapay'
          };
        } else {
          throw new Error(`Paiement non réussi: ${verificationResult.status}`);
        }
      } catch (error) {
        throw new Error(`Erreur de confirmation: ${error.message}`);
      }
    } else {
      return {
        success: true,
        message: 'Paiement confirmé (mode test)'
      };
    }
  },

  // Obtenir les méthodes de paiement disponibles
  getPaymentMethods: (country = 'CI') => {
    if (isProduction) {
      return kkiapayService.getPaymentMethods(country);
    } else {
      return {
        orange_money: {
          name: 'Orange Money',
          icon: '🟠',
          processingTime: '2-3 minutes'
        },
        mtn_mobile_money: {
          name: 'MTN Mobile Money',
          icon: '🟡',
          processingTime: '2-3 minutes'
        },
        moov_money: {
          name: 'Moov Money',
          icon: '🔵',
          processingTime: '2-3 minutes'
        },
        card: {
          name: 'Carte Bancaire',
          icon: '💳',
          processingTime: '30 secondes'
        }
      };
    }
  },

  // Calculer les frais de transaction
  calculateFees: (amount) => {
    if (isProduction) {
      return kkiapayService.calculateFees(amount);
    } else {
      return {
        originalAmount: amount,
        percentageFee: 0,
        fixedFee: 0,
        totalFees: 0,
        totalAmount: amount
      };
    }
  },

  // Valider un numéro de téléphone
  validatePhoneNumber: (phone, country = 'CI') => {
    return kkiapayService.validatePhoneNumber(phone, country);
  },

  // Formater un numéro de téléphone
  formatPhoneNumber: (phone, country = 'CI') => {
    return kkiapayService.formatPhoneNumber(phone, country);
  }
};

// Fonctions utilitaires
async function getPaymentData(paymentId) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .single();

  if (error) throw error;
  return data;
}

async function getUserData(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

async function updatePaymentStatus(paymentId, status, metadata = {}) {
  const { error } = await supabase
    .from('payments')
    .update({
      status,
      metadata: {
        ...metadata,
        updated_at: new Date().toISOString()
      }
    })
    .eq('id', paymentId);

  if (error) throw error;
}
