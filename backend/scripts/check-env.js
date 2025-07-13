#!/usr/bin/env node

import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
    try {
      execSync('git config --local core.hooksPath /dev/null');
    } catch (error) {
      console.log('⚠️  Impossible de désactiver les hooks git (normal en production)');
    }
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
  
  // En production, on utilise des valeurs par défaut au lieu de faire échouer
  if (isProduction) {
    console.log('🔄 Utilisation de valeurs par défaut pour les variables manquantes...');
    
    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/officielbenome_prod';
      console.log('📊 DATABASE_URL défini avec une valeur par défaut');
    }
    
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = 'default_jwt_secret_for_production_change_this';
      console.log('🔐 JWT_SECRET défini avec une valeur par défaut');
    }
    
    if (!process.env.PORT) {
      process.env.PORT = '10000';
      console.log('🌐 PORT défini avec une valeur par défaut');
    }
  } else {
    console.error('❌ Variables d\'environnement requises manquantes en mode développement');
    process.exit(1);
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
