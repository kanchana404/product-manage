// app/api/city-product/route.ts

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database';
import CityProduct from '@/lib/database/models/cityProduct.model';
import City from '@/lib/database/models/city.model';
import Product from '@/lib/database/models/product.model';
import mongoose from 'mongoose';

// GET: Fetch all city-product associations
export async function GET() {
  try {
    await connectToDatabase();
    const associations = await CityProduct.find({})
      .populate('city')
      .populate('products')
      .sort({ createdAt: -1 });
    return NextResponse.json(associations, { status: 200 });
  } catch (error) {
    console.error('GET /api/city-product error:', error);
    return NextResponse.json({ error: 'Failed to fetch city-product associations' }, { status: 500 });
  }
}

// POST: Add a product to a city
export async function POST(request: Request) {
  try {
    const { cityId, productIds } = await request.json();

    if (!cityId || !mongoose.Types.ObjectId.isValid(cityId)) {
      return NextResponse.json({ error: 'Valid cityId is required' }, { status: 400 });
    }

    if (!Array.isArray(productIds) || productIds.some(id => !mongoose.Types.ObjectId.isValid(id))) {
      return NextResponse.json({ error: 'Valid productIds array is required' }, { status: 400 });
    }

    await connectToDatabase();

    // Check if the city exists
    const city = await City.findById(cityId);
    if (!city) {
      return NextResponse.json({ error: 'City not found' }, { status: 404 });
    }

    // Check if all products exist
    const products = await Product.find({ _id: { $in: productIds } });
    if (products.length !== productIds.length) {
      return NextResponse.json({ error: 'One or more products not found' }, { status: 404 });
    }

    // Find existing association
    let association = await CityProduct.findOne({ city: cityId });

    if (association) {
      // Add new products, avoiding duplicates
      const newProducts = productIds.filter(pid => !association.products.includes(pid));
      association.products.push(...newProducts);
      await association.save();
    } else {
      // Create new association
      association = new CityProduct({
        city: cityId,
        products: productIds,
      });
      await association.save();
    }

    // Corrected populate usage
    await association.populate(['city', 'products']);

    return NextResponse.json(association, { status: 201 });
  } catch (error) {
    console.error('POST /api/city-product error:', error);
    return NextResponse.json({ error: 'Failed to add products to city' }, { status: 500 });
  }
}

// PUT: Update products for a city
export async function PUT(request: Request) {
  try {
    const { cityId, productIds } = await request.json();

    if (!cityId || !mongoose.Types.ObjectId.isValid(cityId)) {
      return NextResponse.json({ error: 'Valid cityId is required' }, { status: 400 });
    }

    if (!Array.isArray(productIds) || productIds.some(id => !mongoose.Types.ObjectId.isValid(id))) {
      return NextResponse.json({ error: 'Valid productIds array is required' }, { status: 400 });
    }

    await connectToDatabase();

    // Check if the city exists
    const city = await City.findById(cityId);
    if (!city) {
      return NextResponse.json({ error: 'City not found' }, { status: 404 });
    }

    // Check if all products exist
    const products = await Product.find({ _id: { $in: productIds } });
    if (products.length !== productIds.length) {
      return NextResponse.json({ error: 'One or more products not found' }, { status: 404 });
    }

    // Update or create association
    let association = await CityProduct.findOne({ city: cityId });

    if (association) {
      association.products = productIds;
      await association.save();
    } else {
      association = new CityProduct({
        city: cityId,
        products: productIds,
      });
      await association.save();
    }

    // Corrected populate usage
    await association.populate(['city', 'products']);

    return NextResponse.json(association, { status: 200 });
  } catch (error) {
    console.error('PUT /api/city-product error:', error);
    return NextResponse.json({ error: 'Failed to update products for city' }, { status: 500 });
  }
}

// DELETE: Remove products from a city or delete the association
export async function DELETE(request: Request) {
  try {
    const { cityId, productIds } = await request.json();

    if (!cityId || !mongoose.Types.ObjectId.isValid(cityId)) {
      return NextResponse.json({ error: 'Valid cityId is required' }, { status: 400 });
    }

    if (!Array.isArray(productIds) || productIds.some(id => !mongoose.Types.ObjectId.isValid(id))) {
      return NextResponse.json({ error: 'Valid productIds array is required' }, { status: 400 });
    }

    await connectToDatabase();

    const association = await CityProduct.findOne({ city: cityId });
    if (!association) {
      return NextResponse.json({ error: 'Association not found' }, { status: 404 });
    }

    // Remove specified products
    association.products = association.products.filter(pid => !productIds.includes(pid.toString()));
    if (association.products.length === 0) {
      await CityProduct.findByIdAndDelete(association._id);
    } else {
      await association.save();
    }

    return NextResponse.json({ message: 'Products removed from city successfully' }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/city-product error:', error);
    return NextResponse.json({ error: 'Failed to remove products from city' }, { status: 500 });
  }
}
