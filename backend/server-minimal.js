console.log('🚀 Démarrage du serveur minimal...');

import express from 'express';
import dotenv from 'dotenv';

console.log('📦 Modules de base chargés');

dotenv.config();

console.log('🔧 Variables d\'environnement chargées');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ message: 'Serveur minimal fonctionne !' });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'success',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

console.log('🌐 Démarrage du serveur HTTP...');

const server = app.listen(PORT, () => {
  console.log(`✅ Serveur minimal démarré sur le port ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
});

server.on('error', (error) => {
  console.error('❌ Erreur de serveur:', error);
  process.exit(1);
});

console.log('🎯 Serveur minimal prêt'); 