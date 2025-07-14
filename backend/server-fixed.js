console.log('📦 Chargement des modules...');

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { JWT_CONFIG, ENVIRONMENTS } from './config/constants.js';

console.log('📦 Modules de base chargés');

import { applySecurity } from './middleware/security.js';
import errorHandler from './middleware/errorHandler.js';
import { syncModels } from './models/index.js';
import setupSwagger from './swagger.js';
import logger from './config/logger.js';
import redisClient from './config/redis.js';
import sequelize from './config/database.js';

console.log('📦 Tous les modules chargés avec succès');

// Configuration des chemins ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Chargement des variables d'environnement
dotenv.config();

// Importation des routes
console.log('📦 Import des routes...');
import authRoutes from './routes/auth.routes.js';
import blogRoutes from './routes/blog.routes.js';
import projectRoutes from './routes/project.routes.js';
import contactRoutes from './routes/contact.routes.js';
import usersRoutes from './routes/users.js';
console.log('✅ Routes importées avec succès');

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

// Configuration du port et de l'hôte
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

// Synchronisation des modèles et démarrage du serveur
async function startServer() {
  try {
    console.log('🚀 Démarrage du serveur...');
    console.log('📊 Variables d\'environnement:');
    console.log('  NODE_ENV:', process.env.NODE_ENV);
    console.log('  PORT:', process.env.PORT);
    console.log('  DATABASE_URL:', process.env.DATABASE_URL ? 'Définie' : 'Non définie');
    console.log('  JWT_SECRET:', process.env.JWT_SECRET ? 'Définie' : 'Non définie');
    
    // Variables d'environnement requises avec valeurs par défaut
    const envVars = {
      NODE_ENV: process.env.NODE_ENV || ENVIRONMENTS.DEVELOPMENT,
      PORT: PORT,
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/officielbenome_dev',
      JWT_SECRET: process.env.JWT_SECRET || JWT_CONFIG.SECRET,
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || JWT_CONFIG.EXPIRES_IN,
      JWT_COOKIE_EXPIRES_IN: process.env.JWT_COOKIE_EXPIRES_IN || '30',
      EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
      EMAIL_PORT: process.env.EMAIL_PORT || '587',
      EMAIL_USERNAME: process.env.EMAIL_USERNAME || '',
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || '',
      EMAIL_FROM: process.env.EMAIL_FROM || 'no-reply@officielbenome.com',
      REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379'
    };

    console.log('🔧 Configuration des variables d\'environnement...');

    // Mettre à jour process.env avec les valeurs par défaut si nécessaire
    Object.entries(envVars).forEach(([key, value]) => {
      if (!process.env[key]) {
        process.env[key] = value;
        // Ne pas afficher d'avertissement pour les variables non critiques en production
        if (process.env.NODE_ENV !== 'production' || 
            (key !== 'EMAIL_USERNAME' && key !== 'EMAIL_PASSWORD' && key !== 'REDIS_URL')) {
          console.log(`ℹ️  Utilisation de la valeur par défaut pour ${key}: ${key === 'JWT_SECRET' ? '[MASKED]' : value}`);
        }
      }
    });

    // Connexion à Redis (optionnelle)
    if (process.env.NODE_ENV !== 'test' && process.env.REDIS_URL !== 'disabled') {
      try {
        console.log('🔌 Tentative de connexion à Redis...');
        await redisClient.connect();
        console.log('✅ Connecté à Redis avec succès');
        
        // Tester la connexion Redis
        try {
          await redisClient.client.ping();
          console.log('✅ Test de connexion à Redis réussi');
        } catch (pingError) {
          console.log('ℹ️  Redis disponible mais test de ping échoué, poursuite avec des fonctionnalités limitées');
        }
      } catch (redisError) {
        console.log('ℹ️  Redis non disponible, poursuite sans cache');
        // Désactiver Redis pour cette instance
        process.env.REDIS_URL = 'disabled';
      }
    } else {
      console.log('ℹ️  Redis désactivé pour cette instance');
    }

    console.log('🔄 Tentative de synchronisation des modèles...');
    // Synchronisation des modèles avec la base de données
    try {
      logger.info('🔄 Tentative de synchronisation des modèles avec la base de données...');
      console.log('📦 Import des modèles...');
      await syncModels();
      console.log('✅ Synchronisation des modèles réussie');
      logger.info('✅ Base de données synchronisée avec succès');
      
      // Tester la connexion à la base de données
      try {
        await sequelize.authenticate();
        logger.info('✅ Connexion à la base de données établie avec succès');
        
        // Afficher les informations de connexion (en mode développement uniquement)
        if (process.env.NODE_ENV === 'development') {
          const dbConfig = sequelize.config;
          logger.debug(`📊 Configuration de la base de données: ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`);
        }
      } catch (authError) {
        logger.error('❌ Échec de la connexion à la base de données après synchronisation');
        logger.debug('Détails de l\'erreur d\'authentification:', authError);
        throw new Error('Échec de la connexion à la base de données après synchronisation');
      }
    } catch (dbError) {
      logger.error('❌ Erreur de synchronisation de la base de données');
      logger.debug('Détails de l\'erreur de synchronisation:', dbError);
      
      // Vérifier si c'est une erreur de connexion
      if (dbError.name === 'SequelizeConnectionError') {
        logger.error('Veuillez vérifier les informations de connexion à la base de données dans votre fichier .env');
        logger.error(`URL de connexion actuelle: ${process.env.DATABASE_URL || 'Non définie'}`);
      }
      
      throw dbError;
    }
    
    console.log('🌐 Démarrage du serveur HTTP...');
    console.log(`🔧 Port: ${PORT}, Hôte: ${HOST}`);
    console.log('🚀 Tentative de démarrage du serveur...');
    console.log('🔍 Vérification des routes...');
    
    // Afficher les routes pour debug
    console.log('📋 Routes configurées:');
    app._router.stack.forEach(layer => {
      if (layer.route) {
        console.log(`  ${Object.keys(layer.route.methods).join(',').toUpperCase()} ${layer.route.path}`);
      }
    });
    
    // Configuration du serveur
    const server = app.listen(PORT, HOST, () => {
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      const serverAddress = `${protocol}://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`;
      const apiBaseUrl = `${serverAddress}${process.env.API_PREFIX || '/api'}`;
      
      // En-tête du serveur
      console.log('\n' + '='.repeat(80));
      console.log(`🚀 Serveur démarré en mode ${process.env.NODE_ENV}`.padEnd(79) + '🚀');
      console.log('='.repeat(80));
      
      // Informations de base
      console.log(`🌍 Environnement:`.padEnd(20) + process.env.NODE_ENV);
      console.log(`🌐 URL du serveur:`.padEnd(20) + serverAddress);
      console.log(`📡 Point d'accès API:`.padEnd(20) + apiBaseUrl);
      console.log(`🔌 Port d'écoute:`.padEnd(20) + PORT);
      console.log(`🏠 Hôte:`.padEnd(20) + HOST);
      
      // Informations supplémentaires en mode développement
      if (process.env.NODE_ENV !== 'production') {
        console.log('\n🔧 Mode développement:');
        console.log('='.repeat(40));
        console.log(`📊 Interface Swagger:`.padEnd(20) + `${serverAddress}/api-docs`);
        console.log(`📝 Documentation API:`.padEnd(20) + `${serverAddress}/api-docs-json`);
      }
      
      // Pied de page
      console.log('\n' + '='.repeat(80));
      console.log(`🛠️  ${new Date().toLocaleString()}`.padEnd(79) + '🛠️');
      console.log('='.repeat(80));
      
      // Afficher les routes disponibles uniquement en développement
      if (process.env.NODE_ENV === 'development') {
        console.log('\n🔍 Routes disponibles:');
        console.log('='.repeat(60));
        
        const routes = [];
        const processRoute = (path, layer) => {
          if (layer.route) {
            const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase()).join(',');
            routes.push({ method: methods, path: path + (layer.route.path === '/' ? '' : layer.route.path) });
          } else if (layer.name === 'router') {
            layer.handle.stack.forEach(processRoute.bind(null, path + (layer.regexp.toString().includes('(?:^|\\/)api') ? '/api' : '')));
          } else if (layer.name === 'router' && layer.handle.stack) {
            layer.handle.stack.forEach(processRoute.bind(null, path));
          }
        };
        
        app._router.stack.forEach(processRoute.bind(null, ''));
        
        // Afficher les routes groupées par méthode
        const methods = {};
        routes.forEach(route => {
          if (!methods[route.method]) methods[route.method] = [];
          methods[route.method].push(route.path);
        });
        
        Object.entries(methods).forEach(([method, paths]) => {
          console.log(`\n${method}:`);
          paths.sort().forEach(path => console.log(`  ${path}`));
        });
        
        console.log('\n' + '='.repeat(60) + '\n');
      }
    });

    // Gestion des erreurs de démarrage
    server.on('error', (error) => {
      const bind = typeof PORT === 'string' ? `Pipe ${PORT}` : `Port ${PORT}`;
      
      // Journalisation détaillée de l'erreur
      logger.error('\n❌ ERREUR DE DÉMARRAGE DU SERVEUR');
      logger.error('='.repeat(60));
      logger.error(`Code d'erreur: ${error.code || 'Inconnu'}`);
      logger.error(`Message: ${error.message}`);
      
      // Gestion des erreurs spécifiques
      if (error.syscall !== 'listen') {
        logger.error(`Erreur système: ${error.syscall}`);
        logger.error('Détails techniques:', error);
        process.exit(1);
      }

      switch (error.code) {
        case 'EACCES':
          logger.error(`\n❌ ${bind} nécessite des privilèges élevés`);
          logger.error('Solution: Essayez de démarrer le serveur avec un port supérieur à 1024');
          break;
          
        case 'EADDRINUSE':
          logger.error(`\n❌ ${bind} est déjà utilisé par un autre processus`);
          logger.error('Solutions possibles:');
          logger.error('1. Attendez que le port se libère');
          logger.error('2. Utilisez un autre port en définissant la variable d\'environnement PORT');
          logger.error('3. Tuez le processus qui utilise ce port avec: lsof -i :PORT');
          break;
          
        case 'ECONNREFUSED':
          logger.error('\n❌ Impossible de se connecter à la base de données');
          logger.error('Vérifiez que la base de données est en cours d\'exécution et accessible');
          logger.error(`URL de connexion: ${process.env.DATABASE_URL || 'Non définie'}`);
          break;
          
        default:
          logger.error('\n❌ Erreur inattendue lors du démarrage du serveur');
          logger.error('Détails techniques:', error);
      }
      
      logger.error('\n🔍 Pour plus de détails, consultez les logs complets');
      logger.error('='.repeat(60) + '\n');
      process.exit(1);
    });

    return server;
  } catch (error) {
    logger.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

// Gestion des signaux d'arrêt
const shutdown = async (signal) => {
  const signalName = signal || 'SIGTERM';
  logger.warn(`\n⚠️  Réception du signal ${signalName}. Arrêt en cours...`);
  
  try {
    // Fermer la connexion à Redis si elle existe
    if (redisClient && redisClient.isConnected) {
      logger.info('Fermeture de la connexion Redis...');
      await redisClient.client.quit().catch(e => logger.error('Erreur lors de la fermeture de Redis:', e));
    }
    
    // Fermer la connexion à la base de données
    if (sequelize) {
      logger.info('Fermeture de la connexion à la base de données...');
      await sequelize.close().catch(e => logger.error('Erreur lors de la fermeture de la base de données:', e));
    }
    
    logger.info('Toutes les connexions ont été fermées avec succès');
    process.exit(0);
  } catch (error) {
    logger.error('Erreur lors de la fermeture des connexions:', error);
    process.exit(1);
  }
};

// Gestion des signaux d'arrêt
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('\n🚨 ERREUR NON CAPTURÉE');
  console.error('='.repeat(60));
  console.error(`Message: ${error.message}`);
  console.error('Stack:', error.stack);
  console.error('='.repeat(60));
  
  // Tenter une fermeture propre avant de quitter
  if (typeof shutdown === 'function') {
    shutdown('UNCAUGHT_EXCEPTION').then(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Gestion des rejets de promesses non gérés
process.on('unhandledRejection', (reason, promise) => {
  console.warn('\n⚠️  REJET DE PROMESSE NON GÉRÉ');
  console.warn('='.repeat(60));
  console.warn('Raison:', reason);
  
  // Afficher la pile d'appels si disponible
  if (reason instanceof Error) {
    console.warn('Stack:', reason.stack);
  } else {
    console.warn('Détails:', JSON.stringify(reason, null, 2));
  }
  
  console.warn('='.repeat(60));
  
  // Dans un environnement de production, vous pourriez vouloir ne pas arrêter le processus
  // mais simplement le logger. Pour le développement, on peut vouloir arrêter le processus.
  if (process.env.NODE_ENV === 'development') {
    // Ne pas arrêter le processus en développement pour permettre le débogage
    return;
  }
  
  // En production, on peut choisir de quitter après un délai
  // pour éviter que le serveur ne reste dans un état instable
  setTimeout(() => {
    console.error('Arrêt du processus suite à un rejet de promesse non géré');
    process.exit(1);
  }, 1000);
});

// Démarrer le serveur uniquement si ce fichier est exécuté directement
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🎯 Point d\'entrée détecté, démarrage du serveur...');
  
  startServer().catch(error => {
    console.error('❌ Échec du démarrage du serveur:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('Code:', error.code);
    console.error('Name:', error.name);
    process.exit(1);
  });
}

export { app };
export default startServer; 