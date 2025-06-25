import mongoose from 'mongoose';

const autoListingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: Number,
  currency: String,
  brand: String,
  model: String,
  year: Number,
  mileage: Number,
  fuelType: String,
  transmission: String,
  images: [String],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['active', 'pending_approval', 'sold', 'inactive'], default: 'active' },
  isFeatured: { type: Boolean, default: false },
  viewCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('AutoListing', autoListingSchema);
