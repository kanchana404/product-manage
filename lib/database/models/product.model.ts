// lib/database/models/product.model.ts

import { Schema, model, models } from 'mongoose';

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

// Prevent model recompilation issues in development
const Product = models.Product || model('Product', ProductSchema);

export default Product;
