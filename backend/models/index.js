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
    // En développement, utilisez { force: true } pour supprimer et recréer les tables
    // En production, utilisez { alter: true } pour mettre à jour le schéma sans supprimer les données
    await sequelize.sync({ alter: true });
    console.log('✅ Modèles synchronisés avec la base de données');
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation des modèles:', error);
    process.exit(1);
  }
};

export { syncModels };
export default models;
