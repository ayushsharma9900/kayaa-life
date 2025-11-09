import { NextRequest, NextResponse } from 'next/server';
import { products as initialProducts } from '@/data/products';

// Initialize database with seed data if it's empty
async function initializeDatabase() {
  try {
    if (!process.env.MONGODB_URI) return;
    const { default: dbConnect } = await import('@/lib/mongodb');
    const { default: Product } = await import('@/lib/models/Product');
    await dbConnect();
    const count = await Product.countDocuments();
    
    if (count === 0) {
      await Product.insertMany(initialProducts.map((p, index) => ({
        ...p,
        _id: undefined
      })));
    }
  } catch (error) {
    console.log('Database not available, using fallback data');
  }
}

// Get products from MongoDB
async function getProducts() {
  try {
    if (process.env.MONGODB_URI) {
      const { default: dbConnect } = await import('@/lib/mongodb');
      const { default: Product } = await import('@/lib/models/Product');
      await dbConnect();
      await initializeDatabase();
      return await Product.find({}).lean();
    }
  } catch (error) {
    console.log('Database error, using fallback');
  }
  return initialProducts;
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
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 });
    }
    const { default: dbConnect } = await import('@/lib/mongodb');
    const { default: Product } = await import('@/lib/models/Product');
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
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 });
    }
    const { default: dbConnect } = await import('@/lib/mongodb');
    const { default: Product } = await import('@/lib/models/Product');
    await dbConnect();
    const data = await request.json();
    console.log('PUT request received with data:', { id: data._id || data.id, name: data.name });
    
    const { _id, id, createdAt, updatedAt, ...updateData } = data;
    const productId = _id || id;
    
    if (!productId) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }
    
    const product = await Product.findByIdAndUpdate(productId, updateData, { new: true, runValidators: true });
    if (!product) {
      console.error('Product not found with ID:', productId);
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    console.log('Product updated successfully:', product.name);
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 });
    }
    const { default: dbConnect } = await import('@/lib/mongodb');
    const { default: Product } = await import('@/lib/models/Product');
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