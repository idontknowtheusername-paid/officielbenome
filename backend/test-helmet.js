console.log('🚀 Test Express + dotenv + helmet...');

import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';

console.log('✅ Express, dotenv et helmet importés avec succès');

dotenv.config();

console.log('✅ dotenv configuré avec succès');

const app = express();

console.log('🔧 Configuration de helmet...');
app.use(helmet());

console.log('✅ helmet configuré avec succès');

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ 
    message: 'Express + dotenv + helmet fonctionne !',
    env: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

console.log('🌐 Démarrage du serveur Express + dotenv + helmet...');

const server = app.listen(PORT, () => {
  console.log(`✅ Serveur Express + dotenv + helmet démarré sur le port ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
});

console.log('🎯 Test Express + dotenv + helmet terminé'); 