import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const ServiceListing = sequelize.define('ServiceListing', {
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
  location: {
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
    type: DataTypes.ENUM('active', 'pending_approval', 'inactive'),
    defaultValue: 'pending_approval',
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
  tableName: 'service_listings',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['category'] },
    { fields: ['status'] },
    { fields: ['location'] }
  ]
});

// Associations à définir selon le contexte
// ServiceListing.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default ServiceListing;
