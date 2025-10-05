import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import { products as initialProducts } from '@/data/products';

// Initialize database with seed data if it's empty
async function initializeDatabase() {
  await dbConnect();
  const count = await Product.countDocuments();
  
  if (count === 0) {
    await Product.insertMany(initialProducts.map((p, index) => ({
      ...p,
      _id: undefined
    })));
  }
}

// Get products from MongoDB
async function getProducts() {
  await dbConnect();
  await initializeDatabase();
  return await Product.find({}).lean();
}

export async function GET() {
  try {
    const products = await getProducts();
    const mappedProducts = products.map(p => ({
      ...p,
      id: p._id?.toString() || p.id,
      _id: p._id?.toString() || p.id,
      stockCount: p.stockCount || 0,
      reviewCount: p.reviewCount || p.reviews || 0
    }));
    return NextResponse.json({ success: true, data: mappedProducts });
  } catch (error) {
    console.error('Database error, falling back to static data:', error);
    return NextResponse.json({ success: true, data: initialProducts });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    const product = await Product.create(data);
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    const { _id, ...updateData } = data;
    const product = await Product.findByIdAndUpdate(_id, updateData, { new: true });
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 });
  }
}