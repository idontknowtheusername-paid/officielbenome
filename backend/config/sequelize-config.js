import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    username: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'postgres',
    database: process.env.PG_DATABASE || 'officielbenome_dev',
    host: process.env.PG_HOST || '127.0.0.1',
    port: process.env.PG_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.SEQUELIZE_LOGGING === 'true' ? console.log : false,
    migrationStorageTableName: 'sequelize_meta',
    seederStorage: 'sequelize',
    seederStorageTableName: 'sequelize_seeders',
  },
  test: {
    username: process.env.PG_TEST_USER || 'postgres',
    password: process.env.PG_TEST_PASSWORD || 'postgres',
    database: process.env.PG_TEST_DATABASE || 'officielbenome_test',
    host: process.env.PG_TEST_HOST || '127.0.0.1',
    port: process.env.PG_TEST_PORT || 5433,
    dialect: 'postgres',
    logging: false,
    migrationStorageTableName: 'sequelize_meta',
    seederStorage: 'sequelize',
    seederStorageTableName: 'sequelize_seeders',
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
    migrationStorageTableName: 'sequelize_meta',
    seederStorage: 'sequelize',
    seederStorageTableName: 'sequelize_seeders',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
};

// Vérification des variables d'environnement requises
if (env === 'production' && !process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL est requise en production');
}

// Configuration pour les migrations
const migrationConfig = {
  [env]: {
    ...config[env],
    // Désactiver le logging pour les migrations
    logging: false,
  },
};

export { migrationConfig };
export default config[env];
