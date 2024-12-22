// app/api/product/route.ts

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database';
import Product from '@/lib/database/models/product.model';
import mongoose from 'mongoose';

// GET: Fetch all products
export async function GET() {
  try {
    await connectToDatabase();
    const products = await Product.find({}).sort({ createdAt: -1 });
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error('GET /api/product error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST: Add a new product
export async function POST(request: Request) {
  try {
    const { name, price, content } = await request.json();

    // Validation
    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (price === undefined || typeof price !== 'number' || price < 0) {
      return NextResponse.json({ error: 'Valid price is required' }, { status: 400 });
    }
    if (!content || content.trim() === '') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    await connectToDatabase();

    // Check if product already exists
    const existingProduct = await Product.findOne({ name: name.trim() });
    if (existingProduct) {
      return NextResponse.json({ error: 'Product already exists' }, { status: 400 });
    }

    const product = new Product({ name: name.trim(), price, content: content.trim() });
    await product.save();

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('POST /api/product error:', error);
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}

// PUT: Update a product
export async function PUT(request: Request) {
  try {
    const { id, name, price, content } = await request.json();

    // Validation
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Valid ID is required' }, { status: 400 });
    }
    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (price === undefined || typeof price !== 'number' || price < 0) {
      return NextResponse.json({ error: 'Valid price is required' }, { status: 400 });
    }
    if (!content || content.trim() === '') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    await connectToDatabase();

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if another product with the same name exists
    const existingProduct = await Product.findOne({ name: name.trim(), _id: { $ne: id } });
    if (existingProduct) {
      return NextResponse.json({ error: 'Another product with the same name exists' }, { status: 400 });
    }

    product.name = name.trim();
    product.price = price;
    product.content = content.trim();
    await product.save();

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error('PUT /api/product error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE: Delete a product
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Valid ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/product error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
