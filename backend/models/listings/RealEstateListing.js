import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  address: String,
  city: String,
  country: String,
  coordinates: {
    latitude: Number,
    longitude: Number
  }
}, { _id: false });

const realEstateListingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: Number,
  currency: String,
  type: { type: String, enum: ['sale', 'rent'] },
  propertyType: String,
  bedrooms: Number,
  bathrooms: Number,
  areaSqMeters: Number,
  location: locationSchema,
  images: [String],
  amenities: [String],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['active', 'pending_approval', 'sold', 'rented', 'inactive'], default: 'active' },
  isFeatured: { type: Boolean, default: false },
  viewCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('RealEstateListing', realEstateListingSchema);
