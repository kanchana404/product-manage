// lib/database/models/cityProduct.model.ts

import { Schema, model, models, Types } from 'mongoose';

const CityProductSchema = new Schema(
  {
    city: { type: Types.ObjectId, ref: 'City', required: true, unique: true },
    products: [{ type: Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
);

// Prevent model recompilation issues in development
const CityProduct = models.CityProduct || model('CityProduct', CityProductSchema);

export default CityProduct;
