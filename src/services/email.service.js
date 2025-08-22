import sgMail from '@sendgrid/mail';

// ============================================================================
// SERVICE D'ENVOI D'EMAILS - SENDGRID
// ============================================================================

// Configuration SendGrid
const SENDGRID_API_KEY = import.meta.env?.VITE_SENDGRID_API_KEY || process.env.VITE_SENDGRID_API_KEY;
const FROM_EMAIL = import.meta.env?.VITE_FROM_EMAIL || process.env.VITE_FROM_EMAIL || 'newsletter@maximarket.com';
const FROM_NAME = import.meta.env?.VITE_FROM_NAME || process.env.VITE_FROM_NAME || 'MaxiMarket Newsletter';

// Initialiser SendGrid
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
} else {
  console.warn('⚠️ VITE_SENDGRID_API_KEY non configurée - emails en mode simulation');
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
    const subject = '🎉 Bienvenue sur MaxiMarket !';
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenue sur MaxiMarket</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
          .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #667eea; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Bienvenue sur MaxiMarket !</h1>
            <p>Votre marketplace de confiance pour l'Afrique de l'Ouest</p>
          </div>
          
          <div class="content">
            <h2>Bonjour ${firstName || 'Cher utilisateur'} !</h2>
            
            <p>Merci de vous être inscrit à notre newsletter ! Vous recevrez désormais nos dernières actualités, offres spéciales et conseils pour optimiser votre expérience sur MaxiMarket.</p>
            
            <h3>🚀 Découvrez nos fonctionnalités :</h3>
            
            <div class="feature">
              <strong>🏠 Immobilier</strong><br>
              Achetez, vendez ou louez des biens immobiliers en toute sécurité
            </div>
            
            <div class="feature">
              <strong>🚗 Automobile</strong><br>
              Trouvez votre véhicule idéal parmi des milliers d'annonces
            </div>
            
            <div class="feature">
              <strong>🛠️ Services</strong><br>
              Connectez-vous avec des professionnels qualifiés
            </div>
            
            <div class="feature">
              <strong>🛍️ Marketplace</strong><br>
              Tout ce dont vous avez besoin en un seul endroit
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${window.location.origin}/marketplace" class="button">Explorer MaxiMarket</a>
              <a href="${window.location.origin}/creer-annonce" class="button">Créer une annonce</a>
            </div>
            
            <h3>💡 Conseils pour bien commencer :</h3>
            <ul>
              <li>Complétez votre profil pour plus de visibilité</li>
              <li>Ajoutez des photos de qualité à vos annonces</li>
              <li>Répondez rapidement aux messages</li>
              <li>Utilisez des mots-clés pertinents</li>
            </ul>
            
            <p><strong>Besoin d'aide ?</strong> Notre équipe support est disponible 24/7 pour vous accompagner.</p>
          </div>
          
          <div class="footer">
            <p>© 2024 MaxiMarket. Tous droits réservés.</p>
            <p>Vous recevez cet email car vous vous êtes inscrit à notre newsletter.</p>
            <p><a href="${window.location.origin}/newsletter/unsubscribe?email=${email}">Se désinscrire</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    return emailService.sendEmail(email, subject, htmlContent, true);
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
    const subject = '🔄 Réactivation de votre inscription MaxiMarket';
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Réactivation MaxiMarket</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔄 Bienvenue de retour !</h1>
          </div>
          <div class="content">
            <h2>Votre inscription a été réactivée</h2>
            <p>Vous recevrez à nouveau nos newsletters et actualités.</p>
            <p>Merci de votre confiance !</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${window.location.origin}" class="button">Visiter MaxiMarket</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return emailService.sendEmail(email, subject, htmlContent, true);
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
