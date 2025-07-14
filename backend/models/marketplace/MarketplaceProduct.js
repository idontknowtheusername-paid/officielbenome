import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const MarketplaceProduct = sequelize.define('MarketplaceProduct', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'pending_approval', 'sold', 'inactive'),
    defaultValue: 'active',
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
}, {
  timestamps: true,
  underscored: true,
  tableName: 'marketplace_products',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['category'] },
    { fields: ['status'] },
    { fields: ['is_featured'] }
  ]
});

// Associations à définir selon le contexte
// MarketplaceProduct.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default MarketplaceProduct;
