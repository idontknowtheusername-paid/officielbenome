import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
  itemType: { type: String, enum: ['real-estate', 'auto', 'service', 'product'], required: true },
}, { timestamps: true });

export default mongoose.model('Favorite', favoriteSchema);
