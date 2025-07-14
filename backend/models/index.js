import { Sequelize } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import Blog from './Blog.js';
import Project from './Project.js';
import Contact from './Contact.js';
import Notification from './notifications/Notification.js';
import Favorite from './favorites/Favorite.js';
import MarketplaceProduct from './marketplace/MarketplaceProduct.js';
import ServiceListing from './listings/ServiceListing.js';
import AutoListing from './listings/AutoListing.js';
import RealEstateListing from './listings/RealEstateListing.js';

// Importez d'autres modèles ici
// import Post from './Post.js';

// Initialisation des modèles
const models = {
  User,
  Blog,
  Project,
  Contact,
  Notification,
  Favorite,
  MarketplaceProduct,
  ServiceListing,
  AutoListing,
  RealEstateListing,
  // Post,
  sequelize,
  Sequelize
};

// Définition des relations entre les modèles
if (Blog.associate) {
  Blog.associate(models);
}

if (Notification.associate) {
  Notification.associate(models);
}

// User peut avoir plusieurs blogs
User.hasMany(Blog, {
  foreignKey: 'authorId',
  as: 'blogs'
});

// Blog appartient à un utilisateur - cette association est définie dans le modèle Blog
// Blog.belongsTo(User, {
//   foreignKey: 'authorId',
//   as: 'author'
// });

// User peut avoir plusieurs notifications
User.hasMany(Notification, {
  foreignKey: 'userId',
  as: 'notifications'
});

// Notification appartient à un utilisateur
Notification.belongsTo(User, {
  foreignKey: 'userId',
  as: 'notificationUser'
});

// User peut avoir plusieurs favoris
User.hasMany(Favorite, {
  foreignKey: 'userId',
  as: 'favorites'
});

// Favorite appartient à un utilisateur
Favorite.belongsTo(User, {
  foreignKey: 'userId',
  as: 'favoriteUser'
});

// User peut avoir plusieurs produits marketplace
User.hasMany(MarketplaceProduct, {
  foreignKey: 'userId',
  as: 'marketplaceProducts'
});

// MarketplaceProduct appartient à un utilisateur
MarketplaceProduct.belongsTo(User, {
  foreignKey: 'userId',
  as: 'marketplaceUser'
});

// User peut avoir plusieurs annonces de service
User.hasMany(ServiceListing, {
  foreignKey: 'userId',
  as: 'serviceListings'
});

// ServiceListing appartient à un utilisateur
ServiceListing.belongsTo(User, {
  foreignKey: 'userId',
  as: 'serviceUser'
});

// User peut avoir plusieurs annonces auto
User.hasMany(AutoListing, {
  foreignKey: 'userId',
  as: 'autoListings'
});

// AutoListing appartient à un utilisateur
AutoListing.belongsTo(User, {
  foreignKey: 'userId',
  as: 'autoUser'
});

// User peut avoir plusieurs annonces immobilières
User.hasMany(RealEstateListing, {
  foreignKey: 'userId',
  as: 'realEstateListings'
});

// RealEstateListing appartient à un utilisateur
RealEstateListing.belongsTo(User, {
  foreignKey: 'userId',
  as: 'realEstateUser'
});

// Synchronisation des modèles avec la base de données
const syncModels = async () => {
  try {
    // En production, ne pas forcer la synchronisation pour éviter de recréer les tables
    const force = process.env.NODE_ENV === 'development';
    const alter = process.env.NODE_ENV === 'production'; // Alter existing tables in production
    
    console.log(`🔄 Synchronisation des modèles (force: ${force}, alter: ${alter})`);
    
    await sequelize.sync({ force, alter });
    console.log('✅ Modèles synchronisés avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation des modèles:', error);
    
    // En production, si la synchronisation échoue, continuer sans erreur
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️  Synchronisation échouée en production, continuation sans synchronisation...');
      return;
    }
    
    throw error;
  }
};

export { syncModels };
export default models;
