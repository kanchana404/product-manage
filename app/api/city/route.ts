// app/api/city/route.ts

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database';
import City from '@/lib/database/models/city.model';
import mongoose from 'mongoose';

// GET: Fetch all cities
export async function GET() {
  try {
    await connectToDatabase();
    const cities = await City.find({}).sort({ createdAt: -1 });
    return NextResponse.json(cities, { status: 200 });
  } catch (error) {
    console.error('GET /api/city error:', error);
    return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 });
  }
}

// POST: Add a new city
export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    await connectToDatabase();

    // Check if city already exists
    const existingCity = await City.findOne({ name: name.trim() });
    if (existingCity) {
      return NextResponse.json({ error: 'City already exists' }, { status: 400 });
    }

    const city = new City({ name: name.trim() });
    await city.save();

    return NextResponse.json(city, { status: 201 });
  } catch (error) {
    console.error('POST /api/city error:', error);
    return NextResponse.json({ error: 'Failed to add city' }, { status: 500 });
  }
}

// PUT: Update a city
export async function PUT(request: Request) {
  try {
    const { id, name } = await request.json();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Valid ID is required' }, { status: 400 });
    }

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    await connectToDatabase();

    const city = await City.findById(id);
    if (!city) {
      return NextResponse.json({ error: 'City not found' }, { status: 404 });
    }

    // Check if another city with the same name exists
    const existingCity = await City.findOne({ name: name.trim(), _id: { $ne: id } });
    if (existingCity) {
      return NextResponse.json({ error: 'Another city with the same name exists' }, { status: 400 });
    }

    city.name = name.trim();
    await city.save();

    return NextResponse.json(city, { status: 200 });
  } catch (error) {
    console.error('PUT /api/city error:', error);
    return NextResponse.json({ error: 'Failed to update city' }, { status: 500 });
  }
}

// DELETE: Delete a city
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Valid ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    // Using findByIdAndDelete instead of remove
    const deletedCity = await City.findByIdAndDelete(id);

    if (!deletedCity) {
      return NextResponse.json({ error: 'City not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'City deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/city error:', error);
    return NextResponse.json({ error: 'Failed to delete city' }, { status: 500 });
  }
}
