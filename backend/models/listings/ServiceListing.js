import mongoose from 'mongoose';

const serviceListingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: Number,
  currency: String,
  category: String,
  images: [String],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['active', 'pending_approval', 'inactive'], default: 'active' },
  isFeatured: { type: Boolean, default: false },
  viewCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('ServiceListing', serviceListingSchema);
