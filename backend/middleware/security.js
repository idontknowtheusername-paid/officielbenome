import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { xss } from 'express-xss-sanitizer';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import { ALLOWED_ORIGINS, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX } from '../config/constants.js';

/**
 * Configuration CORS personnalisée
 */
const corsOptions = {
  origin: (origin, callback) => {
    console.log('CORS check - Origin:', origin);
    console.log('CORS check - ALLOWED_ORIGINS:', ALLOWED_ORIGINS);
    console.log('CORS check - NODE_ENV:', process.env.NODE_ENV);
    
    // Autoriser les requêtes sans origine (comme les applications mobiles ou Postman)
    if (!origin) {
      console.log('CORS: Allowing request without origin');
      return callback(null, true);
    }
    
    // Vérifier si l'origine est autorisée
    if (ALLOWED_ORIGINS.includes(origin) || process.env.NODE_ENV === 'development') {
      console.log('CORS: Allowing origin:', origin);
      return callback(null, true);
    }
    
    console.log('CORS: Rejecting origin:', origin);
    console.log('CORS: Allowed origins:', ALLOWED_ORIGINS);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-Access-Token',
    'X-Refresh-Token',
  ],
  credentials: true,
  maxAge: 86400, // 24 heures
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

/**
 * Configuration du rate limiting
 */
const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes par défaut
  max: RATE_LIMIT_MAX || 100, // Limite de requêtes par fenêtre
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Trop de requêtes effectuées depuis cette adresse IP. Veuillez réessayer plus tard.',
    },
  },
  standardHeaders: true, // Retourne les en-têtes de limite de taux
  legacyHeaders: false, // Désactive les en-têtes `X-RateLimit-*`
});

/**
 * Configuration de la politique de sécurité de contenu (CSP)
 */
const contentSecurityPolicy = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      'https://cdn.jsdelivr.net',
      'https://cdnjs.cloudflare.com',
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      'https://fonts.googleapis.com',
      'https://cdn.jsdelivr.net',
      'https://cdnjs.cloudflare.com',
    ],
    fontSrc: [
      "'self'",
      'data:',
      'https://fonts.gstatic.com',
      'https://cdn.jsdelivr.net',
      'https://cdnjs.cloudflare.com',
    ],
    imgSrc: [
      "'self'",
      'data:',
      'blob:',
      'https://*.tile.openstreetmap.org',
      'https://*.google-analytics.com',
      'https://*.g.doubleclick.net',
      'https://*.google.com',
      'https://*.google.fr',
    ],
    connectSrc: [
      "'self'",
      'https://*.google-analytics.com',
      'https://*.analytics.google.com',
      'https://*.g.doubleclick.net',
      'ws://localhost:*/',
      'wss://*.sentry.io',
    ],
    frameSrc: [
      "'self'",
      'https://www.google.com',
      'https://www.youtube.com',
      'https://player.vimeo.com',
    ],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: [],
  },
  reportOnly: process.env.NODE_ENV === 'development', // En mode développement, ne bloque pas, ne fait que rapporter
};

/**
 * Applique les mesures de sécurité à l'application Express
 * @param {import('express').Application} app - L'application Express
 */
export const applySecurity = (app) => {
  // 1. Configuration de base de sécurité avec Helmet
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production' ? contentSecurityPolicy : false,
      crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production',
      crossOriginOpenerPolicy: process.env.NODE_ENV === 'production',
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      dnsPrefetchControl: { allow: true },
      frameguard: { action: 'deny' },
      hidePoweredBy: true,
      hsts: {
        maxAge: 31536000, // 1 an
        includeSubDomains: true,
        preload: true,
      },
      ieNoOpen: true,
      noSniff: true,
      originAgentCluster: true,
      referrerPolicy: { policy: 'same-origin' },
      xssFilter: true,
    })
  );

  // 2. Configuration CORS
  app.use(cors(corsOptions));

  // 3. Protection contre les attaques par déni de service (DoS)
  app.use(limiter);

  // 4. Protection contre la pollution des paramètres HTTP (HPP)
  app.use(hpp());

  // 5. Protection contre les injections NoSQL
  app.use(mongoSanitize());

  // 6. Protection contre les attaques XSS
  app.use(xss());

  // 7. Désactiver l'en-tête X-Powered-By (au cas où Helmet échouerait)
  app.disable('x-powered-by');

  // 8. Sécurité des en-têtes HTTP
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), payment=()'
    );
    next();
  });

  // 9. Protection contre le détournement de clics (Clickjacking)
  app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    next();
  });

  // 10. Journalisation des en-têtes de sécurité (uniquement en développement)
  if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
      console.log('En-têtes de sécurité:');
      console.log('User-Agent:', req.headers['user-agent']);
      console.log('Origin:', req.headers.origin);
      console.log('Referer:', req.headers.referer);
      next();
    });
  }
};

// Export des configurations pour une utilisation externe si nécessaire
export const securityConfig = {
  corsOptions,
  limiter,
  contentSecurityPolicy,
};
