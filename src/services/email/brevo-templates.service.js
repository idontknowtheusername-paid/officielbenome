// ============================================================================
// SERVICE BREVO - TEMPLATES D'EMAILS POUR MAXIMARKET
// ============================================================================

/**
 * IDs des templates Brevo (à configurer après création dans Brevo)
 * Ces IDs correspondent aux templates créés dans l'interface Brevo
 */
export const BREVO_TEMPLATE_IDS = {
  // Templates de bienvenue et inscription
  WELCOME_NEWSLETTER: 1, // Email de bienvenue newsletter ✅ CRÉÉ
  REACTIVATION_NEWSLETTER: 1, // Réactivation d'abonnement (utilise welcome)
  SUBSCRIPTION_CONFIRMATION: 1, // Confirmation d'inscription (utilise welcome)
  UNSUBSCRIBE_CONFIRMATION: 1, // Confirmation de désinscription (utilise welcome)
  
  // Templates de newsletters
  WEEKLY_NEWSLETTER: 3, // Newsletter hebdomadaire ✅ CRÉÉ
  MONTHLY_NEWSLETTER: 6, // Newsletter mensuelle ✅ CRÉÉ
  
  // Templates marketing
  SPECIAL_OFFER: 4, // Offres spéciales ✅ CRÉÉ
  REENGAGEMENT: 7, // Réengagement utilisateurs inactifs ✅ CRÉÉ
  
  // Templates système
  MAINTENANCE_NOTIFICATION: 8, // Notifications de maintenance ✅ CRÉÉ
  SECURITY_ALERT: 1, // Alertes de sécurité (utilise welcome)
  
  // Templates compte utilisateur
  ACCOUNT_CREATED: 5, // Création de compte ✅ CRÉÉ
  PASSWORD_RESET: 2, // Réinitialisation mot de passe ✅ CRÉÉ
  EMAIL_VERIFICATION: 5, // Vérification email (utilise account created)
  
  // Templates annonces
  LISTING_PUBLISHED: 9, // Annonce publiée ✅ CRÉÉ
  LISTING_APPROVED: 14, // Annonce approuvée ✅ CRÉÉ
  LISTING_REJECTED: 15, // Annonce rejetée ✅ CRÉÉ
  LISTING_EXPIRED: 9, // Annonce expirée (utilise listing published)
  
  // Templates messagerie
  NEW_MESSAGE: 10, // Nouveau message ✅ CRÉÉ
  MESSAGE_REPLY: 17, // Réponse à un message ✅ CRÉÉ
  
  // Templates transactions
  PAYMENT_RECEIVED: 11, // Paiement reçu ✅ CRÉÉ
  PAYMENT_FAILED: 16, // Paiement échoué ✅ CRÉÉ
  BOOST_ACTIVATED: 12, // Boost activé ✅ CRÉÉ
  BOOST_EXPIRING_SOON: 18, // Boost expire bientôt ✅ CRÉÉ
  
  // Templates modération
  CONTENT_FLAGGED: 19, // Contenu signalé (utilise account warning)
  ACCOUNT_WARNING: 19, // Avertissement compte ✅ CRÉÉ
  ACCOUNT_SUSPENDED: 20, // Compte suspendu ✅ CRÉÉ
  ACCOUNT_REACTIVATED: 5 // Compte réactivé (utilise account created)
};

/**
 * Paramètres par défaut pour les templates
 */
export const getTemplateParams = (templateType, data = {}) => {
  const appUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : (process.env.VITE_APP_URL || 'https://maximarket.com');
    
  const baseParams = {
    APP_NAME: 'MaxiMarket',
    APP_URL: appUrl,
    CURRENT_YEAR: new Date().getFullYear(),
    SUPPORT_EMAIL: 'support@maximarket.com',
    UNSUBSCRIBE_URL: `${appUrl}/newsletter/unsubscribe`
  };

  const specificParams = {
    // Bienvenue newsletter
    welcomeNewsletter: {
      FIRST_NAME: data.firstName || 'Cher utilisateur',
      EMAIL: data.email,
      MARKETPLACE_URL: `${appUrl}/marketplace`,
      CREATE_LISTING_URL: `${appUrl}/creer-annonce`,
      PROFILE_URL: `${appUrl}/profil`
    },

    // Newsletter hebdomadaire
    weeklyNewsletter: {
      WEEK_START: data.weekStart || 'cette semaine',
      NEW_LISTINGS: data.newListings || '150+',
      ACTIVE_USERS: data.activeUsers || '2.5k',
      TRANSACTIONS: data.transactions || '89',
      NEW_USERS: data.newUsers || '320',
      FEATURED_LISTINGS: JSON.stringify(data.featuredListings || [])
    },

    // Newsletter mensuelle
    monthlyNewsletter: {
      MONTH: data.month || 'Ce mois',
      TOTAL_LISTINGS: data.totalListings || '1,250',
      TOTAL_USERS: data.totalUsers || '5,200',
      TOTAL_TRANSACTIONS: data.totalTransactions || '450',
      TOP_CATEGORIES: JSON.stringify(data.topCategories || {})
    },

    // Offre spéciale
    specialOffer: {
      OFFER_TITLE: data.offer || 'Réduction exclusive',
      DISCOUNT: data.discount || '20%',
      DESCRIPTION: data.description || 'Sur tous les services premium',
      PROMO_CODE: data.code || 'NEWSLETTER20',
      EXPIRY_DATE: data.expiryDate || '31 décembre 2026',
      CTA_URL: `${appUrl}/premium`
    },

    // Réengagement
    reengagementEmail: {
      FIRST_NAME: data.firstName || 'Cher utilisateur',
      DAYS_INACTIVE: data.daysInactive || 'quelques temps',
      NEW_LISTINGS: data.newListings || '500',
      RETURN_URL: `${appUrl}/marketplace`
    },

    // Maintenance
    maintenanceNotification: {
      MAINTENANCE_DATE: data.date || 'Prochainement',
      MAINTENANCE_DURATION: data.duration || '2 heures',
      MAINTENANCE_TIME: data.time || '02:00 - 04:00 UTC'
    },

    // Alerte sécurité
    securityAlert: {
      ALERT_TYPE: data.alertType || 'Activité suspecte détectée',
      ALERT_DESCRIPTION: data.description || 'Une connexion inhabituelle a été détectée',
      ALERT_DATE: data.date || new Date().toLocaleString('fr-FR'),
      ACTION_URL: `${appUrl}/profil/securite`
    },

    // Création de compte
    accountCreated: {
      FIRST_NAME: data.firstName || 'Cher utilisateur',
      EMAIL: data.email,
      VERIFICATION_URL: data.verificationUrl || `${appUrl}/verify-email`,
      PROFILE_URL: `${appUrl}/profil`
    },

    // Réinitialisation mot de passe
    passwordReset: {
      FIRST_NAME: data.firstName || 'Cher utilisateur',
      RESET_URL: data.resetUrl || `${appUrl}/reset-password`,
      EXPIRY_TIME: data.expiryTime || '1 heure'
    },

    // Annonce publiée
    listingPublished: {
      LISTING_TITLE: data.title,
      LISTING_URL: `${appUrl}/annonce/${data.listingId}`,
      LISTING_CATEGORY: data.category,
      LISTING_PRICE: data.price,
      BOOST_URL: `${appUrl}/boost/${data.listingId}`
    },

    // Nouveau message
    newMessage: {
      SENDER_NAME: data.senderName,
      MESSAGE_PREVIEW: data.messagePreview,
      MESSAGE_URL: `${appUrl}/messagerie/${data.conversationId}`,
      LISTING_TITLE: data.listingTitle
    },

    // Paiement reçu
    paymentReceived: {
      AMOUNT: data.amount,
      CURRENCY: data.currency || 'FCFA',
      TRANSACTION_ID: data.transactionId,
      SERVICE: data.service,
      RECEIPT_URL: `${appUrl}/transactions/${data.transactionId}`
    },

    // Boost activé
    boostActivated: {
      LISTING_TITLE: data.title,
      BOOST_DURATION: data.duration || '7 jours',
      BOOST_TYPE: data.boostType || 'Standard',
      LISTING_URL: `${appUrl}/annonce/${data.listingId}`,
      STATS_URL: `${appUrl}/dashboard/annonces/${data.listingId}`
    }
  };

  return {
    ...baseParams,
    ...(specificParams[templateType] || {})
  };
};

/**
 * Obtenir l'ID du template Brevo par type
 */
export const getBrevoTemplateId = (templateType) => {
  const mapping = {
    welcomeNewsletter: BREVO_TEMPLATE_IDS.WELCOME_NEWSLETTER,
    reactivationNewsletter: BREVO_TEMPLATE_IDS.REACTIVATION_NEWSLETTER,
    subscriptionConfirmation: BREVO_TEMPLATE_IDS.SUBSCRIPTION_CONFIRMATION,
    unsubscribeConfirmation: BREVO_TEMPLATE_IDS.UNSUBSCRIBE_CONFIRMATION,
    weeklyNewsletter: BREVO_TEMPLATE_IDS.WEEKLY_NEWSLETTER,
    monthlyNewsletter: BREVO_TEMPLATE_IDS.MONTHLY_NEWSLETTER,
    specialOffer: BREVO_TEMPLATE_IDS.SPECIAL_OFFER,
    reengagementEmail: BREVO_TEMPLATE_IDS.REENGAGEMENT,
    maintenanceNotification: BREVO_TEMPLATE_IDS.MAINTENANCE_NOTIFICATION,
    securityAlert: BREVO_TEMPLATE_IDS.SECURITY_ALERT,
    accountCreated: BREVO_TEMPLATE_IDS.ACCOUNT_CREATED,
    passwordReset: BREVO_TEMPLATE_IDS.PASSWORD_RESET,
    emailVerification: BREVO_TEMPLATE_IDS.EMAIL_VERIFICATION,
    listingPublished: BREVO_TEMPLATE_IDS.LISTING_PUBLISHED,
    listingApproved: BREVO_TEMPLATE_IDS.LISTING_APPROVED,
    listingRejected: BREVO_TEMPLATE_IDS.LISTING_REJECTED,
    listingExpired: BREVO_TEMPLATE_IDS.LISTING_EXPIRED,
    newMessage: BREVO_TEMPLATE_IDS.NEW_MESSAGE,
    messageReply: BREVO_TEMPLATE_IDS.MESSAGE_REPLY,
    paymentReceived: BREVO_TEMPLATE_IDS.PAYMENT_RECEIVED,
    paymentFailed: BREVO_TEMPLATE_IDS.PAYMENT_FAILED,
    boostActivated: BREVO_TEMPLATE_IDS.BOOST_ACTIVATED,
    boostExpiringSoon: BREVO_TEMPLATE_IDS.BOOST_EXPIRING_SOON,
    emailVerification: BREVO_TEMPLATE_IDS.EMAIL_VERIFICATION,
    contentFlagged: BREVO_TEMPLATE_IDS.CONTENT_FLAGGED,
    accountWarning: BREVO_TEMPLATE_IDS.ACCOUNT_WARNING,
    accountSuspended: BREVO_TEMPLATE_IDS.ACCOUNT_SUSPENDED,
    accountReactivated: BREVO_TEMPLATE_IDS.ACCOUNT_REACTIVATED
  };

  return mapping[templateType] || null;
};

/**
 * Vérifier si un template existe
 */
export const templateExists = (templateType) => {
  return getBrevoTemplateId(templateType) !== null;
};

/**
 * Obtenir tous les templates disponibles
 */
export const getAvailableTemplates = () => {
  return Object.keys(BREVO_TEMPLATE_IDS).map(key => ({
    id: BREVO_TEMPLATE_IDS[key],
    name: key,
    type: key.toLowerCase().replace(/_/g, '')
  }));
};

export default {
  BREVO_TEMPLATE_IDS,
  getTemplateParams,
  getBrevoTemplateId,
  templateExists,
  getAvailableTemplates
};
