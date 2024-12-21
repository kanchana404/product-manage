// lib/database/models/city.model.ts

import { Schema, model, models } from 'mongoose';

const CitySchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

// Prevent model recompilation issues in development
const City = models.City || model('City', CitySchema);

export default City;
