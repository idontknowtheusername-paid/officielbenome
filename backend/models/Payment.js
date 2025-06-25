import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  currency: { type: DataTypes.STRING, defaultValue: 'XOF' },
  provider: { type: DataTypes.STRING }, // stripe, paypal, paydunya
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
  details: { type: DataTypes.JSON },
}, { timestamps: true });

export default Payment;
