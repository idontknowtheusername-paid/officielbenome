import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

// Configuration de base de données
const databaseConfig = {
  development: {
    username: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'postgres',
    database: process.env.PG_DATABASE || 'officielbenome_dev',
    host: process.env.PG_HOST || 'localhost',
    port: process.env.PG_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  },
  test: {
    username: process.env.PG_TEST_USER || 'postgres',
    password: process.env.PG_TEST_PASSWORD || 'postgres',
    database: process.env.PG_TEST_DATABASE || 'officielbenome_test',
    host: process.env.PG_TEST_HOST || 'localhost',
    port: process.env.PG_TEST_PORT || 5433,
    dialect: 'postgres',
    logging: false,
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};

const env = process.env.NODE_ENV || 'development';
const config = { ...databaseConfig[env] };

// Si nous sommes en production et que nous avons une DATABASE_URL, nous l'utilisons
if (env === 'production' && process.env.DATABASE_URL) {
  // Créer une nouvelle URL pour encoder correctement les caractères spéciaux
  const dbUrl = new URL(process.env.DATABASE_URL);
  
  // Si le mot de passe contient des caractères spéciaux, les encoder
  if (dbUrl.password) {
    dbUrl.password = encodeURIComponent(dbUrl.password);
  }
  
  // Mettre à jour la configuration avec l'URL encodée
  config.url = dbUrl.toString();
}

let sequelize;

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], {
    ...config,
    logging: config.logging ? console.log : false,
  });
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
      ...config,
      logging: config.logging ? console.log : false,
    }
  );
}

// Test de la connexion
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie avec succès.');
  } catch (error) {
    console.error('❌ Impossible de se connecter à la base de données:', error);
    process.exit(1);
  }
};

testConnection();

export default sequelize;
