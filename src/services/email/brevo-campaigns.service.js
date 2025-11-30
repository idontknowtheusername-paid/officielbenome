// ============================================================================
// SERVICE BREVO - GESTION DES CAMPAGNES MARKETING (API REST)
// Compatible navigateur - N'utilise PAS le SDK @getbrevo/brevo
// ============================================================================

const BREVO_API_KEY = import.meta.env?.VITE_BREVO_API_KEY || process.env.VITE_BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3';

// Helper pour les requêtes API
const brevoFetch = async (endpoint, options = {}) => {
  if (!BREVO_API_KEY) {
    throw new Error('Clé API Brevo non configurée');
  }

  const response = await fetch(`${BREVO_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'accept': 'application/json',
      'api-key': BREVO_API_KEY,
      'content-type': 'application/json',
      ...options.headers
    }
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || `Erreur API Brevo: ${response.status}`);
  }

  return data;
};

export const brevoCampaignsService = {
  /**
   * Créer une campagne email
   * @param {object} campaignData - Données de la campagne
   */
  createCampaign: async (campaignData) => {
    try {
      if (!BREVO_API_KEY) {
        console.log('📧 [SIMULATION] Campagne Brevo créée:', campaignData.name);
        return { success: true, campaignId: 'sim-' + Date.now() };
      }

      const payload = {
        name: campaignData.name,
        subject: campaignData.subject,
        sender: {
          name: campaignData.senderName || 'MaxiMarket',
          email: campaignData.senderEmail || 'noreply@maximarket.com'
        },
        htmlContent: campaignData.htmlContent
      };

      if (campaignData.recipients) {
        payload.recipients = campaignData.recipients;
      }
      
      if (campaignData.scheduledAt) {
        payload.scheduledAt = campaignData.scheduledAt;
      }

      const result = await brevoFetch('/emailCampaigns', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      console.log('✅ Campagne Brevo créée:', result.id);
      
      return {
        success: true,
        campaignId: result.id,
        message: 'Campagne créée avec succès'
      };

    } catch (error) {
      console.error('❌ Erreur création campagne Brevo:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtenir une campagne
   * @param {number} campaignId - ID de la campagne
   */
  getCampaign: async (campaignId) => {
    try {
      if (!BREVO_API_KEY) {
        console.log('📧 [SIMULATION] Récupération campagne Brevo:', campaignId);
        return { success: true, campaign: null };
      }

      const campaign = await brevoFetch(`/emailCampaigns/${campaignId}`);
      console.log('✅ Campagne Brevo récupérée:', campaignId);
      
      return {
        success: true,
        campaign
      };

    } catch (error) {
      console.error('❌ Erreur récupération campagne Brevo:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtenir toutes les campagnes
   * @param {object} filters - Filtres (type, status, limit, offset)
   */
  getAllCampaigns: async (filters = {}) => {
    try {
      if (!BREVO_API_KEY) {
        console.log('📧 [SIMULATION] Récupération campagnes Brevo');
        return { success: true, campaigns: [] };
      }

      const params = new URLSearchParams({
        type: filters.type || 'classic',
        limit: filters.limit || 50,
        offset: filters.offset || 0
      });

      if (filters.status) {
        params.append('status', filters.status);
      }

      const result = await brevoFetch(`/emailCampaigns?${params}`);
      console.log('✅ Campagnes Brevo récupérées:', result.campaigns?.length || 0);
      
      return {
        success: true,
        campaigns: result.campaigns || [],
        count: result.count || 0
      };

    } catch (error) {
      console.error('❌ Erreur récupération campagnes Brevo:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Mettre à jour une campagne
   * @param {number} campaignId - ID de la campagne
   * @param {object} updates - Mises à jour
   */
  updateCampaign: async (campaignId, updates) => {
    try {
      if (!BREVO_API_KEY) {
        console.log('📧 [SIMULATION] Campagne Brevo mise à jour:', campaignId);
        return { success: true, message: 'Campagne simulée mise à jour' };
      }

      await brevoFetch(`/emailCampaigns/${campaignId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });

      console.log('✅ Campagne Brevo mise à jour:', campaignId);
      
      return {
        success: true,
        message: 'Campagne mise à jour avec succès'
      };

    } catch (error) {
      console.error('❌ Erreur mise à jour campagne Brevo:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Supprimer une campagne
   * @param {number} campaignId - ID de la campagne
   */
  deleteCampaign: async (campaignId) => {
    try {
      if (!BREVO_API_KEY) {
        console.log('📧 [SIMULATION] Campagne Brevo supprimée:', campaignId);
        return { success: true, message: 'Campagne simulée supprimée' };
      }

      await brevoFetch(`/emailCampaigns/${campaignId}`, {
        method: 'DELETE'
      });

      console.log('✅ Campagne Brevo supprimée:', campaignId);
      
      return {
        success: true,
        message: 'Campagne supprimée avec succès'
      };

    } catch (error) {
      console.error('❌ Erreur suppression campagne Brevo:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Envoyer une campagne immédiatement
   * @param {number} campaignId - ID de la campagne
   */
  sendCampaignNow: async (campaignId) => {
    try {
      if (!BREVO_API_KEY) {
        console.log('📧 [SIMULATION] Campagne Brevo envoyée:', campaignId);
        return { success: true, message: 'Campagne simulée envoyée' };
      }

      await brevoFetch(`/emailCampaigns/${campaignId}/sendNow`, {
        method: 'POST'
      });

      console.log('✅ Campagne Brevo envoyée:', campaignId);
      
      return {
        success: true,
        message: 'Campagne envoyée avec succès'
      };

    } catch (error) {
      console.error('❌ Erreur envoi campagne Brevo:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Tester une campagne
   * @param {number} campaignId - ID de la campagne
   * @param {array} emailTo - Liste d'emails pour le test
   */
  sendTestCampaign: async (campaignId, emailTo = []) => {
    try {
      if (!BREVO_API_KEY) {
        console.log('📧 [SIMULATION] Test campagne Brevo:', campaignId);
        return { success: true, message: 'Test simulé' };
      }

      await brevoFetch(`/emailCampaigns/${campaignId}/sendTest`, {
        method: 'POST',
        body: JSON.stringify({ emailTo })
      });

      console.log('✅ Test campagne Brevo envoyé:', campaignId);
      
      return {
        success: true,
        message: 'Email de test envoyé avec succès'
      };

    } catch (error) {
      console.error('❌ Erreur test campagne Brevo:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtenir le rapport d'une campagne
   * @param {number} campaignId - ID de la campagne
   */
  getCampaignReport: async (campaignId) => {
    try {
      if (!BREVO_API_KEY) {
        console.log('📧 [SIMULATION] Rapport campagne Brevo:', campaignId);
        return { success: true, report: null };
      }

      const campaign = await brevoFetch(`/emailCampaigns/${campaignId}`);
      console.log('✅ Rapport campagne Brevo récupéré:', campaignId);
      
      return {
        success: true,
        report: {
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          statistics: campaign.statistics || {},
          subject: campaign.subject,
          sender: campaign.sender,
          createdAt: campaign.createdAt,
          modifiedAt: campaign.modifiedAt,
          scheduledAt: campaign.scheduledAt
        }
      };

    } catch (error) {
      console.error('❌ Erreur rapport campagne Brevo:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtenir les statistiques globales des campagnes
   */
  getCampaignsStats: async () => {
    try {
      if (!BREVO_API_KEY) {
        console.log('📧 [SIMULATION] Statistiques campagnes Brevo');
        return { 
          success: true, 
          stats: {
            totalCampaigns: 0,
            totalSent: 0,
            totalDelivered: 0,
            totalOpened: 0,
            totalClicked: 0,
            avgOpenRate: 0,
            avgClickRate: 0
          }
        };
      }

      // Récupérer les campagnes envoyées
      const result = await brevoFetch('/emailCampaigns?limit=100&status=sent');
      
      const stats = {
        totalCampaigns: result.count || 0,
        sent: 0,
        draft: 0,
        scheduled: 0,
        archived: 0,
        totalSent: 0,
        totalDelivered: 0,
        totalOpened: 0,
        totalClicked: 0,
        avgOpenRate: 0,
        avgClickRate: 0
      };

      if (result.campaigns && result.campaigns.length > 0) {
        result.campaigns.forEach(campaign => {
          if (campaign.status === 'sent') stats.sent++;
          if (campaign.status === 'draft') stats.draft++;
          if (campaign.status === 'scheduled') stats.scheduled++;
          if (campaign.status === 'archived') stats.archived++;
          
          if (campaign.statistics && campaign.statistics.globalStats) {
            const globalStats = campaign.statistics.globalStats;
            stats.totalSent += globalStats.sent || 0;
            stats.totalDelivered += globalStats.delivered || 0;
            stats.totalOpened += globalStats.uniqueOpens || 0;
            stats.totalClicked += globalStats.uniqueClicks || 0;
          }
        });

        if (stats.totalSent > 0) {
          stats.avgOpenRate = parseFloat(((stats.totalOpened / stats.totalSent) * 100).toFixed(2));
          stats.avgClickRate = parseFloat(((stats.totalClicked / stats.totalSent) * 100).toFixed(2));
        }
      }

      console.log('✅ Statistiques campagnes Brevo récupérées:', stats);
      
      return {
        success: true,
        stats
      };

    } catch (error) {
      console.error('❌ Erreur statistiques campagnes Brevo:', error);
      return { 
        success: false, 
        error: error.message,
        stats: {
          totalCampaigns: 0,
          totalSent: 0,
          totalDelivered: 0,
          totalOpened: 0,
          totalClicked: 0,
          avgOpenRate: 0,
          avgClickRate: 0
        }
      };
    }
  }
};

export default brevoCampaignsService;
