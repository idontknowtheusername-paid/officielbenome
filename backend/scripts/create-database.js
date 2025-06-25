#!/usr/bin/env node

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';
import dotenv from 'dotenv';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: join(process.cwd(), '.env') });

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
    return null;
  }
}

// Fonction pour vérifier si la base de données existe
async function databaseExists() {
  try {
    const { Client } = require('pg');
    
    const dbConfig = {
      user: config.username,
      password: config.password,
      host: config.host,
      port: config.port,
      database: 'postgres', // Se connecter à la base de données par défaut
    };
    
    const client = new Client(dbConfig);
    await client.connect();
    
    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1', 
      [config.database]
    );
    
    await client.end();
    return result.rows.length > 0;
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'existence de la base de données:', error.message);
    return false;
  }
}

// Fonction pour créer la base de données
async function createDatabase() {
  try {
    console.log('\nCréation de la base de données...\n');

    // Vérifier si la base de données existe déjà
    const dbExists = await databaseExists();
    
    if (dbExists) {
      console.log(`⚠️  La base de données "${config.database}" existe déjà.`);
      return;
    }

    // Se connecter à la base de données postgres par défaut pour créer la nouvelle base de données
    const { Client } = require('pg');
    
    const dbConfig = {
      user: config.username,
      password: config.password,
      host: config.host,
      port: config.port,
      database: 'postgres', // Se connecter à la base de données par défaut
    };
    
    const client = new Client(dbConfig);
    await client.connect();
    
    // Créer la base de données
    await client.query(`CREATE DATABASE ${config.database}`);
    console.log(`✅ Base de données "${config.database}" créée avec succès !`);
    
    // Créer l'utilisateur s'il n'existe pas
    try {
      await client.query(
        `DO $$
        BEGIN
          IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${config.username}') THEN
            CREATE USER ${config.username} WITH PASSWORD '${config.password}';
          END IF;
        END
        $$;`
      );
      
      // Accorder les privilèges
      await client.query(
        `GRANT ALL PRIVILEGES ON DATABASE ${config.database} TO ${config.username};`
      );
      
      console.log(`✅ Utilisateur "${config.username}" configuré avec succès !`);
    } catch (error) {
      console.warn('⚠️  Impossible de configurer l\'utilisateur. Assurez-vous que l\'utilisateur a les droits nécessaires.');
      console.warn('Détails:', error.message);
    }
    
    await client.end();
    
    console.log('\n✅ Base de données configurée avec succès !\n');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de la base de données:', error.message);
    process.exit(1);
  }
}

// Démarrer le script
createDatabase();
