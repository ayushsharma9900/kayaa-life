import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  image: { type: String },
  subcategories: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);