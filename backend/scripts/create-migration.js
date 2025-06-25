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
async function createMigration() {
  try {
    const migrationName = process.argv[2];
    
    if (!migrationName) {
      console.error('Veuillez spécifier un nom de migration. Exemple: npm run migration:create -- create-users-table');
      process.exit(1);
    }

    console.log(`\nCréation d'une nouvelle migration: ${migrationName}\n`);

    // Vérifier si le dossier database/migrations existe, sinon le créer
    const migrationsDir = join(process.cwd(), 'database', 'migrations');
    const seedersDir = join(process.cwd(), 'database', 'seeders');
    
    // Créer les dossiers nécessaires s'ils n'existent pas
    await runCommand(`mkdir -p ${migrationsDir} ${seedersDir}`);

    // Créer la migration avec Sequelize CLI
    const dbUrl = config.use_env_variable ? process.env[config.use_env_variable] : null;
    let sequelizeCommand = 'npx sequelize-cli migration:generate';
    
    if (dbUrl) {
      // Utiliser l'URL de connexion directement
      sequelizeCommand += ` --url "${dbUrl}"`;
    } else {
      // Utiliser les paramètres de connexion individuels
      const { username, password, database, host, port } = config;
      sequelizeCommand += ` --name ${migrationName}`;
      sequelizeCommand += ` --config ${join(__dirname, '../config/sequelize-config.js')}`;
      
      // Ajouter les variables d'environnement nécessaires
      process.env.PG_USER = username;
      process.env.PG_PASSWORD = password;
      process.env.PG_DATABASE = database;
      process.env.PG_HOST = host;
      process.env.PG_PORT = port;
    }
    
    // Exécuter la commande de création de migration
    await runCommand(sequelizeCommand);
    
    console.log('\n✅ Migration créée avec succès !\n');
    console.log('Pour appliquer la migration, exécutez:');
    console.log('  npm run db:migrate\n');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de la migration:', error);
    process.exit(1);
  }
}

// Démarrer le script
createMigration();
