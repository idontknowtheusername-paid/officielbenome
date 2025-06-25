import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Listing = sequelize.define('Listing', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.FLOAT, allowNull: false },
  currency: { type: DataTypes.STRING, defaultValue: 'XOF' },
  type: { type: DataTypes.STRING }, // sale, rent, service, product
  categoryId: { type: DataTypes.UUID },
  userId: { type: DataTypes.UUID },
  images: { type: DataTypes.ARRAY(DataTypes.STRING) },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  isFeatured: { type: DataTypes.BOOLEAN, defaultValue: false },
  viewCount: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { timestamps: true });

export default Listing;
