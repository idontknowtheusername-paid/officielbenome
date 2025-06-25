#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

console.log('🔍 Vérification de l\'environnement...');

// Vérifie si on est en production
const isProduction = process.env.NODE_ENV === 'production';

// Fonction pour exécuter des commandes shell
exec(`node -v`)
  .then(({ stdout: nodeVersion }) => {
    console.log(`✅ Node.js version: ${nodeVersion.trim()}`);
  })
  .catch(err => {
    console.error('❌ Erreur avec Node.js:', err.message);
  });

// Vérifie les dépendances manquantes
if (isProduction) {
  console.log('🚀 Mode production détecté - Désactivation des scripts inutiles');
  
  // Désactive les hooks git si nécessaire
  if (fs.existsSync('.git/hooks')) {
    console.log('🔧 Désactivation des hooks git pour la production');
    execSync('git config --local core.hooksPath /dev/null');
  }
}

// Vérifie les variables d'environnement requises
const requiredEnvVars = [
  'NODE_ENV',
  'DATABASE_URL',
  'JWT_SECRET',
  'PORT'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn('⚠️  Variables d\'environnement manquantes:', missingVars.join(', '));
  
  // Crée un fichier .env.example s'il n'existe pas
  if (!fs.existsSync('.env.example') && fs.existsSync('.env.example.render')) {
    fs.copyFileSync('.env.example.render', '.env.example');
    console.log('📄 Fichier .env.example créé à partir de .env.example.render');
  }
}

console.log('✅ Vérification terminée');

// Fonction utilitaire pour exécuter des commandes shell
function exec(command) {
  return new Promise((resolve, reject) => {
    try {
      const result = execSync(command, { encoding: 'utf-8' });
      resolve({ stdout: result });
    } catch (error) {
      reject(error);
    }
  });
}
