// ============================================================================
// SERVICE BREVO - ENVOI D'EMAILS ET GESTION DES CONTACTS (API REST)
// ============================================================================

// Configuration Brevo
const BREVO_API_KEY = import.meta.env?.VITE_BREVO_API_KEY || process.env.VITE_BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3';
const FROM_EMAIL = import.meta.env?.VITE_FROM_EMAIL || process.env.VITE_FROM_EMAIL || 'info@maxiimarket.com';
const FROM_NAME = import.meta.env?.VITE_FROM_NAME || process.env.VITE_FROM_NAME || 'MaxiMarket';

if (BREVO_API_KEY) {
  console.log('✅ Brevo API configurée');
} else {
  console.warn('⚠️ VITE_BREVO_API_KEY non configurée - emails en mode simulation');
}

export const brevoService = {
  // ============================================================================
  // ENVOI D'EMAILS TRANSACTIONNELS
  // ============================================================================

  /**
   * Envoyer un email simple
   * @param {string} to - Email du destinataire
   * @param {string} subject - Sujet de l'email
   * @param {string} htmlContent - Contenu HTML
   * @param {string} textContent - Contenu texte (optionnel)
   * @param {object} params - Paramètres de personnalisation (optionnel)
   */
  sendEmail: async (to, subject, htmlContent, textContent = null, params = {}) => {
    try {
      if (!BREVO_API_KEY) {
        console.log('📧 [SIMULATION] Email Brevo envoyé à:', to);
        console.log('📧 [SIMULATION] Sujet:', subject);
        return { success: true, message: 'Email simulé (Brevo non configuré)', messageId: 'sim-' + Date.now() };
      }

      const payload = {
        sender: { name: FROM_NAME, email: FROM_EMAIL },
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlContent
      };

      if (textContent) {
        payload.textContent = textContent;
      }

      if (Object.keys(params).length > 0) {
        payload.params = params;
      }

      const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': BREVO_API_KEY,
          'content-type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Email Brevo envoyé avec succès:', data.messageId);
      
      return {
        success: true,
        message: 'Email envoyé avec succès',
        messageId: data.messageId
      };

    } catch (error) {
      console.error('❌ Erreur envoi email Brevo:', error);
      throw error;
    }
  },

  /**
   * Envoyer un email avec template Brevo
   * @param {string} to - Email du destinataire
   * @param {number} templateId - ID du template Brevo
   * @param {object} params - Paramètres du template
   */
  sendTemplateEmail: async (to, templateId, params = {}) => {
    console.log('📧 [BREVO] sendTemplateEmail appelé');
    console.log('📧 [BREVO] Destinataire:', to);
    console.log('📧 [BREVO] Template ID:', templateId);
    console.log('📧 [BREVO] Params:', JSON.stringify(params, null, 2));
    console.log('📧 [BREVO] API Key configurée:', !!BREVO_API_KEY);
    
    try {
      if (!BREVO_API_KEY) {
        console.warn('⚠️ [BREVO] VITE_BREVO_API_KEY non configurée - email en mode SIMULATION');
        console.log('📧 [SIMULATION] Email template Brevo envoyé à:', to);
        console.log('📧 [SIMULATION] Template ID:', templateId);
        return { success: true, message: 'Email simulé (Brevo non configuré)', messageId: 'sim-' + Date.now() };
      }

      const payload = {
        sender: { name: FROM_NAME, email: FROM_EMAIL },
        to: [{ email: to }],
        templateId: templateId,
        params: params
      };

      console.log('📧 [BREVO] Payload envoyé:', JSON.stringify(payload, null, 2));

      const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': BREVO_API_KEY,
          'content-type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('📧 [BREVO] Réponse HTTP status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ [BREVO] Erreur API:', error);
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ [BREVO] Email template envoyé avec succès!');
      console.log('✅ [BREVO] Message ID:', data.messageId);
      
      return {
        success: true,
        message: 'Email template envoyé avec succès',
        messageId: data.messageId
      };

    } catch (error) {
      console.error('❌ [BREVO] Erreur envoi email template:', error);
      console.error('❌ [BREVO] Stack:', error.stack);
      throw error;
    }
  },

  /**
   * Envoyer un email en masse (batch)
   * @param {Array} recipients - Liste des destinataires [{email, name, params}]
   * @param {string} subject - Sujet de l'email
   * @param {string} htmlContent - Contenu HTML
   */
  sendBatchEmail: async (recipients, subject, htmlContent) => {
    try {
      if (!BREVO_API_KEY) {
        console.log('📧 [SIMULATION] Batch email Brevo envoyé à', recipients.length, 'destinataires');
        return { success: true, message: 'Batch simulé', sent: recipients.length };
      }

      const results = [];
      const batchSize = 50; // Limite Brevo
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);
        
        const payload = {
          sender: { name: FROM_NAME, email: FROM_EMAIL },
          to: batch.map(r => ({ 
            email: r.email, 
            name: r.name || '' 
          })),
          subject: subject,
          htmlContent: htmlContent
        };

        try {
          const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
            method: 'POST',
            headers: {
              'accept': 'application/json',
              'api-key': BREVO_API_KEY,
              'content-type': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `HTTP ${response.status}`);
          }

          const data = await response.json();
          results.push({ success: true, batch: i / batchSize + 1, messageId: data.messageId });
          successCount += batch.length;
        } catch (error) {
          console.error(`❌ Erreur batch ${i / batchSize + 1}:`, error);
          results.push({ success: false, batch: i / batchSize + 1, error: error.message });
          errorCount += batch.length;
        }
      }

      console.log(`✅ Batch email Brevo: ${successCount} succès, ${errorCount} erreurs`);

      return {
        success: true,
        message: `${successCount} emails envoyés, ${errorCount} erreurs`,
        sent: successCount,
        errors: errorCount,
        results
      };

    } catch (error) {
      console.error('❌ Erreur batch email Brevo:', error);
      throw error;
    }
  },

  // ============================================================================
  // GESTION DES CONTACTS
  // ============================================================================

  /**
   * Créer ou mettre à jour un contact
   * @param {string} email - Email du contact
   * @param {object} attributes - Attributs du contact
   * @param {Array} listIds - IDs des listes à ajouter
   */
  createOrUpdateContact: async (email, attributes = {}, listIds = []) => {
    try {
      if (!BREVO_API_KEY) {
        console.log('📧 [SIMULATION] Contact Brevo créé/mis à jour:', email);
        return { success: true, message: 'Contact simulé' };
      }

      const payload = {
        email: email,
        attributes: attributes,
        updateEnabled: true
      };
      
      if (listIds.length > 0) {
        payload.listIds = listIds;
      }

      const response = await fetch(`${BREVO_API_URL}/contacts`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': BREVO_API_KEY,
          'content-type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok && response.status !== 204) {
        const error = await response.json();
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      console.log('✅ Contact Brevo créé/mis à jour:', email);
      return { success: true, message: 'Contact créé/mis à jour' };

    } catch (error) {
      console.error('❌ Erreur gestion contact Brevo:', error);
      throw error;
    }
  },

  /**
   * Obtenir un contact
   * @param {string} email - Email du contact
   */
  getContact: async (email) => {
    try {
      if (!BREVO_API_KEY) {
        console.log('📧 [SIMULATION] Récupération contact Brevo:', email);
        return { success: true, contact: null };
      }

      const response = await fetch(`${BREVO_API_URL}/contacts/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'api-key': BREVO_API_KEY
        }
      });

      if (response.status === 404) {
        return { success: true, contact: null };
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const contact = await response.json();
      console.log('✅ Contact Brevo récupéré:', email);
      
      return { success: true, contact };

    } catch (error) {
      console.error('❌ Erreur récupération contact Brevo:', error);
      throw error;
    }
  },

  /**
   * Supprimer un contact
   * @param {string} email - Email du contact
   */
  deleteContact: async (email) => {
    try {
      if (!BREVO_API_KEY) {
        console.log('📧 [SIMULATION] Contact Brevo supprimé:', email);
        return { success: true, message: 'Contact simulé supprimé' };
      }

      const response = await fetch(`${BREVO_API_URL}/contacts/${encodeURIComponent(email)}`, {
        method: 'DELETE',
        headers: {
          'accept': 'application/json',
          'api-key': BREVO_API_KEY
        }
      });

      if (!response.ok && response.status !== 204) {
        const error = await response.json();
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      console.log('✅ Contact Brevo supprimé:', email);
      return { success: true, message: 'Contact supprimé' };

    } catch (error) {
      console.error('❌ Erreur suppression contact Brevo:', error);
      throw error;
    }
  },

  /**
   * Ajouter un contact à une liste
   * @param {Array} emails - Liste d'emails
   * @param {number} listId - ID de la liste Brevo
   */
  addContactsToList: async (emails, listId) => {
    try {
      if (!BREVO_API_KEY) {
        console.log('📧 [SIMULATION] Contacts ajoutés à la liste:', listId);
        return { success: true, message: 'Contacts simulés ajoutés' };
      }

      const response = await fetch(`${BREVO_API_URL}/contacts/lists/${listId}/contacts/add`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': BREVO_API_KEY,
          'content-type': 'application/json'
        },
        body: JSON.stringify({ emails })
      });

      if (!response.ok && response.status !== 204) {
        const error = await response.json();
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      console.log(`✅ ${emails.length} contacts ajoutés à la liste ${listId}`);
      return { success: true, message: `${emails.length} contacts ajoutés à la liste` };

    } catch (error) {
      console.error('❌ Erreur ajout contacts à la liste Brevo:', error);
      throw error;
    }
  },

  /**
   * Retirer un contact d'une liste
   * @param {Array} emails - Liste d'emails
   * @param {number} listId - ID de la liste Brevo
   */
  removeContactsFromList: async (emails, listId) => {
    try {
      if (!BREVO_API_KEY) {
        console.log('📧 [SIMULATION] Contacts retirés de la liste:', listId);
        return { success: true, message: 'Contacts simulés retirés' };
      }

      const response = await fetch(`${BREVO_API_URL}/contacts/lists/${listId}/contacts/remove`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': BREVO_API_KEY,
          'content-type': 'application/json'
        },
        body: JSON.stringify({ emails })
      });

      if (!response.ok && response.status !== 204) {
        const error = await response.json();
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      console.log(`✅ ${emails.length} contacts retirés de la liste ${listId}`);
      return { success: true, message: `${emails.length} contacts retirés de la liste` };

    } catch (error) {
      console.error('❌ Erreur retrait contacts de la liste Brevo:', error);
      throw error;
    }
  },

  // ============================================================================
  // UTILITAIRES
  // ============================================================================

  /**
   * Vérifier la configuration Brevo
   */
  checkConfiguration: () => {
    const config = {
      brevoConfigured: !!BREVO_API_KEY,
      fromEmail: FROM_EMAIL,
      fromName: FROM_NAME
    };

    console.log('🔧 Configuration Brevo:', config);
    return config;
  },

  /**
   * Obtenir les statistiques d'envoi
   * @param {string} startDate - Date de début (YYYY-MM-DD)
   * @param {string} endDate - Date de fin (YYYY-MM-DD)
   */
  getEmailStats: async (startDate, endDate) => {
    try {
      if (!BREVO_API_KEY) {
        console.log('📧 [SIMULATION] Statistiques Brevo');
        return { success: true, stats: null };
      }

      const response = await fetch(`${BREVO_API_URL}/smtp/statistics/events?startDate=${startDate}&endDate=${endDate}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'api-key': BREVO_API_KEY
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const stats = await response.json();
      console.log('✅ Statistiques Brevo récupérées');
      
      return { success: true, stats };

    } catch (error) {
      console.error('❌ Erreur récupération statistiques Brevo:', error);
      throw error;
    }
  }
};

export default brevoService;
