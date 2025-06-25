import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: String,
  message: String,
  isRead: { type: Boolean, default: false },
  data: Object,
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
