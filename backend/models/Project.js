import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  link: { type: String },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
