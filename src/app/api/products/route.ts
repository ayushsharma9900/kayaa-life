import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Product } from '@/types';
import { products as initialProducts } from '@/data/products';

const DB_PATH = path.join(process.cwd(), 'src/data/products-db.json');

// Initialize database with seed data if it's empty
async function initializeDatabase() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    const products = JSON.parse(data);
    
    // If database is empty, seed it with initial products
    if (products.length === 0) {
      await fs.writeFile(DB_PATH, JSON.stringify(initialProducts, null, 2));
      return initialProducts;
    }
    
    return products;
  } catch (error) {
    // If file doesn't exist, create it with initial products
    await fs.writeFile(DB_PATH, JSON.stringify(initialProducts, null, 2));
    return initialProducts;
  }
}

// Read products from database
async function getProducts(): Promise<Product[]> {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, initialize it
    return await initializeDatabase();
  }
}

// Write products to database
async function saveProducts(products: Product[]): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(products, null, 2));
}

// GET: Fetch all products
export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST: Create a new product
export async function POST(request: NextRequest) {
  try {
    const newProduct: Product = await request.json();
    
    // Validate required fields
    if (!newProduct.name || !newProduct.brand || !newProduct.price) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, brand, price' },
        { status: 400 }
      );
    }
    
    const products = await getProducts();
    
    // Generate new ID
    const maxId = Math.max(...products.map(p => parseInt(p.id) || 0), 0);
    const product: Product = {
      ...newProduct,
      id: (maxId + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    products.push(product);
    await saveProducts(products);
    
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

// PUT: Update an existing product
export async function PUT(request: NextRequest) {
  try {
    const updatedProduct: Product = await request.json();
    
    if (!updatedProduct.id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    const products = await getProducts();
    const productIndex = products.findIndex(p => p.id === updatedProduct.id);
    
    if (productIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Update product while preserving createdAt
    const product: Product = {
      ...updatedProduct,
      createdAt: products[productIndex].createdAt,
      updatedAt: new Date()
    };
    
    products[productIndex] = product;
    await saveProducts(products);
    
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a product
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');
    
    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    const products = await getProducts();
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    const deletedProduct = products.splice(productIndex, 1)[0];
    await saveProducts(products);
    
    return NextResponse.json({ success: true, data: deletedProduct });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}