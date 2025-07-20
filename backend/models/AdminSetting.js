import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AdminSetting = sequelize.define('AdminSetting', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  key: { type: DataTypes.STRING, allowNull: false, unique: true },
  value: { type: DataTypes.TEXT, allowNull: false },
}, { timestamps: true });

export default AdminSetting; 