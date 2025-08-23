// ============================================================================
// SERVICE KKIAPAY - PAIEMENTS RÉELS POUR L'AFRIQUE DE L'OUEST
// ============================================================================

const KKIAPAY_CONFIG = {
  publicKey: process.env.VITE_KKIAPAY_PUBLIC_KEY,
  secretKey: process.env.VITE_KKIAPAY_SECRET_KEY,
  baseUrl: 'https://api.kkiapay.me',
  currency: 'XOF',
  defaultCountry: 'BJ', // Bénin comme pays principal
  countries: ['BJ', 'CI', 'SN', 'ML', 'BF', 'NE', 'TG', 'GH', 'NG'],
  redirectUrl: `${window.location.origin}/payment-callback`
};

// Méthodes de paiement supportées en Afrique de l'Ouest (Bénin en premier)
const SUPPORTED_PAYMENT_METHODS = {
  orange_money: {
    name: 'Orange Money',
    code: 'orange_money',
    icon: '🟠',
    processingTime: '2-3 minutes',
    countries: ['BJ', 'CI', 'ML', 'BF', 'NE']
  },
  mtn_mobile_money: {
    name: 'MTN Mobile Money',
    code: 'mtn_mobile_money',
    icon: '🟡',
    processingTime: '2-3 minutes',
    countries: ['BJ', 'CI', 'GH', 'NG']
  },
  moov_money: {
    name: 'Moov Money',
    code: 'moov_money',
    icon: '🔵',
    processingTime: '2-3 minutes',
    countries: ['BJ', 'CI', 'TG']
  },
  card: {
    name: 'Carte Bancaire',
    code: 'card',
    icon: '💳',
    processingTime: '30 secondes',
    countries: ['BJ', 'CI', 'SN', 'ML', 'BF', 'NE', 'TG', 'GH', 'NG']
  },
  wave: {
    name: 'Wave',
    code: 'wave',
    icon: '🌊',
    processingTime: '2-3 minutes',
    countries: ['SN', 'CI', 'UG']
  }
};

export const kkiapayService = {
  // Initialiser un paiement
  initializePayment: async (paymentData) => {
    try {
      const {
        amount,
        email,
        phone,
        name,
        country = KKIAPAY_CONFIG.defaultCountry, // Bénin par défaut
        payment_method,
        callback_url,
        customizations
      } = paymentData;

      const payload = {
        amount,
        currency: KKIAPAY_CONFIG.currency,
        country,
        phone,
        email,
        name,
        reason: customizations?.description || 'Achat de boost premium',
        callback_url: callback_url || KKIAPAY_CONFIG.redirectUrl,
        return_url: callback_url || KKIAPAY_CONFIG.redirectUrl,
        data: {
          boost_id: paymentData.boost_id,
          listing_id: paymentData.listing_id,
          package_name: paymentData.package_name,
          user_id: paymentData.user_id
        }
      };

      const response = await fetch(`${KKIAPAY_CONFIG.baseUrl}/api/v1/transactions/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${KKIAPAY_CONFIG.publicKey}`,
          'X-Secret-Key': KKIAPAY_CONFIG.secretKey
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          paymentUrl: result.data.paymentUrl,
          transactionId: result.data.transactionId,
          reference: result.data.reference,
          message: 'Paiement initialisé avec succès'
        };
      } else {
        throw new Error(result.message || 'Erreur lors de l\'initialisation du paiement');
      }
    } catch (error) {
      console.error('Erreur Kkiapay:', error);
      throw new Error(`Erreur de paiement: ${error.message}`);
    }
  },

  // Vérifier le statut d'un paiement
  verifyPayment: async (transactionId) => {
    try {
      const response = await fetch(`${KKIAPAY_CONFIG.baseUrl}/api/v1/transactions/${transactionId}/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${KKIAPAY_CONFIG.publicKey}`,
          'X-Secret-Key': KKIAPAY_CONFIG.secretKey
        }
      });

      const result = await response.json();

      if (result.success) {
        const payment = result.data;
        return {
          success: true,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          reference: payment.reference,
          paymentMethod: payment.paymentMethod,
          customerEmail: payment.customerEmail,
          customerPhone: payment.customerPhone,
          customerName: payment.customerName,
          meta: payment.data,
          createdAt: payment.createdAt,
          paidAt: payment.paidAt,
          message: 'Paiement vérifié avec succès'
        };
      } else {
        throw new Error(result.message || 'Erreur lors de la vérification');
      }
    } catch (error) {
      console.error('Erreur vérification Kkiapay:', error);
      throw new Error(`Erreur de vérification: ${error.message}`);
    }
  },

  // Rembourser un paiement
  refundPayment: async (transactionId, amount, reason = 'user_request') => {
    try {
      const payload = {
        amount,
        reason
      };

      const response = await fetch(`${KKIAPAY_CONFIG.baseUrl}/api/v1/transactions/${transactionId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${KKIAPAY_CONFIG.publicKey}`,
          'X-Secret-Key': KKIAPAY_CONFIG.secretKey
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          refundId: result.data.refundId,
          amount: result.data.amount,
          status: result.data.status,
          message: 'Remboursement effectué avec succès'
        };
      } else {
        throw new Error(result.message || 'Erreur lors du remboursement');
      }
    } catch (error) {
      console.error('Erreur remboursement Kkiapay:', error);
      throw new Error(`Erreur de remboursement: ${error.message}`);
    }
  },

  // Obtenir l'historique des transactions
  getTransactionHistory: async (email, page = 1, limit = 10) => {
    try {
      const response = await fetch(
        `${KKIAPAY_CONFIG.baseUrl}/api/v1/transactions?email=${email}&page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${KKIAPAY_CONFIG.publicKey}`,
            'X-Secret-Key': KKIAPAY_CONFIG.secretKey
          }
        }
      );

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          transactions: result.data.transactions,
          pagination: result.data.pagination,
          message: 'Historique récupéré avec succès'
        };
      } else {
        throw new Error(result.message || 'Erreur lors de la récupération de l\'historique');
      }
    } catch (error) {
      console.error('Erreur historique Kkiapay:', error);
      throw new Error(`Erreur d'historique: ${error.message}`);
    }
  },

  // Obtenir les méthodes de paiement disponibles par pays
  getPaymentMethods: (country = KKIAPAY_CONFIG.defaultCountry) => {
    const methods = {};
    Object.keys(SUPPORTED_PAYMENT_METHODS).forEach(key => {
      const method = SUPPORTED_PAYMENT_METHODS[key];
      if (method.countries.includes(country)) {
        methods[key] = method;
      }
    });
    return methods;
  },

  // Valider un numéro de téléphone par pays
  validatePhoneNumber: (phone, country = KKIAPAY_CONFIG.defaultCountry) => {
    const phonePatterns = {
      'BJ': /^(229|00229|\+229)?[0-9]{8}$/, // Bénin en premier
      'CI': /^(225|00225|\+225)?[0-9]{10}$/,
      'SN': /^(221|00221|\+221)?[0-9]{9}$/,
      'ML': /^(223|00223|\+223)?[0-9]{8}$/,
      'BF': /^(226|00226|\+226)?[0-9]{8}$/,
      'NE': /^(227|00227|\+227)?[0-9]{8}$/,
      'TG': /^(228|00228|\+228)?[0-9]{8}$/,
      'GH': /^(233|00233|\+233)?[0-9]{9}$/,
      'NG': /^(234|00234|\+234)?[0-9]{10}$/
    };

    const pattern = phonePatterns[country] || phonePatterns[KKIAPAY_CONFIG.defaultCountry];
    return pattern.test(phone.replace(/\s/g, ''));
  },

  // Formater un numéro de téléphone par pays
  formatPhoneNumber: (phone, country = KKIAPAY_CONFIG.defaultCountry) => {
    let formatted = phone.replace(/\D/g, '');
    
    const countryCodes = {
      'BJ': '229', // Bénin en premier
      'CI': '225',
      'SN': '221',
      'ML': '223',
      'BF': '226',
      'NE': '227',
      'TG': '228',
      'GH': '233',
      'NG': '234'
    };

    const countryCode = countryCodes[country] || countryCodes[KKIAPAY_CONFIG.defaultCountry];
    if (formatted.startsWith(countryCode)) {
      formatted = formatted.substring(countryCode.length);
    }

    // Formatage selon le pays
    const formats = {
      'BJ': (num) => num.match(/.{1,2}/g)?.join(' ') || num, // Bénin en premier
      'CI': (num) => num.match(/.{1,2}/g)?.join(' ') || num,
      'SN': (num) => num.match(/.{1,3}/g)?.join(' ') || num,
      'ML': (num) => num.match(/.{1,2}/g)?.join(' ') || num,
      'BF': (num) => num.match(/.{1,2}/g)?.join(' ') || num,
      'NE': (num) => num.match(/.{1,2}/g)?.join(' ') || num,
      'TG': (num) => num.match(/.{1,2}/g)?.join(' ') || num,
      'GH': (num) => num.match(/.{1,3}/g)?.join(' ') || num,
      'NG': (num) => num.match(/.{1,4}/g)?.join(' ') || num
    };

    const format = formats[country] || formats[KKIAPAY_CONFIG.defaultCountry];
    return format(formatted);
  },

  // Générer une référence unique
  generateTransactionRef: () => {
    return `BENOME_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Calculer les frais de transaction Kkiapay
  calculateFees: (amount) => {
    const percentage = 0.015; // 1.5%
    const fixedFee = 50; // 50 FCFA
    const percentageFee = amount * percentage;
    const totalFees = percentageFee + fixedFee;
    const totalAmount = amount + totalFees;
    
    return {
      originalAmount: amount,
      percentageFee,
      fixedFee,
      totalFees,
      totalAmount
    };
  },

  // Obtenir les informations de support par pays
  getSupportInfo: (country = KKIAPAY_CONFIG.defaultCountry) => {
    const supportInfo = {
      'BJ': { // Bénin en premier
        phone: '+229 21 30 03 03',
        email: 'support@kkiapay.bj',
        address: 'Cotonou, Bénin'
      },
      'CI': {
        phone: '+225 27 22 49 24 24',
        email: 'support@kkiapay.ci',
        address: 'Abidjan, Côte d\'Ivoire'
      },
      'SN': {
        phone: '+221 33 889 00 00',
        email: 'support@kkiapay.sn',
        address: 'Dakar, Sénégal'
      }
    };

    return supportInfo[country] || supportInfo[KKIAPAY_CONFIG.defaultCountry];
  },

  // Vérifier la disponibilité du service
  checkServiceStatus: async () => {
    try {
      const response = await fetch(`${KKIAPAY_CONFIG.baseUrl}/api/v1/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${KKIAPAY_CONFIG.publicKey}`
        }
      });

      const result = await response.json();
      return {
        success: true,
        status: result.status,
        message: 'Service opérationnel'
      };
    } catch (error) {
      return {
        success: false,
        status: 'error',
        message: 'Service temporairement indisponible'
      };
    }
  }
};

// Hook React pour Kkiapay
export const useKkiapay = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initializePayment = async (paymentData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await kkiapayService.initializePayment(paymentData);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const verifyPayment = async (transactionId) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await kkiapayService.verifyPayment(transactionId);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return {
    loading,
    error,
    initializePayment,
    verifyPayment,
    getPaymentMethods: kkiapayService.getPaymentMethods,
    validatePhoneNumber: kkiapayService.validatePhoneNumber,
    formatPhoneNumber: kkiapayService.formatPhoneNumber,
    generateTransactionRef: kkiapayService.generateTransactionRef,
    calculateFees: kkiapayService.calculateFees,
    getSupportInfo: kkiapayService.getSupportInfo,
    checkServiceStatus: kkiapayService.checkServiceStatus
  };
};

export default kkiapayService;
