import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Upload = sequelize.define('Upload', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID },
  url: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING },
}, { timestamps: true });

export default Upload;
