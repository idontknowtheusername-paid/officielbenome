// ============================================================================
// SERVICE FEDAPAY - PAIEMENTS BÉNIN
// ============================================================================

class FedaPayService {
  constructor() {
    this.publicKey = import.meta.env.VITE_FEDAPAY_PUBLIC_KEY;
    this.secretKey = import.meta.env.VITE_FEDAPAY_SECRET_KEY;
    this.baseUrl = 'https://api.fedapay.com/v1';
    this.isTestMode = import.meta.env.VITE_FEDAPAY_TEST_MODE === 'true';
    
    if (this.isTestMode) {
      this.baseUrl = 'https://sandbox-api.fedapay.com/v1';
    }
  }

  // Initialiser un paiement
  async initializePayment(paymentData) {
    try {
      const response = await fetch(`${this.baseUrl}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.secretKey}`
        },
        body: JSON.stringify({
          amount: paymentData.amount,
          currency: paymentData.currency || 'XOF',
          description: paymentData.description,
          customer: {
            email: paymentData.email,
            phone: paymentData.phone,
            name: paymentData.name
          },
          payment_method: paymentData.payment_method,
          callback_url: paymentData.callback_url,
          metadata: {
            boost_id: paymentData.boost_id,
            listing_id: paymentData.listing_id,
            package_name: paymentData.package_name,
            user_id: paymentData.user_id
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'initialisation du paiement');
      }

      return {
        success: true,
        transactionId: data.id,
        reference: data.reference,
        paymentUrl: data.payment_url,
        status: data.status,
        message: 'Paiement initialisé avec succès'
      };
    } catch (error) {
      console.error('❌ Erreur FedaPay:', error);
      throw new Error(`Erreur FedaPay: ${error.message}`);
    }
  }

  // Vérifier le statut d'un paiement
  async verifyPayment(transactionId) {
    try {
      const response = await fetch(`${this.baseUrl}/transactions/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la vérification du paiement');
      }

      return {
        success: true,
        status: data.status,
        amount: data.amount,
        currency: data.currency,
        reference: data.reference,
        paymentMethod: data.payment_method,
        customer: data.customer,
        metadata: data.metadata,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('❌ Erreur vérification FedaPay:', error);
      throw new Error(`Erreur vérification: ${error.message}`);
    }
  }

  // Rembourser un paiement
  async refundPayment(transactionId, amount = null) {
    try {
      const refundData = amount ? { amount } : {};
      
      const response = await fetch(`${this.baseUrl}/transactions/${transactionId}/refunds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.secretKey}`
        },
        body: JSON.stringify(refundData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors du remboursement');
      }

      return {
        success: true,
        refundId: data.id,
        amount: data.amount,
        status: data.status,
        message: 'Remboursement effectué avec succès'
      };
    } catch (error) {
      console.error('❌ Erreur remboursement FedaPay:', error);
      throw new Error(`Erreur remboursement: ${error.message}`);
    }
  }

  // Obtenir les méthodes de paiement disponibles
  getPaymentMethods(country = 'BJ') {
    return [
      {
        id: 'orange_money',
        name: 'Orange Money',
        icon: '🟠',
        description: 'Paiement via Orange Money',
        available: true,
        minAmount: 100,
        maxAmount: 500000
      },
      {
        id: 'mtn_mobile_money',
        name: 'MTN Mobile Money',
        icon: '🟡',
        description: 'Paiement via MTN Mobile Money',
        available: true,
        minAmount: 100,
        maxAmount: 500000
      },
      {
        id: 'moov_money',
        name: 'Moov Money',
        icon: '🔵',
        description: 'Paiement via Moov Money',
        available: true,
        minAmount: 100,
        maxAmount: 500000
      },
      {
        id: 'card',
        name: 'Carte Bancaire',
        icon: '💳',
        description: 'Paiement par carte Visa/Mastercard',
        available: true,
        minAmount: 100,
        maxAmount: 1000000
      }
    ];
  }

  // Calculer les frais de transaction
  calculateFees(amount) {
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
  }

  // Valider un numéro de téléphone
  validatePhoneNumber(phone, country = 'BJ') {
    // Format béninois : +229 XX XX XX XX
    const beninRegex = /^(\+229|229)?[0-9]{8}$/;
    return beninRegex.test(phone.replace(/\s/g, ''));
  }

  // Formater un numéro de téléphone
  formatPhoneNumber(phone, country = 'BJ') {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 8) {
      return `+229 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)}`;
    }
    return phone;
  }

  // Vérifier la configuration
  isConfigured() {
    return !!(this.publicKey && this.secretKey);
  }

  // Obtenir les informations de configuration
  getConfig() {
    return {
      isConfigured: this.isConfigured(),
      isTestMode: this.isTestMode,
      baseUrl: this.baseUrl,
      hasPublicKey: !!this.publicKey,
      hasSecretKey: !!this.secretKey
    };
  }
}

// Instance singleton
export const fedapayService = new FedaPayService();
