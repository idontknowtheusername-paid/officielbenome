// ============================================================================
// POINT D'ENTRÉE PRINCIPAL DES SERVICES
// ============================================================================
// 
// Ce fichier sert de point d'entrée principal pour tous les services
// de l'application MaxiMarket. Tous les services ont été refactorisés
// et organisés dans des fichiers séparés pour une meilleure maintenabilité.
//
// IMPORTANT : Utilisez l'index des services pour importer les services :
// import { authService, listingService, etc. } from '@/services';
//
// ============================================================================

import { supabase } from '@/lib/supabase';

// ============================================================================
// SERVICES DISPONIBLES
// ============================================================================

// ✅ Services critiques (Phase 4)
// - authService : src/services/auth.service.js
// - userService : src/services/user.service.js  
// - listingService : src/services/listing.service.js
// - transactionService : src/services/transaction.service.js

// ✅ Services de communication (Phase 3)
// - notificationService : src/services/notification.service.js
// - messageService : src/services/message.service.js

// ✅ Services de données (Phase 2)
// - categoryService : src/services/category.service.js
// - favoriteService : src/services/favorite.service.js
// - searchService : src/services/search.service.js
// - storageService : src/services/storage.service.js
// - reportService : src/services/report.service.js
// - analyticsService : src/services/analytics.service.js

// ✅ Services utilitaires
// - cachedListingService : src/services/cachedListingService.js
// - preferencesService : src/services/preferences.service.js
// - activityService : src/services/activity.service.js

// ============================================================================
// EXPORT PAR DÉFAUT
// ============================================================================

// Export par défaut pour compatibilité avec l'existant
// RECOMMANDATION : Utilisez l'index des services à la place
export default {
  // Point d'entrée vers l'index des services
  services: 'Utilisez l\'index : import { serviceName } from "@/services"',
  
  // Accès direct à Supabase (si nécessaire)
  supabase,
  
  // Informations sur la structure
  info: {
    totalServices: 15,
    architecture: 'Modulaire avec index centralisé',
    recommendation: 'Utilisez l\'index des services pour les imports',
    documentation: 'Voir src/services/index.js pour tous les exports'
  }
};