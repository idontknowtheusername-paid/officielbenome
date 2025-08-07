/**
 * Configuration de l'application
 * Contient les constantes et paramètres globaux de l'application
 */

// Configuration Supabase
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const APP_NAME = 'MaxiMarket';
export const APP_DESCRIPTION = 'Plateforme de mise en relation entre particuliers';

// Paramètres de pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PER_PAGE: 10,
  PER_PAGE_OPTIONS: [5, 10, 25, 50, 100],
};

// Paramètres de tri par défaut
export const SORT_OPTIONS = {
  CREATED_AT_DESC: { field: 'createdAt', order: 'desc' },
  CREATED_AT_ASC: { field: 'createdAt', order: 'asc' },
  UPDATED_AT_DESC: { field: 'updatedAt', order: 'desc' },
  UPDATED_AT_ASC: { field: 'updatedAt', order: 'asc' },
  NAME_ASC: { field: 'name', order: 'asc' },
  NAME_DESC: { field: 'name', order: 'desc' },
  PRICE_ASC: { field: 'price', order: 'asc' },
  PRICE_DESC: { field: 'price', order: 'desc' },
};

// Paramètres de cache
export const CACHE = {
  // Durée de mise en cache par défaut (en millisecondes)
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
  // Préfixe pour les clés de cache
  PREFIX: 'maximarket_cache_',
};

// Paramètres de l'éditeur de texte riche
export const RICH_TEXT_EDITOR = {
  // Configuration de base pour l'éditeur
  SIMPLE: {
    height: 200,
    menubar: false,
    plugins: [
      'advlist autolink lists link image charmap print preview anchor',
      'searchreplace visualblocks code fullscreen',
      'insertdatetime media table paste code help wordcount'
    ],
    toolbar: 'undo redo | formatselect | bold italic backcolor | \
      alignleft aligncenter alignright alignjustify | \
      bullist numlist outdent indent | removeformat | help'
  },
  // Configuration complète pour l'éditeur
  FULL: {
    height: 500,
    menubar: true,
    plugins: [
      'advlist autolink lists link image charmap print preview anchor',
      'searchreplace visualblocks code fullscreen',
      'insertdatetime media table paste code help wordcount'
    ],
    toolbar: 'undo redo | formatselect | bold italic backcolor | \
      alignleft aligncenter alignright alignjustify | \
      bullist numlist outdent indent | link image media | \
      removeformat | help'
  }
};

// Paramètres de téléchargement de fichiers
export const UPLOAD = {
  // Taille maximale des fichiers (en octets)
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  // Types de fichiers acceptés
  ACCEPTED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'application/zip'
  ],
  // Dossiers par type de fichier
  FOLDERS: {
    IMAGES: 'images',
    DOCUMENTS: 'documents',
    OTHERS: 'others'
  }
};

// Paramètres de notification
export const NOTIFICATION = {
  // Durée d'affichage des notifications (en millisecondes)
  DURATION: 5000,
  // Position des notifications
  POSITION: 'top-right',
  // Types de notifications
  TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
    DEFAULT: 'default'
  }
};

// Paramètres de l'application
export const APP_SETTINGS = {
  // Paramètres de thème
  THEME: {
    DEFAULT: 'light',
    DARK: 'dark',
    LIGHT: 'light',
    SYSTEM: 'system'
  },
  // Paramètres de langue
  LOCALE: {
    DEFAULT: 'fr-FR',
    SUPPORTED: ['fr-FR', 'en-US']
  },
  // Paramètres de devise
  CURRENCY: {
    DEFAULT: 'XOF',
    SYMBOL: 'FCFA',
    DECIMALS: 0,
    LOCALE: 'fr-FR'
  },
  // Paramètres de date et heure
  DATETIME: {
    DATE_FORMAT: 'dd/MM/yyyy',
    TIME_FORMAT: 'HH:mm',
    DATETIME_FORMAT: 'dd/MM/yyyy HH:mm',
    LOCALE: 'fr-FR'
  }
};

// Configuration des fonctionnalités
export const FEATURES = {
  ENABLE_ANALYTICS: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_MESSAGING: true,
  ENABLE_REVIEWS: true,
  ENABLE_REPORTS: true,
  ENABLE_VERIFICATION: true,
  ENABLE_SUBSCRIPTIONS: false,
};

// Configuration des modules
export const MODULES = {
  BLOG: {
    ENABLED: true,
    COMMENTS: true,
    LIKES: true,
    SHARING: true
  },
  MARKETPLACE: {
    ENABLED: true,
    CATEGORIES: true,
    FILTERS: true,
    MAP: true,
    RATINGS: true,
    WISHLIST: true,
    COMPARISON: false
  },
  USER: {
    PROFILE: true,
    VERIFICATION: true,
    SOCIAL_LOGIN: true,
    TWO_FACTOR_AUTH: false
  },
  PAYMENT: {
    ENABLED: true,
    GATEWAYS: ['bank_transfer', 'mobile_money', 'credit_card'],
    CURRENCIES: ['XOF', 'EUR', 'USD'],
    TAX_RATE: 0,
    COMMISSION_RATE: 0.1 // 10% de commission par défaut
  }
};

// Configuration des API externes
export const EXTERNAL_APIS = {
  GOOGLE_MAPS: {
    API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    ENABLED: true
  },
  RECAPTCHA: {
    SITE_KEY: import.meta.env.VITE_RECAPTCHA_SITE_KEY || '',
    ENABLED: false
  },
  GOOGLE_ANALYTICS: {
    TRACKING_ID: import.meta.env.VITE_GA_TRACKING_ID || '',
    ENABLED: false
  },
  FACEBOOK_PIXEL: {
    ID: import.meta.env.VITE_FB_PIXEL_ID || '',
    ENABLED: false
  }
};

// Configuration des métadonnées par défaut
export const DEFAULT_METADATA = {
  TITLE: 'MaxiMarket - Plateforme de mise en relation entre particuliers',
  DESCRIPTION: 'Trouvez les meilleures offres de biens et services entre particuliers sur MaxiMarket.',
  KEYWORDS: 'annonces, particuliers, vente, achat, location, services, occasion, neuf, benin, afrique',
  AUTHOR: 'MaxiMarket',
  OG_IMAGE: '/images/og-image.jpg',
  TWITTER_HANDLE: '@maximarket_app',
  FAVICON: '/favicon.ico'
};

// Chemins d'API
export const SUPABASE_CONFIG = {
  // Authentification
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    ME: '/auth/me'
  },
  
  // Utilisateurs
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    AVATAR: '/users/avatar',
    PASSWORD: '/users/password',
    VERIFICATION: '/users/verification',
    NOTIFICATIONS: '/users/notifications',
    NOTIFICATION_PREFERENCES: '/users/notification-preferences',
    SESSIONS: '/users/sessions'
  },
  
  // Annonces
  LISTINGS: {
    BASE: '/listings',
    SEARCH: '/listings/search',
    CATEGORIES: '/listings/categories',
    FAVORITES: '/listings/favorites',
    REPORT: '/listings/report',
    VIEWS: '/listings/views',
    SAVE: '/listings/save',
    UNSAVE: '/listings/unsave',
    COMPARE: '/listings/compare'
  },
  
  // Transactions
  TRANSACTIONS: {
    BASE: '/transactions',
    PAYMENT_METHODS: '/transactions/payment-methods',
    INVOICE: '/transactions/invoice',
    REFUND: '/transactions/refund',
    DISPUTE: '/transactions/dispute'
  },
  
  // Messages
  MESSAGES: {
    BASE: '/messages',
    CONVERSATIONS: '/messages/conversations',
    UNREAD: '/messages/unread',
    READ: '/messages/read',
    DELETE: '/messages/delete'
  },
  
  // Avis
  REVIEWS: {
    BASE: '/reviews',
    USER: '/reviews/user',
    LISTING: '/reviews/listing',
    REPLY: '/reviews/reply'
  },
  
  // Signalements
  REPORTS: {
    BASE: '/reports',
    TYPES: '/reports/types',
    RESOLVE: '/reports/resolve'
  },
  
  // Favoris
  FAVORITES: {
    BASE: '/favorites',
    CHECK: '/favorites/check',
    TOGGLE: '/favorites/toggle'
  },
  
  // Recherche
  SEARCH: {
    BASE: '/search',
    SUGGESTIONS: '/search/suggestions',
    HISTORY: '/search/history',
    POPULAR: '/search/popular'
  },
  
  // Téléchargements
  UPLOAD: {
    BASE: '/upload',
    IMAGE: '/upload/image',
    DOCUMENT: '/upload/document',
    DELETE: '/upload/delete'
  },
  
  // Paramètres
  SETTINGS: {
    BASE: '/settings',
    EMAIL: '/settings/email',
    PASSWORD: '/settings/password',
    NOTIFICATIONS: '/settings/notifications',
    PRIVACY: '/settings/privacy',
    PREFERENCES: '/settings/preferences',
    SOCIAL: '/settings/social',
    VERIFICATION: '/settings/verification'
  },
  
  // Admin
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    LISTINGS: '/admin/listings',
    TRANSACTIONS: '/admin/transactions',
    REVIEWS: '/admin/reviews',
    REPORTS: '/admin/reports',
    ANALYTICS: '/admin/analytics',
    SETTINGS: '/admin/settings',
    BACKUP: '/admin/backup',
    LOGS: '/admin/logs',
    SYSTEM: '/admin/system',
    EMAIL_TEST: '/admin/email-test',
    CACHE_CLEAR: '/admin/cache/clear'
  },
  
  // Blog
  BLOG: {
    BASE: '/blog',
    CATEGORIES: '/blog/categories',
    TAGS: '/blog/tags',
    COMMENTS: '/blog/comments',
    LIKES: '/blog/likes',
    SHARES: '/blog/shares'
  },
  
  // Pages statiques
  PAGES: {
    BASE: '/pages',
    HOME: '/pages/home',
    ABOUT: '/pages/about',
    CONTACT: '/pages/contact',
    TERMS: '/pages/terms',
    PRIVACY: '/pages/privacy',
    FAQ: '/pages/faq',
    HELP: '/pages/help',
    PRICING: '/pages/pricing',
    FEATURES: '/pages/features'
  }
};

// Configuration des routes de l'application
export const ROUTES = {
  // Pages publiques
  HOME: '/',
  ABOUT: '/a-propos',
  CONTACT: '/contactez-nous',
  PRICING: '/tarifs',
  FEATURES: '/fonctionnalites',
  FAQ: '/faq',
  HELP: '/aide',
  BLOG: '/blog',
  BLOG_POST: '/blog/:slug',
  TERMS: '/conditions-generales',
  PRIVACY: '/confidentialite',
  
  // Authentification
  LOGIN: '/connexion',
  REGISTER: '/inscription',
  FORGOT_PASSWORD: '/mot-de-passe-oublie',
  RESET_PASSWORD: '/reinitialiser-mot-de-passe',
  VERIFY_EMAIL: '/verifier-email',
  
  // Tableau de bord
  DASHBOARD: '/tableau-de-bord',
  PROFILE: '/profil',
  SETTINGS: '/parametres',
  NOTIFICATIONS: '/notifications',
  MESSAGES: '/messages',
  
  // Annonces
  LISTINGS: '/annonces',
  LISTING_NEW: '/annonces/nouvelle',
  LISTING_EDIT: '/annonces/:id/modifier',
  LISTING_VIEW: '/annonces/:slug',
  LISTING_CATEGORY: '/annonces/categorie/:category',
  
  // Paiement
  CHECKOUT: '/paiement',
  PAYMENT_SUCCESS: '/paiement/succes',
  PAYMENT_CANCEL: '/paiement/annule',
  
  // Admin
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/utilisateurs',
  ADMIN_LISTINGS: '/admin/annonces',
  ADMIN_TRANSACTIONS: '/admin/transactions',
  ADMIN_REVIEWS: '/admin/avis',
  ADMIN_REPORTS: '/admin/signalements',
  ADMIN_ANALYTICS: '/admin/analytiques',
  ADMIN_SETTINGS: '/admin/parametres',
  
  // Erreurs
  NOT_FOUND: '/404',
  ERROR: '/erreur',
  MAINTENANCE: '/maintenance',
  COMING_SOON: '/bientot-disponible'
};

// Configuration des métadonnées des routes
export const ROUTE_METADATA = {
  [ROUTES.HOME]: {
    title: 'Accueil',
    description: 'Trouvez les meilleures offres de biens et services entre particuliers sur MaxiMarket.'
  },
  [ROUTES.ABOUT]: {
    title: 'À propos',
    description: 'Découvrez MaxiMarket, la plateforme de mise en relation entre particuliers.'
  },
  [ROUTES.CONTACT]: {
    title: 'Contactez-nous',
    description: 'Contactez notre équipe pour toute question ou demande de renseignements.'
  },
  [ROUTES.LOGIN]: {
    title: 'Connexion',
    description: 'Connectez-vous à votre compte MaxiMarket pour accéder à votre tableau de bord.'
  },
  [ROUTES.REGISTER]: {
    title: 'Inscription',
    description: 'Créez votre compte MaxiMarket pour commencer à publier des annonces.'
  },
  [ROUTES.DASHBOARD]: {
    title: 'Tableau de bord',
    description: 'Gérez vos annonces, messages et paramètres de compte.'
  },
  [ROUTES.ADMIN]: {
    title: 'Administration',
    description: 'Panneau d\'administration de la plateforme MaxiMarket.'
  }
};

export default {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  APP_NAME,
  APP_DESCRIPTION,
  PAGINATION,
  SORT_OPTIONS,
  CACHE,
  RICH_TEXT_EDITOR,
  UPLOAD,
  NOTIFICATION,
  APP_SETTINGS,
  FEATURES,
  MODULES,
  EXTERNAL_APIS,
  DEFAULT_METADATA,
  SUPABASE_CONFIG,
  ROUTES,
  ROUTE_METADATA
};
