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
import setupSwagger from './swagger.js';
import logger from './config/logger.js';
import redisClient from './config/redis.js';

console.log('📦 Tous les modules chargés avec succès');

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

// Configuration du port et de l'hôte
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

// Démarrage du serveur sans base de données
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

    console.log('🔄 Tentative de connexion à la base de données...');
    // Tentative de connexion à la base de données (optionnelle)
    try {
      const sequelize = await import('./config/database.js');
      console.log('✅ Base de données connectée avec succès');
    } catch (dbError) {
      console.log('⚠️  Base de données non disponible, poursuite sans base de données:', dbError.message);
      console.log('📝 Note: Certaines fonctionnalités seront limitées sans base de données');
    }
    
    console.log('🌐 Démarrage du serveur HTTP...');
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
      
      // Pied de page
      console.log('\n' + '='.repeat(80));
      console.log(`🛠️  ${new Date().toLocaleString()}`.padEnd(79) + '🛠️');
      console.log('='.repeat(80));
    });

    return server;
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

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