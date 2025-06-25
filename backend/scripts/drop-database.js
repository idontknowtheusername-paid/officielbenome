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

// Fonction pour supprimer la base de données
async function dropDatabase() {
  try {
    console.log('\nSuppression de la base de données...\n');

    // Vérifier si la base de données existe
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
    
    // Vérifier si la base de données existe avant de la supprimer
    const dbExists = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1', 
      [config.database]
    );
    
    if (dbExists.rows.length === 0) {
      console.log(`ℹ️  La base de données "${config.database}" n'existe pas.`);
      await client.end();
      return;
    }
    
    // Terminer toutes les connexions actives à la base de données
    await client.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = $1
      AND pid <> pg_backend_pid();
    `, [config.database]);
    
    // Supprimer la base de données
    await client.query(`DROP DATABASE IF EXISTS ${config.database}`);
    
    console.log(`✅ Base de données "${config.database}" supprimée avec succès !`);
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression de la base de données:', error.message);
    process.exit(1);
  }
}

// Démarrer le script
dropDatabase();
