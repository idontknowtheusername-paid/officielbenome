// ============================================================================
// CONFIGURATION DE LA MESSAGERIE
// ============================================================================

export const MESSAGING_CONFIG = {
  // Configuration générale
  GENERAL: {
    ENABLE_DEBUG: process.env.NODE_ENV === 'development',
    MAX_MESSAGE_LENGTH: 1000,
    MAX_ATTACHMENT_SIZE: 10 * 1024 * 1024, // 10MB
    MESSAGE_RETENTION_DAYS: 365,
    AUTO_ARCHIVE_DAYS: 30,
  },

  // Configuration des composants
  COMPONENTS: {
    MESSAGE_INPUT: {
      ENABLE_EMOJI: true,
      ENABLE_ATTACHMENTS: true,
      ENABLE_CAMERA: true,
      ENABLE_VOICE: true,
      ENABLE_LOCATION: true,
      ENABLE_APPOINTMENTS: true,
      ENABLE_AUDIO_CALLS: true,
    },
    
    CAMERA_CAPTURE: {
      QUALITY: 0.8,
      MAX_WIDTH: 1920,
      MAX_HEIGHT: 1080,
      ENABLE_FRONT_CAMERA: true,
      ENABLE_BACK_CAMERA: true,
    },
    
    FILE_UPLOAD: {
      MAX_FILES: 10,
      ACCEPTED_TYPES: [
        'image/*',
        'video/*',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/zip'
      ],
    },
  },

  // Configuration des erreurs et fallbacks
  ERROR_HANDLING: {
    // Gestion des utilisateurs non trouvés
    USER_FALLBACK: {
      FIRST_NAME: 'Utilisateur',
      LAST_NAME: 'Inconnu',
      AVATAR_URL: null,
    },
    
    // Gestion des conversations
    CONVERSATION_FALLBACK: {
      ENABLE_WELCOME_MESSAGE: true,
      WELCOME_MESSAGE_SENDER_ID: '00000000-0000-0000-0000-000000000000',
      DEFAULT_CONVERSATION_TITLE: 'Nouvelle conversation',
    },
    
    // Gestion des erreurs API
    API_ERRORS: {
      MAX_RETRIES: 3,
      RETRY_DELAY: 1000,
      TIMEOUT: 10000,
      ENABLE_FALLBACK_DATA: true,
    },
  },

  // Configuration des notifications
  NOTIFICATIONS: {
    ENABLE_PUSH: true,
    ENABLE_SOUND: true,
    ENABLE_VIBRATION: true,
    SHOW_PREVIEW: true,
    GROUP_BY_CONVERSATION: true,
  },

  // Configuration de la sécurité
  SECURITY: {
    ENABLE_ENCRYPTION: false, // À implémenter plus tard
    ENABLE_END_TO_END: false, // À implémenter plus tard
    ENABLE_MESSAGE_VERIFICATION: true,
    BLOCKED_WORDS: [], // Mots interdits
    MAX_MESSAGES_PER_MINUTE: 10,
  },

  // Configuration des performances
  PERFORMANCE: {
    MESSAGE_BATCH_SIZE: 50,
    CONVERSATION_CACHE_SIZE: 100,
    ENABLE_LAZY_LOADING: true,
    ENABLE_VIRTUAL_SCROLLING: false, // À implémenter plus tard
    DEBOUNCE_DELAY: 300,
  },

  // Configuration du débogage
  DEBUG: {
    LOG_LEVEL: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
    ENABLE_PERFORMANCE_MONITORING: process.env.NODE_ENV === 'development',
    ENABLE_ERROR_TRACKING: true,
    ENABLE_API_LOGGING: process.env.NODE_ENV === 'development',
    ENABLE_COMPONENT_LOGGING: process.env.NODE_ENV === 'development',
  },
};

// Configuration des messages d'erreur
export const MESSAGING_ERROR_MESSAGES = {
  USER_NOT_FOUND: 'Utilisateur non trouvé',
  CONVERSATION_NOT_FOUND: 'Conversation non trouvée',
  MESSAGE_NOT_SENT: 'Message non envoyé',
  PERMISSION_DENIED: 'Permission refusée',
  NETWORK_ERROR: 'Erreur de réseau',
  DATABASE_ERROR: 'Erreur de base de données',
  VALIDATION_ERROR: 'Erreur de validation',
  UNKNOWN_ERROR: 'Erreur inconnue',
};

// Configuration des types de messages
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  FILE: 'file',
  LOCATION: 'location',
  APPOINTMENT: 'appointment',
  SYSTEM: 'system',
  NOTIFICATION: 'notification',
};

// Configuration des statuts de message
export const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed',
  PENDING: 'pending',
};

// Configuration des types de conversation
export const CONVERSATION_TYPES = {
  DIRECT: 'direct',
  GROUP: 'group',
  LISTING: 'listing',
  SUPPORT: 'support',
  SYSTEM: 'system',
};

// Configuration des permissions
export const MESSAGING_PERMISSIONS = {
  SEND_MESSAGE: 'send_message',
  READ_MESSAGE: 'read_message',
  DELETE_MESSAGE: 'delete_message',
  CREATE_CONVERSATION: 'create_conversation',
  JOIN_CONVERSATION: 'join_conversation',
  LEAVE_CONVERSATION: 'leave_conversation',
  MANAGE_CONVERSATION: 'manage_conversation',
};

// Configuration des limites
export const MESSAGING_LIMITS = {
  MAX_CONVERSATIONS_PER_USER: 100,
  MAX_MESSAGES_PER_CONVERSATION: 10000,
  MAX_PARTICIPANTS_PER_GROUP: 50,
  MAX_ATTACHMENTS_PER_MESSAGE: 10,
  MAX_MESSAGE_HISTORY_DAYS: 365,
};

// Configuration des timeouts
export const MESSAGING_TIMEOUTS = {
  MESSAGE_SEND: 10000,
  CONVERSATION_LOAD: 15000,
  USER_SEARCH: 5000,
  FILE_UPLOAD: 30000,
  CAMERA_INIT: 10000,
  VOICE_RECORDING: 60000,
};

// Configuration des retry
export const MESSAGING_RETRY = {
  MESSAGE_SEND: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000,
    BACKOFF_MULTIPLIER: 2,
  },
  CONVERSATION_LOAD: {
    MAX_ATTEMPTS: 2,
    DELAY: 2000,
    BACKOFF_MULTIPLIER: 1.5,
  },
  FILE_UPLOAD: {
    MAX_ATTEMPTS: 2,
    DELAY: 5000,
    BACKOFF_MULTIPLIER: 1,
  },
};

// Configuration des fallbacks
export const MESSAGING_FALLBACKS = {
  // Données par défaut pour les utilisateurs
  DEFAULT_USER: {
    id: 'unknown-user',
    first_name: 'Utilisateur',
    last_name: 'Inconnu',
    avatar_url: null,
    email: 'unknown@example.com',
  },
  
  // Données par défaut pour les conversations
  DEFAULT_CONVERSATION: {
    id: 'default-conversation',
    title: 'Nouvelle conversation',
    type: 'direct',
    participants: [],
    last_message_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  
  // Données par défaut pour les messages
  DEFAULT_MESSAGE: {
    id: 'default-message',
    content: 'Message par défaut',
    type: 'text',
    sender_id: 'system',
    created_at: new Date().toISOString(),
    is_read: false,
  },
};

// Configuration des tests
export const MESSAGING_TESTS = {
  ENABLE_COMPONENT_TESTS: process.env.NODE_ENV === 'development',
  ENABLE_INTEGRATION_TESTS: process.env.NODE_ENV === 'development',
  ENABLE_PERFORMANCE_TESTS: process.env.NODE_ENV === 'development',
  ENABLE_ACCESSIBILITY_TESTS: true,
  ENABLE_RESPONSIVE_TESTS: true,
};

export default MESSAGING_CONFIG;
