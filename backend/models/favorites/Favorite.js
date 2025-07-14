import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const Favorite = sequelize.define('Favorite', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  itemId: {
    type: DataTypes.UUID,
    allowNull: false
    // Référence dynamique selon le type d'item (listing, product, etc.)
  }
}, {
  timestamps: true,
  underscored: true,
  tableName: 'favorites',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['item_id']
    }
  ]
});

// Associations à définir selon le contexte d'itemId
// Favorite.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default Favorite;
