import { Sequelize } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

// Importez d'autres modèles ici
// import Blog from './Blog.js';
// import Post from './Post.js';

// Initialisation des modèles
const models = {
  User,
  // Blog,
  // Post,
  sequelize,
  Sequelize
};

// Définition des relations entre les modèles
// Exemple : User.hasMany(Post);
//          Post.belongsTo(User);

// Synchronisation des modèles avec la base de données
const syncModels = async () => {
  try {
    // En production, on utilise sync() sans options pour éviter les modifications de schéma
    // qui peuvent causer des erreurs avec des données existantes
    await sequelize.sync();
    console.log('✅ Modèles synchronisés avec la base de données');
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation des modèles:', error);
    // En production, on ne fait pas process.exit(1) pour éviter de tuer le serveur
    // On laisse le serveur continuer sans synchronisation
    console.log('⚠️  Synchronisation échouée, poursuite sans synchronisation des modèles');
  }
};

export { syncModels };
export default models;
