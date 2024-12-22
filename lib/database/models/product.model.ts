// lib/database/models/product.model.ts

import { Schema, model, models } from 'mongoose';

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true, min: 0 }, // Price must be a positive number
    content: { type: String, required: true },
  },
  { timestamps: true }
);

// Prevent model recompilation issues in development
const Product = models.Product || model('Product', ProductSchema);

export default Product;
