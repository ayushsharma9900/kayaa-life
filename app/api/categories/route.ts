import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/lib/models/Category';

const fallbackCategories = [
  { _id: '1', id: '1', name: 'Skincare', slug: 'skincare', description: 'Complete skincare solutions', image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop', isActive: true, productCount: 0, createdAt: new Date(), updatedAt: new Date() },
  { _id: '2', id: '2', name: 'Makeup', slug: 'makeup', description: 'Premium makeup products', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop', isActive: true, productCount: 0, createdAt: new Date(), updatedAt: new Date() },
  { _id: '3', id: '3', name: 'Hair Care', slug: 'hair-care', description: 'Professional hair care products', image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400&h=400&fit=crop', isActive: true, productCount: 0, createdAt: new Date(), updatedAt: new Date() },
  { _id: '4', id: '4', name: 'Fragrance', slug: 'fragrance', description: 'Luxury fragrances', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop', isActive: true, productCount: 0, createdAt: new Date(), updatedAt: new Date() },
  { _id: '5', id: '5', name: 'Personal Care', slug: 'personal-care', description: 'Essential personal care', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop', isActive: true, productCount: 0, createdAt: new Date(), updatedAt: new Date() }
];

async function initializeCategories() {
  await dbConnect();
  const count = await Category.countDocuments();
  if (count === 0) {
    await Category.insertMany(fallbackCategories);
  }
}

export async function GET() {
  try {
    await initializeCategories();
    const categories = await Category.find({}).lean();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return NextResponse.json({ success: true, data: fallbackCategories });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    const category = await Category.create(data);
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create category' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    const { id, ...updateData } = data;
    const category = await Category.findByIdAndUpdate(id, updateData, { new: true });
    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    const category = await Category.findByIdAndDelete(data.id);
    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete category' }, { status: 500 });
  }
}