import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Report = sequelize.define('Report', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  contentType: { type: DataTypes.STRING, allowNull: false }, // ex: 'listing', 'review', etc.
  contentId: { type: DataTypes.UUID, allowNull: false },
  reason: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING, defaultValue: 'pending' }, // pending, resolved, rejected
  severity: { type: DataTypes.STRING },
}, { timestamps: true });

export default Report; 