/**
 * Constantes de l'application
 * 
 * Ce fichier contient toutes les constantes de l'application,
 * y compris les configurations de sécurité, les messages d'erreur, etc.
 */

// Configuration CORS
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://officielbenome.com',
  'https://www.officielbenome.com',
  'https://staging.officielbenome.com',
];

// Configuration du rate limiting
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_MAX = process.env.RATE_LIMIT_MAX || 100; // Limite de requêtes par fenêtre

// Configuration JWT
export const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || 'votre_secret_jwt_tres_securise',
  EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'votre_refresh_secret_tres_securise',
  REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  ALGORITHM: 'HS256',
  ISSUER: 'officielbenome-api',
  AUDIENCE: 'officielbenome-client',
};

// Rôles des utilisateurs
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator',
  GUEST: 'guest',
};

// Statuts des utilisateurs
export const USER_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
  BANNED: 'banned',
};

// Types de fichiers autorisés pour le téléversement
export const ALLOWED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENT: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ],
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'],
  VIDEO: ['video/mp4', 'video/webm', 'video/ogg'],
};

// Tailles maximales des fichiers (en octets)
export const MAX_FILE_SIZES = {
  IMAGE: 5 * 1024 * 1024, // 5 Mo
  DOCUMENT: 10 * 1024 * 1024, // 10 Mo
  AUDIO: 20 * 1024 * 1024, // 20 Mo
  VIDEO: 50 * 1024 * 1024, // 50 Mo
};

// Codes d'erreur personnalisés
export const ERROR_CODES = {
  // Erreurs d'authentification (1000-1099)
  INVALID_CREDENTIALS: 1001,
  ACCESS_TOKEN_EXPIRED: 1002,
  REFRESH_TOKEN_EXPIRED: 1003,
  INVALID_TOKEN: 1004,
  MISSING_AUTH_HEADER: 1005,
  INVALID_REFRESH_TOKEN: 1006,
  ACCOUNT_LOCKED: 1007,
  EMAIL_NOT_VERIFIED: 1008,
  INVALID_2FA_CODE: 1009,
  
  // Erreurs de validation (1100-1199)
  VALIDATION_ERROR: 1100,
  INVALID_EMAIL: 1101,
  WEAK_PASSWORD: 1102,
  INVALID_PHONE: 1103,
  INVALID_DATE: 1104,
  INVALID_URL: 1105,
  
  // Erreurs de base de données (1200-1299)
  DUPLICATE_ENTRY: 1200,
  RECORD_NOT_FOUND: 1201,
  FOREIGN_KEY_CONSTRAINT: 1202,
  DATABASE_CONNECTION_ERROR: 1203,
  
  // Erreurs d'autorisation (1300-1399)
  PERMISSION_DENIED: 1300,
  INSUFFICIENT_PRIVILEGES: 1301,
  
  // Erreurs de requête (1400-1499)
  INVALID_REQUEST: 1400,
  TOO_MANY_REQUESTS: 1429,
  
  // Erreurs serveur (1500-1599)
  INTERNAL_SERVER_ERROR: 1500,
  SERVICE_UNAVAILABLE: 1503,
  
  // Erreurs de fichiers (1600-1699)
  FILE_TOO_LARGE: 1600,
  INVALID_FILE_TYPE: 1601,
  UPLOAD_FAILED: 1602,
  
  // Erreurs de paiement (1700-1799)
  PAYMENT_FAILED: 1700,
  INVALID_PAYMENT_METHOD: 1701,
  PAYMENT_DECLINED: 1702,
  
  // Erreurs de ressources (1800-1899)
  RESOURCE_NOT_FOUND: 1800,
  RESOURCE_ALREADY_EXISTS: 1801,
};

// Messages d'erreur par défaut
export const ERROR_MESSAGES = {
  [ERROR_CODES.INVALID_CREDENTIALS]: 'Email ou mot de passe incorrect',
  [ERROR_CODES.ACCESS_TOKEN_EXPIRED]: 'La session a expiré, veuillez vous reconnecter',
  [ERROR_CODES.REFRESH_TOKEN_EXPIRED]: 'La session de rafraîchissement a expiré, veuillez vous reconnecter',
  [ERROR_CODES.INVALID_TOKEN]: 'Jeton invalide',
  [ERROR_CODES.MISSING_AUTH_HEADER]: 'En-tête d\'autorisation manquant',
  [ERROR_CODES.VALIDATION_ERROR]: 'Erreur de validation des données',
  [ERROR_CODES.DUPLICATE_ENTRY]: 'Une entrée avec ces valeurs existe déjà',
  [ERROR_CODES.RECORD_NOT_FOUND]: 'Enregistrement non trouvé',
  [ERROR_CODES.PERMISSION_DENIED]: 'Permission refusée',
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: 'Une erreur inattendue est survenue',
  [ERROR_CODES.TOO_MANY_REQUESTS]: 'Trop de requêtes, veuillez réessayer plus tard',
  [ERROR_CODES.FILE_TOO_LARGE]: 'Le fichier est trop volumineux',
  [ERROR_CODES.INVALID_FILE_TYPE]: 'Type de fichier non autorisé',
  [ERROR_CODES.UPLOAD_FAILED]: 'Échec du téléversement du fichier',
  [ERROR_CODES.PAYMENT_FAILED]: 'Le paiement a échoué',
  [ERROR_CODES.RESOURCE_NOT_FOUND]: 'Ressource non trouvée',
  [ERROR_CODES.RESOURCE_ALREADY_EXISTS]: 'La ressource existe déjà',
};

// Configuration des logs
export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  HTTP: 'http',
  DEBUG: 'debug',
  SQL: 'sql',  
};

// Configuration des environnements
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  TEST: 'test',
  PRODUCTION: 'production',
};

// Configuration des services externes
export const EXTERNAL_SERVICES = {
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    API_KEY: process.env.CLOUDINARY_API_KEY,
    API_SECRET: process.env.CLOUDINARY_API_SECRET,
  },
  SENDGRID: {
    API_KEY: process.env.SENDGRID_API_KEY,
    FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL,
    FROM_NAME: process.env.SENDGRID_FROM_NAME || 'Officiel BenoMe',
  },
  STRIPE: {
    SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    CURRENCY: 'eur',
  },
  GOOGLE: {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  },
  FACEBOOK: {
    APP_ID: process.env.FACEBOOK_APP_ID,
    APP_SECRET: process.env.FACEBOOK_APP_SECRET,
  },
};

// Configuration des chemins d'API
export const API_PATHS = {
  AUTH: '/api/auth',
  USERS: '/api/users',
  PROFILE: '/api/profile',
  UPLOADS: '/api/uploads',
  PRODUCTS: '/api/products',
  ORDERS: '/api/orders',
  PAYMENTS: '/api/payments',
  SETTINGS: '/api/settings',
  NOTIFICATIONS: '/api/notifications',
};

// Configuration des événements émis par l'application
export const EVENTS = {
  USER: {
    CREATED: 'user.created',
    UPDATED: 'user.updated',
    DELETED: 'user.deleted',
    PASSWORD_CHANGED: 'user.password_changed',
    EMAIL_VERIFIED: 'user.email_verified',
  },
  AUTH: {
    LOGIN: 'auth.login',
    LOGOUT: 'auth.logout',
    TOKEN_REFRESHED: 'auth.token_refreshed',
  },
  PRODUCT: {
    CREATED: 'product.created',
    UPDATED: 'product.updated',
    DELETED: 'product.deleted',
  },
  ORDER: {
    CREATED: 'order.created',
    UPDATED: 'order.updated',
    CANCELLED: 'order.cancelled',
    COMPLETED: 'order.completed',
  },
  PAYMENT: {
    SUCCEEDED: 'payment.succeeded',
    FAILED: 'payment.failed',
    REFUNDED: 'payment.refunded',
  },
};

// Configuration des notifications
export const NOTIFICATION_TYPES = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  IN_APP: 'in_app',
};

// Configuration des modèles de base de données
export const MODEL_NAMES = {
  USER: 'User',
  ROLE: 'Role',
  PERMISSION: 'Permission',
  PRODUCT: 'Product',
  CATEGORY: 'Category',
  ORDER: 'Order',
  ORDER_ITEM: 'OrderItem',
  PAYMENT: 'Payment',
  ADDRESS: 'Address',
  REVIEW: 'Review',
  NOTIFICATION: 'Notification',
  SETTING: 'Setting',
  FILE: 'File',
};

// Configuration des relations entre modèles
export const MODEL_RELATIONS = {
  [MODEL_NAMES.USER]: [
    { model: 'Role', as: 'roles' },
    { model: 'Address', as: 'addresses' },
    { model: 'Order', as: 'orders' },
    { model: 'Review', as: 'reviews' },
    { model: 'Notification', as: 'notifications' },
  ],
  [MODEL_NAMES.ROLE]: [
    { model: 'User', as: 'users' },
    { model: 'Permission', as: 'permissions' },
  ],
  [MODEL_NAMES.PRODUCT]: [
    { model: 'Category', as: 'categories' },
    { model: 'Review', as: 'reviews' },
    { model: 'OrderItem', as: 'orderItems' },
  ],
  [MODEL_NAMES.ORDER]: [
    { model: 'User', as: 'user' },
    { model: 'OrderItem', as: 'items' },
    { model: 'Payment', as: 'payments' },
    { model: 'Address', as: 'shippingAddress' },
    { model: 'Address', as: 'billingAddress' },
  ],
};

// Configuration des rôles et permissions
export const ROLES_AND_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    'users:read',
    'users:create',
    'users:update',
    'users:delete',
    'products:read',
    'products:create',
    'products:update',
    'products:delete',
    'orders:read',
    'orders:update',
    'orders:delete',
    'settings:read',
    'settings:update',
  ],
  [USER_ROLES.MODERATOR]: [
    'products:read',
    'products:update',
    'orders:read',
    'orders:update',
  ],
  [USER_ROLES.USER]: [
    'profile:read',
    'profile:update',
    'products:read',
    'orders:read',
    'orders:create',
  ],
  [USER_ROLES.GUEST]: [
    'products:read',
  ],
};

// Configuration des paramètres par défaut
export const DEFAULT_SETTINGS = {
  SITE_NAME: 'Officiel BenoMe',
  SITE_URL: 'https://officielbenome.com',
  CONTACT_EMAIL: 'contact@officielbenome.com',
  SUPPORT_EMAIL: 'support@officielbenome.com',
  ITEMS_PER_PAGE: 10,
  ENABLE_REGISTRATION: true,
  MAINTENANCE_MODE: false,
  CURRENCY: 'EUR',
  TAX_RATE: 20, // Taux de TVA en pourcentage
  SHIPPING_COSTS: 4.99, // Frais de livraison par défaut
  FREE_SHIPPING_THRESHOLD: 50, // Montant minimum pour la livraison gratuite
};

// Configuration des clés de cache
export const CACHE_KEYS = {
  SETTINGS: 'app:settings',
  PRODUCT_CATEGORIES: 'products:categories',
  FEATURED_PRODUCTS: 'products:featured',
  POPULAR_PRODUCTS: 'products:popular',
  USER_COUNT: 'stats:user_count',
  ORDER_COUNT: 'stats:order_count',
  REVENUE: 'stats:revenue',
};

// Configuration des durées de cache (en secondes)
export const CACHE_TTL = {
  SHORT: 60 * 5, // 5 minutes
  MEDIUM: 60 * 30, // 30 minutes
  LONG: 60 * 60 * 12, // 12 heures
  DAY: 60 * 60 * 24, // 24 heures
  WEEK: 60 * 60 * 24 * 7, // 1 semaine
  MONTH: 60 * 60 * 24 * 30, // 1 mois
};

// Configuration des tâches planifiées
export const SCHEDULED_TASKS = {
  CLEANUP_OLD_SESSIONS: '0 0 * * *', // Tous les jours à minuit
  BACKUP_DATABASE: '0 3 * * 0', // Tous les dimanches à 3h du matin
  GENERATE_REPORTS: '0 9 * * 1', // Tous les lundis à 9h du matin
  SEND_NEWSLETTER: '0 10 * * 1', // Tous les lundis à 10h du matin
};

// Configuration des webhooks
export const WEBHOOK_EVENTS = {
  USER_SIGNUP: 'user.signup',
  USER_LOGIN: 'user.login',
  ORDER_CREATED: 'order.created',
  ORDER_UPDATED: 'order.updated',
  PAYMENT_SUCCEEDED: 'payment.succeeded',
  PAYMENT_FAILED: 'payment.failed',
};

// Configuration des fournisseurs d'authentification tiers
export const AUTH_PROVIDERS = {
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
  TWITTER: 'twitter',
  GITHUB: 'github',
  LINKEDIN: 'linkedin',
};

// Configuration des méthodes de paiement
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  PAYPAL: 'paypal',
  STRIPE: 'stripe',
  BANK_TRANSFER: 'bank_transfer',
  CRYPTO: 'crypto',
};

// Configuration des statuts de commande
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  FAILED: 'failed',
};

// Configuration des types de produits
export const PRODUCT_TYPES = {
  PHYSICAL: 'physical',
  DIGITAL: 'digital',
  SERVICE: 'service',
  SUBSCRIPTION: 'subscription',
};

// Configuration des options de tri
export const SORT_OPTIONS = {
  PRICE_ASC: { field: 'price', order: 'ASC' },
  PRICE_DESC: { field: 'price', order: 'DESC' },
  NAME_ASC: { field: 'name', order: 'ASC' },
  NAME_DESC: { field: 'name', order: 'DESC' },
  CREATED_AT_ASC: { field: 'createdAt', order: 'ASC' },
  CREATED_AT_DESC: { field: 'createdAt', order: 'DESC' },
  UPDATED_AT_ASC: { field: 'updatedAt', order: 'ASC' },
  UPDATED_AT_DESC: { field: 'updatedAt', order: 'DESC' },
  POPULARITY: { field: 'popularity', order: 'DESC' },
  RATING: { field: 'rating', order: 'DESC' },
};

// Configuration des options de filtrage
export const FILTER_OPTIONS = {
  AVAILABILITY: {
    IN_STOCK: 'in_stock',
    OUT_OF_STOCK: 'out_of_stock',
    PRE_ORDER: 'pre_order',
  },
  PRICE_RANGE: {
    UNDER_25: 'under_25',
    '25_TO_50': '25_to_50',
    '50_TO_100': '50_to_100',
    '100_TO_200': '100_to_200',
    ABOVE_200: 'above_200',
  },
  RATING: {
    '4_AND_ABOVE': '4_and_above',
    '3_AND_ABOVE': '3_and_above',
    '2_AND_ABOVE': '2_and_above',
    '1_AND_ABOVE': '1_and_above',
  },
};

// Configuration des options de pagination
export const PAGINATION_OPTIONS = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  DEFAULT_PAGE: 1,
};

// Configuration des options de recherche
export const SEARCH_OPTIONS = {
  MIN_QUERY_LENGTH: 2,
  MAX_QUERY_LENGTH: 100,
  FIELDS: ['name', 'description', 'sku', 'tags'],
};

// Configuration des options de validation
export const VALIDATION_OPTIONS = {
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL_CHAR: true,
  },
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    ALLOWED_CHARS: /^[a-zA-Z0-9_.-]+$/,
  },
  EMAIL: {
    MAX_LENGTH: 255,
  },
};

// Configuration des options de téléchargement
export const UPLOAD_OPTIONS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 Mo
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  MAX_FILES: 5,
  UPLOAD_DIR: 'uploads',
};

export {
  ALLOWED_ORIGINS,
};
