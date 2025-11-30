import { brevoService } from './brevo.service.js';
import { emailService as sendgridService } from '../email.service.js';
import { getTemplateParams, getBrevoTemplateId } from './brevo-templates.service.js';

// ============================================================================
// SERVICE ABSTRACTION - PROVIDER D'EMAILS (BREVO/SENDGRID)
// ============================================================================

const EMAIL_PROVIDER = import.meta.env?.VITE_EMAIL_PROVIDER || process.env.VITE_EMAIL_PROVIDER || 'brevo';
const USE_FALLBACK = import.meta.env?.VITE_EMAIL_USE_FALLBACK !== 'false';

console.log(`📧 Provider email actif: ${EMAIL_PROVIDER}`);
console.log(`📧 Fallback activé: ${USE_FALLBACK}`);

export const emailProviderService = {
  /**
   * Envoyer un email simple
   * @param {string} to - Email du destinataire
   * @param {string} subject - Sujet
   * @param {string} content - Contenu HTML
   * @param {object} options - Options supplémentaires
   */
  sendEmail: async (to, subject, content, options = {}) => {
    try {
      // Essayer avec le provider principal
      if (EMAIL_PROVIDER === 'brevo') {
        return await brevoService.sendEmail(to, subject, content, options.textContent, options.params);
      } else {
        return await sendgridService.sendEmail(to, subject, content, true);
      }
    } catch (error) {
      console.error(`❌ Erreur avec ${EMAIL_PROVIDER}:`, error);
      
      // Fallback vers l'autre provider
      if (USE_FALLBACK) {
        console.log('🔄 Tentative avec le provider de fallback...');
        try {
          if (EMAIL_PROVIDER === 'brevo') {
            return await sendgridService.sendEmail(to, subject, content, true);
          } else {
            return await brevoService.sendEmail(to, subject, content, options.textContent, options.params);
          }
        } catch (fallbackError) {
          console.error('❌ Erreur avec le fallback:', fallbackError);
          throw fallbackError;
        }
      }
      
      throw error;
    }
  },

  /**
   * Envoyer un email avec template
   * @param {string} to - Email du destinataire
   * @param {string} templateType - Type de template
   * @param {object} data - Données du template
   */
  sendTemplateEmail: async (to, templateType, data = {}) => {
    try {
      if (EMAIL_PROVIDER === 'brevo') {
        // Utiliser les templates Brevo
        const templateId = getBrevoTemplateId(templateType);
        if (!templateId) {
          throw new Error(`Template Brevo non trouvé: ${templateType}`);
        }
        
        const params = getTemplateParams(templateType, data);
        return await brevoService.sendTemplateEmail(to, templateId, params);
      } else {
        // Utiliser les templates SendGrid (HTML)
        return await sendgridService.sendTemplateEmail(to, templateType, data);
      }
    } catch (error) {
      console.error(`❌ Erreur template avec ${EMAIL_PROVIDER}:`, error);
      
      // Fallback
      if (USE_FALLBACK) {
        console.log('🔄 Tentative template avec le provider de fallback...');
        try {
          if (EMAIL_PROVIDER === 'brevo') {
            return await sendgridService.sendTemplateEmail(to, templateType, data);
          } else {
            const templateId = getBrevoTemplateId(templateType);
            if (templateId) {
              const params = getTemplateParams(templateType, data);
              return await brevoService.sendTemplateEmail(to, templateId, params);
            }
            throw new Error('Template Brevo non disponible pour fallback');
          }
        } catch (fallbackError) {
          console.error('❌ Erreur fallback template:', fallbackError);
          throw fallbackError;
        }
      }
      
      throw error;
    }
  },

  /**
   * Envoyer une newsletter à plusieurs destinataires
   * @param {Array} subscribers - Liste des abonnés
   * @param {string} subject - Sujet
   * @param {string} content - Contenu HTML
   */
  sendNewsletter: async (subscribers, subject, content) => {
    try {
      if (EMAIL_PROVIDER === 'brevo') {
        return await brevoService.sendBatchEmail(
          subscribers.map(s => ({ email: s.email, name: s.name || '' })),
          subject,
          content
        );
      } else {
        return await sendgridService.sendNewsletter(subscribers, subject, content, true);
      }
    } catch (error) {
      console.error(`❌ Erreur newsletter avec ${EMAIL_PROVIDER}:`, error);
      
      // Fallback
      if (USE_FALLBACK) {
        console.log('🔄 Tentative newsletter avec le provider de fallback...');
        try {
          if (EMAIL_PROVIDER === 'brevo') {
            return await sendgridService.sendNewsletter(subscribers, subject, content, true);
          } else {
            return await brevoService.sendBatchEmail(
              subscribers.map(s => ({ email: s.email, name: s.name || '' })),
              subject,
              content
            );
          }
        } catch (fallbackError) {
          console.error('❌ Erreur fallback newsletter:', fallbackError);
          throw fallbackError;
        }
      }
      
      throw error;
    }
  },

  /**
   * Envoyer un email de bienvenue
   * @param {string} email - Email du destinataire
   * @param {string} firstName - Prénom (optionnel)
   */
  sendWelcomeEmail: async (email, firstName = '') => {
    return await emailProviderService.sendTemplateEmail(email, 'welcomeNewsletter', { email, firstName });
  },

  /**
   * Envoyer un email de réactivation
   * @param {string} email - Email du destinataire
   */
  sendReactivationEmail: async (email) => {
    return await emailProviderService.sendTemplateEmail(email, 'reactivationNewsletter', { email });
  },

  /**
   * Envoyer une newsletter hebdomadaire
   * @param {Array} subscribers - Liste des abonnés
   * @param {object} data - Données de la newsletter
   */
  sendWeeklyNewsletter: async (subscribers, data = {}) => {
    return await emailProviderService.sendTemplateEmail(
      subscribers.map(s => s.email),
      'weeklyNewsletter',
      data
    );
  },

  /**
   * Envoyer une newsletter mensuelle
   * @param {Array} subscribers - Liste des abonnés
   * @param {object} data - Données de la newsletter
   */
  sendMonthlyNewsletter: async (subscribers, data = {}) => {
    return await emailProviderService.sendTemplateEmail(
      subscribers.map(s => s.email),
      'monthlyNewsletter',
      data
    );
  },

  /**
   * Envoyer une offre spéciale
   * @param {Array} subscribers - Liste des abonnés
   * @param {object} data - Données de l'offre
   */
  sendSpecialOffer: async (subscribers, data = {}) => {
    return await emailProviderService.sendTemplateEmail(
      subscribers.map(s => s.email),
      'specialOffer',
      data
    );
  },

  /**
   * Envoyer un email de réengagement
   * @param {string} email - Email du destinataire
   * @param {object} data - Données de réengagement
   */
  sendReengagementEmail: async (email, data = {}) => {
    return await emailProviderService.sendTemplateEmail(email, 'reengagementEmail', data);
  },

  /**
   * Envoyer une notification de maintenance
   * @param {Array} subscribers - Liste des abonnés
   * @param {object} data - Données de maintenance
   */
  sendMaintenanceNotification: async (subscribers, data = {}) => {
    return await emailProviderService.sendTemplateEmail(
      subscribers.map(s => s.email),
      'maintenanceNotification',
      data
    );
  },

  /**
   * Envoyer une alerte de sécurité
   * @param {string} email - Email du destinataire
   * @param {object} data - Données de l'alerte
   */
  sendSecurityAlert: async (email, data = {}) => {
    return await emailProviderService.sendTemplateEmail(email, 'securityAlert', data);
  },

  /**
   * Envoyer une confirmation de création de compte
   * @param {string} email - Email du destinataire
   * @param {object} data - Données du compte
   */
  sendAccountCreatedEmail: async (email, data = {}) => {
    return await emailProviderService.sendTemplateEmail(email, 'accountCreated', data);
  },

  /**
   * Envoyer un email de réinitialisation de mot de passe
   * @param {string} email - Email du destinataire
   * @param {object} data - Données de réinitialisation
   */
  sendPasswordResetEmail: async (email, data = {}) => {
    return await emailProviderService.sendTemplateEmail(email, 'passwordReset', data);
  },

  /**
   * Envoyer une confirmation de désinscription
   * @param {string} email - Email du destinataire
   */
  sendUnsubscribeConfirmation: async (email) => {
    return await emailProviderService.sendTemplateEmail(email, 'unsubscribeConfirmation', { email });
  },

  // ============================================================================
  // NOUVEAUX TEMPLATES - ANNONCES, MESSAGES, TRANSACTIONS, MODÉRATION
  // ============================================================================

  /**
   * Annonce publiée
   */
  sendListingPublishedEmail: async (email, data = {}) => {
    return await emailProviderService.sendTemplateEmail(email, 'listingPublished', data);
  },

  /**
   * Annonce approuvée
   */
  sendListingApprovedEmail: async (email, data = {}) => {
    return await emailProviderService.sendTemplateEmail(email, 'listingApproved', data);
  },

  /**
   * Annonce rejetée
   */
  sendListingRejectedEmail: async (email, data = {}) => {
    return await emailProviderService.sendTemplateEmail(email, 'listingRejected', data);
  },

  /**
   * Nouveau message
   */
  sendNewMessageEmail: async (email, data = {}) => {
    return await emailProviderService.sendTemplateEmail(email, 'newMessage', data);
  },

  /**
   * Réponse à un message
   */
  sendMessageReplyEmail: async (email, data = {}) => {
    return await emailProviderService.sendTemplateEmail(email, 'messageReply', data);
  },

  /**
   * Paiement reçu
   */
  sendPaymentReceivedEmail: async (email, data = {}) => {
    return await emailProviderService.sendTemplateEmail(email, 'paymentReceived', data);
  },

  /**
   * Paiement échoué
   */
  sendPaymentFailedEmail: async (email, data = {}) => {
    return await emailProviderService.sendTemplateEmail(email, 'paymentFailed', data);
  },

  /**
   * Boost activé
   */
  sendBoostActivatedEmail: async (email, data = {}) => {
    return await emailProviderService.sendTemplateEmail(email, 'boostActivated', data);
  },

  /**
   * Boost expire bientôt
   */
  sendBoostExpiringSoonEmail: async (email, data = {}) => {
    return await emailProviderService.sendTemplateEmail(email, 'boostExpiringSoon', data);
  },

  /**
   * Vérification email
   */
  sendEmailVerificationEmail: async (email, data = {}) => {
    return await emailProviderService.sendTemplateEmail(email, 'emailVerification', data);
  },

  /**
   * Avertissement compte
   */
  sendAccountWarningEmail: async (email, data = {}) => {
    return await emailProviderService.sendTemplateEmail(email, 'accountWarning', data);
  },

  /**
   * Compte suspendu
   */
  sendAccountSuspendedEmail: async (email, data = {}) => {
    return await emailProviderService.sendTemplateEmail(email, 'accountSuspended', data);
  },

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  /**
   * Vérifier la configuration du provider actif
   */
  checkConfiguration: () => {
    const config = {
      activeProvider: EMAIL_PROVIDER,
      fallbackEnabled: USE_FALLBACK,
      brevo: brevoService.checkConfiguration(),
      sendgrid: sendgridService.checkConfiguration()
    };

    console.log('🔧 Configuration email provider:', config);
    return config;
  },

  /**
   * Obtenir le provider actif
   */
  getActiveProvider: () => {
    return EMAIL_PROVIDER;
  },

  /**
   * Basculer vers un autre provider (pour tests)
   */
  switchProvider: (newProvider) => {
    if (newProvider !== 'brevo' && newProvider !== 'sendgrid') {
      throw new Error('Provider invalide. Utilisez "brevo" ou "sendgrid"');
    }
    
    console.log(`🔄 Basculement vers le provider: ${newProvider}`);
    // Note: Cette fonction nécessite de redémarrer l'app pour prendre effet
    // car les variables d'environnement sont chargées au démarrage
    return {
      success: true,
      message: `Redémarrez l'application pour utiliser ${newProvider}`,
      currentProvider: EMAIL_PROVIDER,
      newProvider
    };
  }
};

export default emailProviderService;
