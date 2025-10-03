import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  subcategory: { type: String },
  brand: { type: String, required: true },
  image: { type: String, required: true },
  images: [{ type: String }],
  inStock: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  tags: [{ type: String }],
  ingredients: [{ type: String }],
  benefits: [{ type: String }],
  howToUse: { type: String },
  skinType: [{ type: String }],
  size: { type: String },
  shade: { type: String },
  originalPrice: { type: Number },
  discount: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);