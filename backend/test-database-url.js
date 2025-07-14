console.log('🚀 Test base de données avec URL Render...');

import express from 'express';
import dotenv from 'dotenv';

console.log('✅ Express et dotenv importés avec succès');

dotenv.config();

console.log('📊 Variables d\'environnement:');
console.log('  DATABASE_URL:', process.env.DATABASE_URL);

const app = express();
const PORT = process.env.PORT || 3000;

console.log('📦 Test import de la base de données...');
try {
  const { sequelize } = await import('./config/database.js');
  console.log('✅ Base de données importée avec succès');
  
  console.log('🔧 Test de connexion à la base de données...');
  await sequelize.authenticate();
  console.log('✅ Base de données connectée avec succès');
  
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Base de données PostgreSQL fonctionne !',
      env: process.env.NODE_ENV || 'development',
      port: PORT,
      database: 'Connectée'
    });
  });
  
} catch (error) {
  console.error('❌ Erreur avec la base de données:');
  console.error('Message:', error.message);
  console.error('Code:', error.code);
  console.error('Name:', error.name);
  
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Erreur de base de données',
      error: error.message,
      env: process.env.NODE_ENV || 'development',
      port: PORT,
      database: 'Erreur'
    });
  });
}

console.log('🌐 Démarrage du serveur...');

const server = app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
});

console.log('🎯 Test terminé'); 