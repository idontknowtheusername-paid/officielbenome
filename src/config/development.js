// Configuration pour l'environnement de développement
export const devConfig = {
  // Supprimer les avertissements de console en développement
  suppressWarnings: true,
  
  // Configuration HMR optimisée
  hmr: {
    enabled: true,
    overlay: false, // Désactiver l'overlay d'erreur HMR
  },
  
  // Configuration des logs
  logging: {
    level: 'info', // 'error', 'warn', 'info', 'debug'
    showPerformanceMetrics: true,
    showSupabaseQueries: false, // Désactiver les logs Supabase en production
  },
  
  // Configuration des erreurs
  errorHandling: {
    showErrorBoundary: true,
    showRuntimeErrors: false, // Désactiver l'affichage des erreurs runtime
    logErrorsToConsole: true,
  },
  
  // Configuration des performances
  performance: {
    enableProfiling: false,
    enableLazyLoading: true,
    enableImageOptimization: true,
  }
};

// Fonction pour appliquer la configuration
export const applyDevConfig = () => {
  if (import.meta.env.DEV) {
    // Supprimer les avertissements React Router
    if (window.console && window.console.warn) {
      const originalWarn = window.console.warn;
      window.console.warn = (...args) => {
        // Filtrer les avertissements React Router
        if (args[0] && typeof args[0] === 'string') {
          if (args[0].includes('React Router Future Flag Warning')) {
            return; // Ignorer ces avertissements
          }
          if (args[0].includes('WebSocket connection failed')) {
            return; // Ignorer les erreurs WebSocket HMR
          }
          if (args[0].includes('failed to connect to websocket')) {
            return; // Ignorer les erreurs WebSocket HMR
          }
        }
        originalWarn.apply(window.console, args);
      };
    }
    
    // Supprimer les erreurs WebSocket HMR
    if (window.console && window.console.error) {
      const originalError = window.console.error;
      window.console.error = (...args) => {
        // Filtrer les erreurs WebSocket HMR
        if (args[0] && typeof args[0] === 'string') {
          if (args[0].includes('WebSocket connection failed')) {
            return; // Ignorer ces erreurs
          }
          if (args[0].includes('failed to connect to websocket')) {
            return; // Ignorer ces erreurs
          }
          if (args[0].includes('Check out your Vite / network configuration')) {
            return; // Ignorer ces messages
          }
        }
        originalError.apply(window.console, args);
      };
    }
    
    // Optimiser les logs Supabase
    if (window.console && window.console.log) {
      const originalLog = window.console.log;
      window.console.log = (...args) => {
        // Filtrer les logs trop verbeux
        if (args[0] && typeof args[0] === 'string') {
          if (args[0].includes('🔍') && !devConfig.logging.showSupabaseQueries) {
            return; // Ignorer les logs de requêtes Supabase
          }
        }
        originalLog.apply(window.console, args);
      };
    }
    
    // Désactiver les erreurs WebSocket HMR globalement
    window.addEventListener('error', (event) => {
      if (event.message && event.message.includes('WebSocket')) {
        event.preventDefault();
        return false;
      }
    }, true);
    
    // Désactiver les rejets de promesses non gérés liés aux WebSockets
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && event.reason.toString().includes('WebSocket')) {
        event.preventDefault();
        return false;
      }
    });
  }
};

// Appliquer la configuration au chargement
if (typeof window !== 'undefined') {
  applyDevConfig();
} 