// ============================================================================
// SERVICE DE PAIEMENT LYGOS - MOBILE MONEY
// ============================================================================
// Documentation: https://docs.lygosapp.com/home
// Dashboard: https://pay.lygosapp.com/dashboard/configurations

const LYGOS_API_KEY = import.meta.env.VITE_LYGOS_API_KEY;
const LYGOS_BASE_URL = 'https://api.lygosapp.com/v1';

export const lygosService = {
  /**
   * Initialiser un paiement Lygos
   * @param {Object} paymentData - Données du paiement
   * @param {number} paymentData.amount - Montant en XOF
   * @param {string} paymentData.currency - Devise (XOF, EUR, USD)
   * @param {string} paymentData.description - Description du paiement
   * @param {string} paymentData.customerName - Nom du client
   * @param {string} paymentData.customerEmail - Email du client
   * @param {string} paymentData.customerPhone - Téléphone du client
   * @param {string} paymentData.returnUrl - URL de retour après paiement
   * @param {string} paymentData.cancelUrl - URL d'annulation
   * @param {Object} paymentData.metadata - Métadonnées personnalisées
   * @returns {Promise<Object>} Réponse de l'API Lygos
   */
  initializePayment: async (paymentData) => {
    try {
      if (!LYGOS_API_KEY) {
        throw new Error('Clé API Lygos non configurée');
      }

      const {
        amount,
        description,
        returnUrl,
        cancelUrl,
        metadata = {}
      } = paymentData;

      // Validation
      if (!amount || amount <= 0) {
        throw new Error('Montant invalide');
      }

      // Payload selon la documentation Lygos
      const payload = {
        amount: Math.round(amount),
        shop_name: 'MaxiMarket',
        order_id: metadata.boostId || `BOOST-${Date.now()}`,
        message: description || `Paiement MaxiMarket`,
        success_url: returnUrl,
        failure_url: cancelUrl
      };

      console.log('[Lygos] 🚀 Création passerelle:', {
        order_id: payload.order_id,
        amount: payload.amount
      });

      const response = await fetch(`${LYGOS_BASE_URL}/gateway`, {
        method: 'POST',
        headers: {
          'api-key': LYGOS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();
      console.log('[Lygos] 📥 Réponse brute:', responseText.substring(0, 200));

      if (!response.ok) {
        console.error('[Lygos] ❌ Erreur HTTP:', response.status, responseText);
        throw new Error(`Erreur API Lygos (${response.status}): ${responseText}`);
      }

      const result = JSON.parse(responseText);

      // Valider la réponse
      if (!result.id) {
        throw new Error('Lygos n\'a pas retourné d\'ID de passerelle');
      }

      if (!result.link) {
        throw new Error('Lygos n\'a pas retourné de lien de paiement');
      }

      console.log('[Lygos] ✅ Passerelle créée:', result.id);
      console.log('[Lygos] 🔗 URL paiement:', result.link);

      return {
        success: true,
        data: {
          reference: result.id,
          paymentUrl: result.link,
          amount: result.amount,
          currency: result.currency || 'XOF',
          status: 'created',
          gatewayId: result.id,
          orderId: result.order_id
        },
        message: 'Paiement initialisé avec succès'
      };
    } catch (error) {
      console.error('[Lygos] ❌ Erreur initialisation:', error.message);
      return {
        success: false,
        error: error.message,
        message: 'Erreur lors de l\'initialisation du paiement'
      };
    }
  },

  /**
   * Vérifier le statut d'un paiement
   * @param {string} reference - Référence du paiement Lygos
   * @returns {Promise<Object>} Statut du paiement
   */
  verifyPayment: async (reference) => {
    try {
      if (!LYGOS_API_KEY) {
        throw new Error('Clé API Lygos non configurée');
      }

      if (!reference) {
        throw new Error('Référence de paiement requise');
      }

      console.log('[Lygos] 🔍 Vérification statut:', reference);

      const response = await fetch(`${LYGOS_BASE_URL}/gateway/payin/${reference}`, {
        method: 'GET',
        headers: {
          'api-key': LYGOS_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      const responseText = await response.text();

      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: true,
            data: {
              order_id: reference,
              status: 'not_found'
            },
            isPaid: false,
            message: 'Paiement non trouvé'
          };
        }
        throw new Error(`Erreur HTTP ${response.status}: ${responseText}`);
      }

      const result = JSON.parse(responseText);
      const isSuccessful = ['success', 'successful', 'completed', 'paid', 'confirmed'].includes(result.status?.toLowerCase());

      console.log(`[Lygos] ${isSuccessful ? '✅' : '⏳'} Statut:`, result.status);

      return {
        success: true,
        data: {
          order_id: result.order_id || reference,
          status: result.status,
          currency: 'XOF'
        },
        isPaid: isSuccessful,
        message: isSuccessful ? 'Paiement réussi' : 'Paiement en attente'
      };
    } catch (error) {
      console.error('[Lygos] ❌ Erreur vérification:', error.message);
      return {
        success: false,
        error: error.message,
        isPaid: false,
        message: 'Erreur lors de la vérification du paiement'
      };
    }
  },

  /**
   * Obtenir la liste des paiements
   * @param {Object} filters - Filtres de recherche
   * @param {number} filters.page - Numéro de page
   * @param {number} filters.limit - Nombre de résultats par page
   * @param {string} filters.status - Statut du paiement
   * @param {string} filters.startDate - Date de début
   * @param {string} filters.endDate - Date de fin
   * @returns {Promise<Object>} Liste des paiements
   */
  getPayments: async (filters = {}) => {
    try {
      if (!LYGOS_API_KEY) {
        throw new Error('Clé API Lygos non configurée');
      }

      const {
        page = 1,
        limit = 20,
        status,
        startDate,
        endDate
      } = filters;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (status) params.append('status', status);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await fetch(`${LYGOS_BASE_URL}/payments?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${LYGOS_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erreur lors de la récupération des paiements');
      }

      return {
        success: true,
        data: result.data,
        pagination: result.pagination,
        message: 'Paiements récupérés avec succès'
      };
    } catch (error) {
      console.error('❌ Erreur récupération paiements Lygos:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erreur lors de la récupération des paiements'
      };
    }
  },

  /**
   * Rembourser un paiement
   * @param {string} reference - Référence du paiement
   * @param {number} amount - Montant à rembourser (optionnel, remboursement total par défaut)
   * @param {string} reason - Raison du remboursement
   * @returns {Promise<Object>} Résultat du remboursement
   */
  refundPayment: async (reference, amount = null, reason = '') => {
    try {
      if (!LYGOS_API_KEY) {
        throw new Error('Clé API Lygos non configurée');
      }

      if (!reference) {
        throw new Error('Référence de paiement requise');
      }

      const payload = {
        reference,
        ...(amount && { amount: Math.round(amount) }),
        reason: reason || 'Remboursement demandé par le client'
      };

      console.log('💰 Remboursement Lygos:', reference);

      const response = await fetch(`${LYGOS_BASE_URL}/payments/${reference}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LYGOS_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erreur lors du remboursement');
      }

      console.log('✅ Remboursement effectué:', result.data?.refund_reference);

      return {
        success: true,
        data: result.data,
        message: 'Remboursement effectué avec succès'
      };
    } catch (error) {
      console.error('❌ Erreur remboursement Lygos:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erreur lors du remboursement'
      };
    }
  },

  /**
   * Obtenir les méthodes de paiement disponibles
   * @returns {Promise<Object>} Liste des méthodes de paiement
   */
  getPaymentMethods: async () => {
    try {
      if (!LYGOS_API_KEY) {
        throw new Error('Clé API Lygos non configurée');
      }

      const response = await fetch(`${LYGOS_BASE_URL}/payment-methods`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${LYGOS_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erreur lors de la récupération des méthodes de paiement');
      }

      return {
        success: true,
        data: result.data,
        message: 'Méthodes de paiement récupérées avec succès'
      };
    } catch (error) {
      console.error('❌ Erreur récupération méthodes de paiement:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erreur lors de la récupération des méthodes de paiement'
      };
    }
  },

  /**
   * Vérifier la configuration Lygos
   * @returns {boolean} True si Lygos est configuré
   */
  isConfigured: () => {
    return !!LYGOS_API_KEY;
  },

  /**
   * Obtenir les informations du compte
   * @returns {Promise<Object>} Informations du compte
   */
  getAccountInfo: async () => {
    try {
      if (!LYGOS_API_KEY) {
        throw new Error('Clé API Lygos non configurée');
      }

      const response = await fetch(`${LYGOS_BASE_URL}/account`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${LYGOS_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erreur lors de la récupération des informations du compte');
      }

      return {
        success: true,
        data: result.data,
        message: 'Informations du compte récupérées avec succès'
      };
    } catch (error) {
      console.error('❌ Erreur récupération informations compte:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erreur lors de la récupération des informations du compte'
      };
    }
  }
};

export default lygosService;
