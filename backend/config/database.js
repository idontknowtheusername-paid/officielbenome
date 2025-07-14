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

let sequelize;

// Si nous sommes en production et que nous avons une DATABASE_URL, nous l'utilisons
if (env === 'production' && process.env.DATABASE_URL) {
  try {
    // Parser l'URL manuellement pour éviter les erreurs avec les caractères spéciaux
    const dbUrl = process.env.DATABASE_URL;
    
    // Regex pour extraire les composants de l'URL PostgreSQL
    const urlRegex = /^postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/;
    const match = dbUrl.match(urlRegex);
    
    if (match) {
      const [, username, password, host, port, database] = match;
      
      // Encoder le mot de passe pour les caractères spéciaux
      const encodedPassword = encodeURIComponent(password);
      
      // Reconstruire l'URL avec le mot de passe encodé
      const encodedUrl = `postgresql://${username}:${encodedPassword}@${host}:${port}/${database}`;
      
      // Mettre à jour l'environnement avec l'URL encodée
      process.env.DATABASE_URL = encodedUrl;
      console.log('✅ URL de base de données encodée correctement');
      
      // Initialiser Sequelize avec l'URL encodée
      sequelize = new Sequelize(encodedUrl, {
        ...config,
        logging: config.logging ? console.log : false,
      });
    } else {
      console.error('❌ Format d\'URL de base de données invalide');
      sequelize = new Sequelize(process.env.DATABASE_URL, {
        ...config,
        logging: config.logging ? console.log : false,
      });
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'encodage de l\'URL de base de données:', error.message);
    // Fallback vers l'URL originale
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      ...config,
      logging: config.logging ? console.log : false,
    });
  }
} else {
  // Configuration pour development/test
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
