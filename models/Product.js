const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  image: { type: String, default: '' },
  images: [{ type: String }],
  category: { type: String, default: 'General' },
  brand: { type: String, default: '' },
  tags: [{ type: String }],
  variants: [
    {
      name: String, // e.g., "Small", "Medium", "Large", "Chicken", "Beef"
      price: Number, // optional override
      sku: String,
      stock: { type: Number, default: 100 },
    },
  ],
  stock: { type: Number, default: 100 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Product', productSchema);
