console.log('🚀 Test Express + dotenv + helmet + cors + logger + redis + database...');

import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';

console.log('✅ Express, dotenv, helmet et cors importés avec succès');

dotenv.config();

console.log('✅ dotenv configuré avec succès');

const app = express();

console.log('🔧 Configuration de helmet...');
app.use(helmet());

console.log('✅ helmet configuré avec succès');

console.log('🔧 Configuration de cors...');
app.use(cors());

console.log('✅ cors configuré avec succès');

console.log('📦 Test import du logger...');
import logger from './config/logger.js';

console.log('✅ logger importé avec succès');

console.log('📦 Test import de redis...');
import redisClient from './config/redis.js';

console.log('✅ redis importé avec succès');

console.log('📦 Test import de la base de données...');
import sequelize from './config/database.js';

console.log('✅ database importée avec succès');

console.log('🔧 Test de connexion à la base de données...');
try {
  await sequelize.authenticate();
  console.log('✅ Base de données connectée avec succès');
} catch (error) {
  console.log('⚠️ Base de données non disponible, mais le serveur continue:', error.message);
}

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ 
    message: 'Express + dotenv + helmet + cors + logger + redis + database fonctionne !',
    env: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

console.log('🌐 Démarrage du serveur Express + dotenv + helmet + cors + logger + redis + database...');

const server = app.listen(PORT, () => {
  console.log(`✅ Serveur Express + dotenv + helmet + cors + logger + redis + database démarré sur le port ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
});

console.log('🎯 Test Express + dotenv + helmet + cors + logger + redis + database terminé'); 