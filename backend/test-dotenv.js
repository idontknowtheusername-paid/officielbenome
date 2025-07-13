console.log('🚀 Test Express + dotenv...');

import express from 'express';
import dotenv from 'dotenv';

console.log('✅ Express et dotenv importés avec succès');

dotenv.config();

console.log('✅ dotenv configuré avec succès');
console.log('📊 Variables d\'environnement:');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  PORT:', process.env.PORT);

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ 
    message: 'Express + dotenv fonctionne !',
    env: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

console.log('🌐 Démarrage du serveur Express + dotenv...');

const server = app.listen(PORT, () => {
  console.log(`✅ Serveur Express + dotenv démarré sur le port ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
});

console.log('🎯 Test Express + dotenv terminé'); 