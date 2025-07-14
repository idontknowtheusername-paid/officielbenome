import { Sequelize } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import Blog from './Blog.js';
import Project from './Project.js';
import Contact from './Contact.js';

// Importez d'autres modèles ici
// import Post from './Post.js';

// Initialisation des modèles
const models = {
  User,
  Blog,
  Project,
  Contact,
  // Post,
  sequelize,
  Sequelize
};

// Définition des relations entre les modèles
if (Blog.associate) {
  Blog.associate(models);
}

// User peut avoir plusieurs blogs
User.hasMany(Blog, {
  foreignKey: 'authorId',
  as: 'blogs'
});

// Blog appartient à un utilisateur
Blog.belongsTo(User, {
  foreignKey: 'authorId',
  as: 'author'
});

// Synchronisation des modèles avec la base de données
const syncModels = async () => {
  try {
    // Forcer la synchronisation en mode développement
    const force = process.env.NODE_ENV === 'development';
    await sequelize.sync({ force });
    console.log('✅ Modèles synchronisés avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation des modèles:', error);
    throw error;
  }
};

export { syncModels };
export default models;
