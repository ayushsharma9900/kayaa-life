import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/lib/models/Category';

const fallbackCategories = [
  { name: 'Skincare', slug: 'skincare', description: 'Complete skincare solutions', image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop' },
  { name: 'Makeup', slug: 'makeup', description: 'Premium makeup products', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop' },
  { name: 'Hair Care', slug: 'hair-care', description: 'Professional hair care products', image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400&h=400&fit=crop' },
  { name: 'Fragrance', slug: 'fragrance', description: 'Luxury fragrances', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop' },
  { name: 'Personal Care', slug: 'personal-care', description: 'Essential personal care', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop' }
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
    const categories = await Category.find({ isActive: true }).lean();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch categories' }, { status: 500 });
  }
}