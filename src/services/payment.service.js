import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ============================================================================
// SERVICE DE GESTION DES PAIEMENTS PREMIUM
// ============================================================================

export const paymentService = {
  // Créer une nouvelle transaction de paiement
  createPayment: async (paymentData) => {
    if (!isSupabaseConfigured) {
      console.warn('⚠️ Supabase non configuré, simulation de création de paiement');
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
          payment_gateway: paymentData.paymentGateway,
          status: 'pending',
          metadata: {
            boost_id: paymentData.boostId,
            package_name: paymentData.packageName,
            listing_id: paymentData.listingId,
            description: paymentData.description
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
      throw error;
    }
  },

  // Initier un paiement avec Orange Money
  initiateOrangeMoneyPayment: async (paymentId, phoneNumber) => {
    if (!isSupabaseConfigured) {
      console.warn('⚠️ Supabase non configuré, simulation de paiement Orange Money');
      return {
        success: true,
        transactionId: 'OM-' + Date.now(),
        status: 'pending',
        message: 'Paiement Orange Money initié (mode test)'
      };
    }

    try {
      // Simuler l'appel à l'API Orange Money
      const orangeMoneyResponse = await simulateOrangeMoneyAPI(paymentId, phoneNumber);
      
      // Mettre à jour le statut du paiement
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'processing',
          metadata: {
            ...orangeMoneyResponse,
            phone_number: phoneNumber,
            initiated_at: new Date().toISOString()
          }
        })
        .eq('id', paymentId);

      if (updateError) throw updateError;

      return {
        success: true,
        transactionId: orangeMoneyResponse.transactionId,
        status: 'processing',
        message: 'Paiement Orange Money initié avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de l\'initiation du paiement Orange Money:', error);
      throw error;
    }
  },

  // Initier un paiement avec MTN Mobile Money
  initiateMTNPayment: async (paymentId, phoneNumber) => {
    if (!isSupabaseConfigured) {
      console.warn('⚠️ Supabase non configuré, simulation de paiement MTN');
      return {
        success: true,
        transactionId: 'MTN-' + Date.now(),
        status: 'pending',
        message: 'Paiement MTN initié (mode test)'
      };
    }

    try {
      // Simuler l'appel à l'API MTN
      const mtnResponse = await simulateMTNMobileMoneyAPI(paymentId, phoneNumber);
      
      // Mettre à jour le statut du paiement
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'processing',
          metadata: {
            ...mtnResponse,
            phone_number: phoneNumber,
            initiated_at: new Date().toISOString()
          }
        })
        .eq('id', paymentId);

      if (updateError) throw updateError;

      return {
        success: true,
        transactionId: mtnResponse.transactionId,
        status: 'processing',
        message: 'Paiement MTN initié avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de l\'initiation du paiement MTN:', error);
      throw error;
    }
  },

  // Initier un paiement par carte bancaire
  initiateCardPayment: async (paymentId, cardData) => {
    if (!isSupabaseConfigured) {
      console.warn('⚠️ Supabase non configuré, simulation de paiement par carte');
      return {
        success: true,
        transactionId: 'CARD-' + Date.now(),
        status: 'pending',
        message: 'Paiement par carte initié (mode test)'
      };
    }

    try {
      // Simuler l'appel à l'API de paiement par carte
      const cardResponse = await simulateCardPaymentAPI(paymentId, cardData);
      
      // Mettre à jour le statut du paiement
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'processing',
          metadata: {
            ...cardResponse,
            card_last4: cardData.number.slice(-4),
            card_brand: cardData.brand,
            initiated_at: new Date().toISOString()
          }
        })
        .eq('id', paymentId);

      if (updateError) throw updateError;

      return {
        success: true,
        transactionId: cardResponse.transactionId,
        status: 'processing',
        message: 'Paiement par carte initié avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de l\'initiation du paiement par carte:', error);
      throw error;
    }
  },

  // Vérifier le statut d'un paiement
  checkPaymentStatus: async (paymentId) => {
    if (!isSupabaseConfigured) {
      return {
        status: 'pending',
        message: 'Statut non disponible en mode test'
      };
    }

    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (error) throw error;

      return {
        status: data.status,
        amount: data.amount,
        currency: data.currency,
        paymentMethod: data.payment_method,
        metadata: data.metadata,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Erreur lors de la vérification du statut:', error);
      throw error;
    }
  },

  // Confirmer un paiement réussi
  confirmPayment: async (paymentId, transactionData) => {
    if (!isSupabaseConfigured) {
      console.warn('⚠️ Supabase non configuré, simulation de confirmation');
      return { success: true, message: 'Paiement confirmé (mode test)' };
    }

    try {
      // Mettre à jour le statut du paiement
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          metadata: {
            ...transactionData,
            confirmed_at: new Date().toISOString()
          }
        })
        .eq('id', paymentId);

      if (updateError) throw updateError;

      // Créer un reçu
      await createReceipt(paymentId, transactionData);

      return { success: true, message: 'Paiement confirmé avec succès' };
    } catch (error) {
      console.error('Erreur lors de la confirmation du paiement:', error);
      throw error;
    }
  },

  // Annuler un paiement
  cancelPayment: async (paymentId, reason = 'user_cancelled') => {
    if (!isSupabaseConfigured) {
      return { success: true, message: 'Paiement annulé (mode test)' };
    }

    try {
      const { error: updateError } = await supabase
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

      if (updateError) throw updateError;

      return { success: true, message: 'Paiement annulé avec succès' };
    } catch (error) {
      console.error('Erreur lors de l\'annulation du paiement:', error);
      throw error;
    }
  },

  // Rembourser un paiement
  refundPayment: async (paymentId, amount, reason = 'user_request') => {
    if (!isSupabaseConfigured) {
      return { success: true, message: 'Remboursement initié (mode test)' };
    }

    try {
      // Créer une transaction de remboursement
      const { data: refundData, error: refundError } = await supabase
        .from('payments')
        .insert({
          user_id: (await getPaymentUserId(paymentId)),
          amount: -amount, // Montant négatif pour le remboursement
          currency: 'XOF',
          payment_method: 'refund',
          payment_gateway: 'system',
          status: 'processing',
          metadata: {
            original_payment_id: paymentId,
            refund_reason: reason,
            refund_amount: amount,
            initiated_at: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (refundError) throw refundError;

      // Mettre à jour le paiement original
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'refunded',
          refunded_at: new Date().toISOString(),
          metadata: {
            refund_id: refundData.id,
            refund_reason: reason,
            refunded_at: new Date().toISOString()
          }
        })
        .eq('id', paymentId);

      if (updateError) throw updateError;

      return {
        success: true,
        refundId: refundData.id,
        message: 'Remboursement initié avec succès'
      };
    } catch (error) {
      console.error('Erreur lors du remboursement:', error);
      throw error;
    }
  },

  // Récupérer l'historique des paiements d'un utilisateur
  getUserPaymentHistory: async (userId) => {
    if (!isSupabaseConfigured) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      throw error;
    }
  },

  // Générer un reçu PDF
  generateReceipt: async (paymentId) => {
    if (!isSupabaseConfigured) {
      return {
        success: true,
        receiptUrl: '#',
        message: 'Reçu généré (mode test)'
      };
    }

    try {
      // Logique de génération de reçu
      const receiptData = await generateReceiptPDF(paymentId);
      
      return {
        success: true,
        receiptUrl: receiptData.url,
        receiptData: receiptData,
        message: 'Reçu généré avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la génération du reçu:', error);
      throw error;
    }
  },

  // Obtenir les statistiques de paiement
  getPaymentStats: async (userId = null) => {
    if (!isSupabaseConfigured) {
      return {
        totalPayments: 0,
        totalAmount: 0,
        successRate: 0,
        averageAmount: 0
      };
    }

    try {
      let query = supabase
        .from('payments')
        .select('*');

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const stats = calculatePaymentStats(data || []);
      return stats;
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      throw error;
    }
  }
};

// ============================================================================
// FONCTIONS UTILITAIRES INTERNES
// ============================================================================

// Simulation des APIs de paiement (à remplacer par de vraies intégrations)
async function simulateOrangeMoneyAPI(paymentId, phoneNumber) {
  // Simulation d'un délai réseau
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    transactionId: 'OM-' + Date.now(),
    status: 'pending',
    phoneNumber: phoneNumber,
    gateway: 'orange_money'
  };
}

async function simulateMTNMobileMoneyAPI(paymentId, phoneNumber) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    transactionId: 'MTN-' + Date.now(),
    status: 'pending',
    phoneNumber: phoneNumber,
    gateway: 'mtn_mobile_money'
  };
}

async function simulateCardPaymentAPI(paymentId, cardData) {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    transactionId: 'CARD-' + Date.now(),
    status: 'pending',
    gateway: 'card_payment',
    cardBrand: cardData.brand
  };
}

// Créer un reçu
async function createReceipt(paymentId, transactionData) {
  try {
    const { error } = await supabase
      .from('receipts')
      .insert({
        payment_id: paymentId,
        user_id: transactionData.userId,
        amount: transactionData.amount,
        currency: transactionData.currency || 'XOF',
        status: 'generated',
        metadata: {
          transaction_id: transactionData.transactionId,
          payment_method: transactionData.paymentMethod,
          generated_at: new Date().toISOString()
        }
      });

    if (error) throw error;
  } catch (error) {
    console.error('Erreur lors de la création du reçu:', error);
  }
}

// Obtenir l'ID utilisateur d'un paiement
async function getPaymentUserId(paymentId) {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('user_id')
      .eq('id', paymentId)
      .single();

    if (error) throw error;
    return data.user_id;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    throw error;
  }
}

// Générer un reçu PDF
async function generateReceiptPDF(paymentId) {
  // Simulation de génération de PDF
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    url: `/receipts/${paymentId}.pdf`,
    filename: `receipt-${paymentId}.pdf`,
    generatedAt: new Date().toISOString()
  };
}

// Calculer les statistiques de paiement
function calculatePaymentStats(payments) {
  const totalPayments = payments.length;
  const completedPayments = payments.filter(p => p.status === 'completed');
  const totalAmount = completedPayments.reduce((sum, p) => sum + p.amount, 0);
  const successRate = totalPayments > 0 ? (completedPayments.length / totalPayments) * 100 : 0;
  const averageAmount = completedPayments.length > 0 ? totalAmount / completedPayments.length : 0;

  return {
    totalPayments,
    totalAmount,
    successRate: Math.round(successRate * 100) / 100,
    averageAmount: Math.round(averageAmount * 100) / 100,
    completedPayments: completedPayments.length,
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    failedPayments: payments.filter(p => p.status === 'failed').length
  };
}

export default paymentService;
