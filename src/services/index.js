// ============================================================================
// INDEX DES SERVICES - EXPORT CENTRALISÉ
// ============================================================================
// 
// Tous les services de l'application MaxiMarket sont exportés depuis cet index.
// Utilisez cet index pour importer n'importe quel service :
//
// import { authService, listingService, etc. } from '@/services';
//
// ============================================================================

// 🔐 SERVICES CRITIQUES (Phase 4)
export { authService } from './auth.service.js';
export { userService } from './user.service.js';
export { listingService } from './listing.service.js';
export { transactionService } from './transaction.service.js';

// 💬 SERVICES DE COMMUNICATION (Phase 3)
export { notificationService } from './notification.service.js';
export { messageService, addWelcomeMessage } from './message.service.js';
export { commentService } from './comment.service.js';

// 📊 SERVICES DE DONNÉES (Phase 2)
export { categoryService } from './category.service.js';
export { favoriteService } from './favorite.service.js';
export { searchService } from './search.service.js';
export { storageService } from './storage.service.js';
export { reportService } from './report.service.js';

// 🚀 SERVICES PREMIUM ET BOOSTING (Phase 2-3)
export { boostService } from './boost.service.js';

// 💳 SERVICES DE PAIEMENT (Phase 4)
export { paymentService } from './payment.service.js';

// 📊 SERVICES D'ANALYTICS (Phase 5)
export { analyticsService } from './analytics.service.js';

// 🛠️ SERVICES UTILITAIRES
export { cachedListingService } from './cachedListingService.js';
export { preferencesService } from './preferences.service.js';
export { activityService } from './activity.service.js';
export { settingsService } from './settings.service.js';
export { newsletterService } from './newsletter.service.js';
export { emailService } from './email.service.js';
export { emailTemplates, getTemplate, getAvailableTemplates, templateExists } from './email-templates.service.js';
export { campaignService } from './campaign.service.js';

// ============================================================================
// EXPORT PAR DÉFAUT
// ============================================================================

// Export par défaut pour compatibilité avec l'existant
export { default as supabaseService } from './supabase.service.js';

// ============================================================================
// STATISTIQUES DES SERVICES
// ============================================================================

// Total des services disponibles
export const SERVICES_COUNT = 20;

// Liste de tous les services disponibles
export const ALL_SERVICES = {
  // Services critiques
  auth: 'Authentification et gestion des sessions',
  user: 'Gestion des utilisateurs et profils',
  listing: 'Gestion des annonces et marketplace',
  transaction: 'Gestion des transactions financières',
  
  // Services de communication
  notification: 'Système de notifications',
  message: 'Système de messagerie',
  comment: 'Système de commentaires et avis',
  
  // Services de données
  category: 'Gestion des catégories',
  favorite: 'Gestion des favoris',
  search: 'Recherche et filtres',
  storage: 'Gestion des fichiers et images',
  report: 'Système de signalements',
  analytics: 'Statistiques et analyses',
  
  // Services utilitaires
  cachedListing: 'Cache intelligent des annonces',
  preferences: 'Préférences utilisateur',
  activity: 'Suivi des activités utilisateur',
  newsletter: 'Système d\'inscription à la newsletter',
  email: 'Service d\'envoi d\'emails avec SendGrid',
  emailTemplates: 'Templates d\'emails HTML personnalisés',
  campaign: 'Gestion des campagnes email et statistiques'
};
