import sgMail from '@sendgrid/mail';
import { emailTemplates, getTemplate } from './email-templates.service.js';

// ============================================================================
// SERVICE D'ENVOI D'EMAILS - SENDGRID
// ============================================================================

// Configuration SendGrid
const SENDGRID_API_KEY_RAW = import.meta.env?.VITE_SENDGRID_API_KEY || process.env.VITE_SENDGRID_API_KEY;
// Valider que la clé commence par "SG." (format SendGrid valide)
const SENDGRID_API_KEY = SENDGRID_API_KEY_RAW?.startsWith('SG.') ? SENDGRID_API_KEY_RAW : null;
const FROM_EMAIL = import.meta.env?.VITE_FROM_EMAIL || process.env.VITE_FROM_EMAIL || 'newsletter@maxiimarket.com';
const FROM_NAME = import.meta.env?.VITE_FROM_NAME || process.env.VITE_FROM_NAME || 'MaxiMarket Newsletter';

// Initialiser SendGrid seulement si la clé est valide
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
} else {
  console.log('📧 SendGrid non configuré - utilisation de Brevo comme provider principal');
}

export const emailService = {
  // Envoyer un email simple
  sendEmail: async (to, subject, content, isHtml = false) => {
    try {
      if (!SENDGRID_API_KEY) {
        console.log('📧 [SIMULATION] Email envoyé à:', to);
        console.log('📧 [SIMULATION] Sujet:', subject);
        console.log('📧 [SIMULATION] Contenu:', content);
        return { success: true, message: 'Email simulé (SendGrid non configuré)' };
      }

      const msg = {
        to,
        from: {
          email: FROM_EMAIL,
          name: FROM_NAME
        },
        subject,
        ...(isHtml ? { html: content } : { text: content })
      };

      const response = await sgMail.send(msg);
      console.log('✅ Email envoyé avec succès:', response[0].statusCode);
      
      return { success: true, message: 'Email envoyé avec succès' };
    } catch (error) {
      console.error('❌ Erreur envoi email:', error);
      throw error;
    }
  },

  // Envoyer un email de bienvenue
  sendWelcomeEmail: async (email, firstName = '') => {
    const template = getTemplate('welcomeNewsletter', { email, firstName });
    return emailService.sendEmail(email, template.subject, template.html, true);
  },

  // Envoyer une newsletter à tous les abonnés
  sendNewsletter: async (subscribers, subject, content, isHtml = false) => {
    try {
      if (!subscribers || subscribers.length === 0) {
        throw new Error('Aucun abonné à qui envoyer la newsletter');
      }

      console.log(`📧 Envoi de newsletter à ${subscribers.length} abonnés`);

      // Envoyer en batch pour éviter les limites SendGrid
      const batchSize = 100;
      const batches = [];
      
      for (let i = 0; i < subscribers.length; i += batchSize) {
        batches.push(subscribers.slice(i, i + batchSize));
      }

      let successCount = 0;
      let errorCount = 0;

      for (const batch of batches) {
        try {
          const emails = batch.map(sub => sub.email);
          
          if (SENDGRID_API_KEY) {
            const msg = {
              to: emails,
              from: {
                email: FROM_EMAIL,
                name: FROM_NAME
              },
              subject,
              ...(isHtml ? { html: content } : { text: content })
            };

            await sgMail.sendMultiple(msg);
            successCount += batch.length;
          } else {
            // Mode simulation
            console.log(`📧 [SIMULATION] Newsletter envoyée à ${batch.length} abonnés`);
            successCount += batch.length;
          }
        } catch (error) {
          console.error('❌ Erreur envoi batch:', error);
          errorCount += batch.length;
        }
      }

      console.log(`✅ Newsletter envoyée: ${successCount} succès, ${errorCount} erreurs`);
      
      return {
        success: true,
        message: `Newsletter envoyée à ${successCount} abonnés`,
        stats: { successCount, errorCount, total: subscribers.length }
      };

    } catch (error) {
      console.error('❌ Erreur envoi newsletter:', error);
      throw error;
    }
  },

  // Envoyer un email de réactivation
  sendReactivationEmail: async (email) => {
    const template = getTemplate('reactivationNewsletter', { email });
    return emailService.sendEmail(email, template.subject, template.html, true);
  },

  // Envoyer un email avec template
  sendTemplateEmail: async (email, templateName, data = {}) => {
    try {
      const template = getTemplate(templateName, data);
      return emailService.sendEmail(email, template.subject, template.html, true);
    } catch (error) {
      console.error(`❌ Erreur envoi template ${templateName}:`, error);
      throw error;
    }
  },

  // Envoyer une newsletter hebdomadaire
  sendWeeklyNewsletter: async (subscribers, data = {}) => {
    const template = getTemplate('weeklyNewsletter', data);
    return emailService.sendNewsletter(subscribers, template.subject, template.html, true);
  },

  // Envoyer une newsletter mensuelle
  sendMonthlyNewsletter: async (subscribers, data = {}) => {
    const template = getTemplate('monthlyNewsletter', data);
    return emailService.sendNewsletter(subscribers, template.subject, template.html, true);
  },

  // Envoyer une offre spéciale
  sendSpecialOffer: async (subscribers, data = {}) => {
    const template = getTemplate('specialOffer', data);
    return emailService.sendNewsletter(subscribers, template.subject, template.html, true);
  },

  // Envoyer un email de réengagement
  sendReengagementEmail: async (email, data = {}) => {
    const template = getTemplate('reengagementEmail', data);
    return emailService.sendEmail(email, template.subject, template.html, true);
  },

  // Envoyer une notification de maintenance
  sendMaintenanceNotification: async (subscribers, data = {}) => {
    const template = getTemplate('maintenanceNotification', data);
    return emailService.sendNewsletter(subscribers, template.subject, template.html, true);
  },

  // Envoyer une alerte de sécurité
  sendSecurityAlert: async (email, data = {}) => {
    const template = getTemplate('securityAlert', data);
    return emailService.sendEmail(email, template.subject, template.html, true);
  },

  // Envoyer une confirmation de création de compte
  sendAccountCreatedEmail: async (email, data = {}) => {
    const template = getTemplate('accountCreated', data);
    return emailService.sendEmail(email, template.subject, template.html, true);
  },

  // Envoyer un email de réinitialisation de mot de passe
  sendPasswordResetEmail: async (email, data = {}) => {
    const template = getTemplate('passwordReset', data);
    return emailService.sendEmail(email, template.subject, template.html, true);
  },

  // Envoyer une confirmation de désinscription
  sendUnsubscribeConfirmation: async (email) => {
    const template = getTemplate('unsubscribeConfirmation', { email });
    return emailService.sendEmail(email, template.subject, template.html, true);
  },

  // Vérifier la configuration
  checkConfiguration: () => {
    const config = {
      sendgridConfigured: !!SENDGRID_API_KEY,
      fromEmail: FROM_EMAIL,
      fromName: FROM_NAME
    };

    console.log('🔧 Configuration email service:', config);
    return config;
  }
};

export default emailService;
