import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ============================================================================
// SERVICE DE GESTION DES PAIEMENTS PREMIUM - PRODUCTION FEDAPAY
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
          payment_gateway: 'fedapay',
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

  // Obtenir les méthodes de paiement disponibles
  getPaymentMethods: (country = 'BJ') => {
    return [
      {
        id: 'orange_money',
        name: 'Orange Money',
        icon: '🟠',
        description: 'Paiement via Orange Money',
        available: true
      },
      {
        id: 'mtn_mobile_money',
        name: 'MTN Mobile Money',
        icon: '🟡',
        description: 'Paiement via MTN Mobile Money',
        available: true
      },
      {
        id: 'moov_money',
        name: 'Moov Money',
        icon: '🔵',
        description: 'Paiement via Moov Money',
        available: true
      },
      {
        id: 'card',
        name: 'Carte Bancaire',
        icon: '💳',
        description: 'Paiement par carte Visa/Mastercard',
        available: true
      }
    ];
  },

  // Calculer les frais de transaction
  calculateFees: (amount) => {
    const feePercentage = 0.025; // 2.5%
    const fixedFee = 50; // 50 FCFA
    const fee = (amount * feePercentage) + fixedFee;
    return {
      amount: amount,
      fee: Math.round(fee),
      total: amount + Math.round(fee),
      percentage: feePercentage * 100,
      fixedFee: fixedFee
    };
  },

  // Valider un numéro de téléphone
  validatePhoneNumber: (phone, country = 'BJ') => {
    // Format béninois : +229 XX XX XX XX
    const beninRegex = /^(\+229|229)?[0-9]{8}$/;
    return beninRegex.test(phone.replace(/\s/g, ''));
  },

  // Formater un numéro de téléphone
  formatPhoneNumber: (phone, country = 'BJ') => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 8) {
      return `+229 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)}`;
    }
    return phone;
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
