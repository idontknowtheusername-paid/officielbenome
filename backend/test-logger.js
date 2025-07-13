console.log('🚀 Test Express + dotenv + helmet + cors + logger...');

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

console.log('🔧 Test du logger...');
logger.info('Test du logger - INFO');
logger.warn('Test du logger - WARN');

console.log('✅ logger testé avec succès');

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ 
    message: 'Express + dotenv + helmet + cors + logger fonctionne !',
    env: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

console.log('🌐 Démarrage du serveur Express + dotenv + helmet + cors + logger...');

const server = app.listen(PORT, () => {
  console.log(`✅ Serveur Express + dotenv + helmet + cors + logger démarré sur le port ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
});

console.log('🎯 Test Express + dotenv + helmet + cors + logger terminé'); 