#!/usr/bin/env node

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger la configuration de Sequelize
const { migrationConfig } = require('../config/sequelize-config');
const env = process.env.NODE_ENV || 'development';
const config = migrationConfig[env];

// Fonction pour exécuter une commande shell
function runCommand(command) {
  try {
    console.log(`Exécution de: ${command}`);
    const output = execSync(command, { stdio: 'inherit' });
    return output;
  } catch (error) {
    console.error(`Erreur lors de l'exécution de la commande: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

// Fonction principale
async function runSeeders() {
  try {
    console.log('\nDémarrage des seeders...\n');

    // Vérifier si le dossier database/seeders existe, sinon le créer
    const seedersDir = join(process.cwd(), 'database', 'seeders');
    await runCommand(`mkdir -p ${seedersDir}`);

    // Construire la commande Sequelize CLI pour les seeders
    const dbUrl = config.use_env_variable ? process.env[config.use_env_variable] : null;
    let sequelizeCommand = 'npx sequelize-cli db:seed:all';
    
    if (dbUrl) {
      // Utiliser l'URL de connexion directement
      sequelizeCommand += ` --url "${dbUrl}"`;
    } else {
      // Utiliser la configuration de développement
      sequelizeCommand += ` --env ${env}`;
      
      // Ajouter les variables d'environnement nécessaires
      const { username, password, database, host, port } = config;
      process.env.PG_USER = username;
      process.env.PG_PASSWORD = password;
      process.env.PG_DATABASE = database;
      process.env.PG_HOST = host;
      process.env.PG_PORT = port;
    }

    // Exécuter les seeders
    console.log('\nExécution des seeders...\n');
    await runCommand(sequelizeCommand);
    
    console.log('\n✅ Tous les seeders ont été exécutés avec succès !\n');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution des seeders:', error);
    process.exit(1);
  }
}

// Démarrer le script
runSeeders();
