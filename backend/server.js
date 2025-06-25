import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { applySecurity } from './middleware/security.js';
import errorHandler from './middleware/errorHandler.js';
import { syncModels } from './models/index.js';
import setupSwagger from './swagger.js';

// Configuration des chemins ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Chargement des variables d'environnement
dotenv.config();

// Importation des routes
import authRoutes from './routes/auth.routes.js';
import blogRoutes from './routes/blog.routes.js';
import projectRoutes from './routes/project.routes.js';
import contactRoutes from './routes/contact.routes.js';
import usersRoutes from './routes/users.js';

// Initialisation de l'application Express
const app = express();

// Middleware de sécurité
app.use(helmet());

// Configuration de sécurité (inclut CORS, rate limiting, etc.)
applySecurity(app);

// Gestion du body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Configuration Swagger
if (process.env.NODE_ENV !== 'production') {
  setupSwagger(app);
}

// Routes de l'API
const API_PREFIX = process.env.API_PREFIX || '/api';

// Routes d'authentification
app.use(`${API_PREFIX}/auth`, authRoutes);

// Routes des utilisateurs
app.use(`${API_PREFIX}/users`, usersRoutes);

// Routes du blog
app.use(`${API_PREFIX}/blog`, blogRoutes);

// Routes des projets
app.use(`${API_PREFIX}/projects`, projectRoutes);

// Routes de contact
app.use(`${API_PREFIX}/contact`, contactRoutes);

// Route de santé
app.get(`${API_PREFIX}/health`, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Gestion des erreurs 404
app.use('*', (req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Gestionnaire d'erreurs global
app.use(errorHandler);

// Configuration du port
const PORT = process.env.PORT || 3000;

// Synchronisation des modèles et démarrage du serveur
async function startServer() {
  try {
    // Vérifier les variables d'environnement requises
    const requiredEnvVars = [
      'NODE_ENV',
      'PORT',
      'DATABASE_URL',
      'JWT_SECRET',
      'JWT_EXPIRES_IN',
      'JWT_COOKIE_EXPIRES_IN',
      'EMAIL_HOST',
      'EMAIL_PORT',
      'EMAIL_USERNAME',
      'EMAIL_PASSWORD',
      'EMAIL_FROM',
      'REDIS_URL'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Variables d'environnement manquantes: ${missingVars.join(', ')}`);
    }

    // Connexion à Redis
    await redisClient.connect();
    logger.info('✅ Connecté à Redis');

    // Synchronisation des modèles avec la base de données
    await syncModels();
    logger.info('✅ Base de données synchronisée');
    
    // Démarrage du serveur
    const serverPort = process.env.PORT || 10000;
    const server = app.listen(serverPort, '0.0.0.0', () => {
      logger.info(`✅ Serveur démarré en mode ${process.env.NODE_ENV} sur le port ${serverPort}`);
      console.log(`Server is listening on http://0.0.0.0:${serverPort}`);
      
      // Afficher les routes disponibles
      const routes = [];
      app._router.stack.forEach((middleware) => {
        if (middleware.route) {
          // Routes enregistrées directement sur l'application
          const methods = Object.keys(middleware.route.methods).map(method => method.toUpperCase()).join(', ');
          routes.push(`${methods.padEnd(8)} ${middleware.route.path}`);
        } else if (middleware.name === 'router') {
          // Routes enregistrées via des routeurs
          middleware.handle.stack.forEach((handler) => {
            if (handler.route) {
              const methods = Object.keys(handler.route.methods).map(method => method.toUpperCase()).join(', ');
              routes.push(`${methods.padEnd(8)} ${handler.route.path}`);
            }
          });
        }
      });
      
      console.log('\nRoutes disponibles:');
      console.log('==================');
      routes.sort().forEach(route => console.log(route));
      console.log('\n');
    });

    // Gestion des erreurs de démarrage
    server.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof serverPort === 'string' ? `Pipe ${serverPort}` : `Port ${serverPort}`;

      // Gestion des erreurs spécifiques
      switch (error.code) {
        case 'EACCES':
          logger.error(`${bind} nécessite des privilèges élevés`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          logger.error(`${bind} est déjà utilisé`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

    return server;
  } catch (error) {
    logger.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

// Démarrer le serveur
startServer();

export default app;
