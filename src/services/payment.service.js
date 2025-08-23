import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { kkiapayService } from './kkiapay.service';

// ============================================================================
// SERVICE DE GESTION DES PAIEMENTS PREMIUM - PRODUCTION KKIAPAY
// ============================================================================

export const paymentService = {
  // Créer une nouvelle transaction de paiement
  createPayment: async (paymentData) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase non configuré. Impossible de créer un paiement.');
    }

    try {
      const { data, error } = await supabase
        .from('payments')
        .insert({
          user_id: paymentData.userId,
          amount: paymentData.amount,
          currency: paymentData.currency || 'XOF',
          payment_method: paymentData.paymentMethod,
          payment_gateway: 'kkiapay',
          status: 'pending',
          metadata: {
            boost_id: paymentData.boostId,
            package_name: paymentData.packageName,
            listing_id: paymentData.listingId,
            description: paymentData.description,
            phone_number: paymentData.phoneNumber,
            email: paymentData.email,
            country: paymentData.country || 'BJ',
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
    try {
      const paymentData = await getPaymentData(paymentId);
      const userData = await getUserData(paymentData.user_id);
      
      const kkiapayResult = await kkiapayService.initializePayment({
        amount: paymentData.amount,
        email: userData.email,
        phone: phoneNumber,
        name: userData.full_name || userData.email,
        country: paymentData.metadata?.country || 'BJ',
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
  },

  // Initier un paiement avec MTN Mobile Money
  initiateMTNPayment: async (paymentId, phoneNumber) => {
    try {
      const paymentData = await getPaymentData(paymentId);
      const userData = await getUserData(paymentData.user_id);
      
      const kkiapayResult = await kkiapayService.initializePayment({
        amount: paymentData.amount,
        email: userData.email,
        phone: phoneNumber,
        name: userData.full_name || userData.email,
        country: paymentData.metadata?.country || 'BJ',
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
  },

  // Initier un paiement avec Moov Money
  initiateMoovPayment: async (paymentId, phoneNumber) => {
    try {
      const paymentData = await getPaymentData(paymentId);
      const userData = await getUserData(paymentData.user_id);
      
      const kkiapayResult = await kkiapayService.initializePayment({
        amount: paymentData.amount,
        email: userData.email,
        phone: phoneNumber,
        name: userData.full_name || userData.email,
        country: paymentData.metadata?.country || 'BJ',
        payment_method: 'moov_money',
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
        message: 'Paiement Moov initié avec succès via Kkiapay'
      };
    } catch (error) {
      throw new Error(`Erreur Moov: ${error.message}`);
    }
  },

  // Initier un paiement par carte
  initiateCardPayment: async (paymentId, cardData) => {
    try {
      const paymentData = await getPaymentData(paymentId);
      const userData = await getUserData(paymentData.user_id);
      
      const kkiapayResult = await kkiapayService.initializePayment({
        amount: paymentData.amount,
        email: userData.email,
        phone: userData.phone || '',
        name: cardData.name,
        country: paymentData.metadata?.country || 'BJ',
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
  },

  // Confirmer un paiement
  confirmPayment: async (paymentId, confirmationData) => {
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
  },

  // Obtenir les méthodes de paiement disponibles
  getPaymentMethods: (country = 'BJ') => {
    return kkiapayService.getPaymentMethods(country);
  },

  // Calculer les frais de transaction
  calculateFees: (amount) => {
    return kkiapayService.calculateFees(amount);
  },

  // Valider un numéro de téléphone
  validatePhoneNumber: (phone, country = 'BJ') => {
    return kkiapayService.validatePhoneNumber(phone, country);
  },

  // Formater un numéro de téléphone
  formatPhoneNumber: (phone, country = 'BJ') => {
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
