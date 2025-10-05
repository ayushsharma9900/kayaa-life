import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Product } from '@/types';

const DB_PATH = path.join(process.cwd(), 'src/data/products-db.json');

// Read products from database
async function getProducts(): Promise<Product[]> {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Write products to database
async function saveProducts(products: Product[]): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(products, null, 2));
}

// Generate realistic beauty products data
function generateBeautyProducts(count: number): Product[] {
  const categories = {
    'Skincare': {
      brands: ['The Ordinary', 'CeraVe', 'Neutrogena', 'Olay', 'L\'Oreal Paris', 'Garnier', 'Plum', 'Minimalist', 'Dot & Key', 'Mamaearth'],
      subcategories: ['Face Serum', 'Night Cream', 'Day Cream', 'Sunscreen', 'Face Wash', 'Cleanser', 'Toner', 'Face Mask', 'Eye Cream', 'Moisturizer'],
      basePrice: 399,
      images: [
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
        'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400'
      ]
    },
    'Makeup': {
      brands: ['Maybelline', 'L\'Oreal Paris', 'Lakme', 'Revlon', 'Colorbar', 'NYX', 'Sugar Cosmetics', 'Faces Canada', 'Blue Heaven', 'Insight Cosmetics'],
      subcategories: ['Lipstick', 'Foundation', 'Concealer', 'Mascara', 'Eyeliner', 'Eyeshadow Palette', 'Blush', 'Compact Powder', 'Lip Gloss', 'Kajal'],
      basePrice: 299,
      images: [
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400',
        'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400',
        'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400'
      ]
    },
    'Hair Care': {
      brands: ['L\'Oreal Paris', 'Head & Shoulders', 'Pantene', 'Herbal Essences', 'Dove', 'Matrix', 'Schwarzkopf', 'Tresemme', 'Sunsilk', 'WOW'],
      subcategories: ['Shampoo', 'Conditioner', 'Hair Oil', 'Hair Serum', 'Hair Mask', 'Hair Spray', 'Hair Gel', 'Leave-in Conditioner', 'Dry Shampoo', 'Hair Color'],
      basePrice: 249,
      images: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400',
        'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400'
      ]
    },
    'Fragrance': {
      brands: ['Fogg', 'Wild Stone', 'Engage', 'Axe', 'Denver', 'Park Avenue', 'Set Wet', 'Bella Vita', 'Bombay Shaving Company', 'The Man Company'],
      subcategories: ['Body Spray', 'Deodorant', 'Perfume', 'Eau de Toilette', 'Body Mist', 'Cologne', 'Aftershave', 'Roll-on'],
      basePrice: 199,
      images: [
        'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400',
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400'
      ]
    },
    'Personal Care': {
      brands: ['Nivea', 'Dove', 'Johnson\'s', 'Vaseline', 'Ponds', 'Fair & Lovely', 'Himalaya', 'Biotique', 'Lotus', 'Vicco'],
      subcategories: ['Body Lotion', 'Face Cream', 'Hand Cream', 'Body Wash', 'Soap', 'Face Wash', 'Scrub', 'Body Oil', 'Talcum Powder', 'Cold Cream'],
      basePrice: 149,
      images: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400'
      ]
    },
    'Men\'s Grooming': {
      brands: ['Gillette', 'Bombay Shaving Company', 'The Man Company', 'Ustraa', 'Beardo', 'Park Avenue', 'Old Spice', 'Axe', 'Wild Stone', 'Set Wet'],
      subcategories: ['Beard Oil', 'Aftershave', 'Shaving Cream', 'Face Wash', 'Hair Wax', 'Face Moisturizer', 'Beard Wash', 'Hair Gel', 'Cologne', 'Body Spray'],
      basePrice: 299,
      images: [
        'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400',
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400'
      ]
    },
    'Nail Care': {
      brands: ['Colorbar', 'Lakme', 'Maybelline', 'Sugar Cosmetics', 'Faces Canada', 'Elle 18', 'Insight', 'Blue Heaven', 'Lotus', 'Revlon'],
      subcategories: ['Nail Polish', 'Nail Art Kit', 'Base Coat', 'Top Coat', 'Nail Remover', 'Cuticle Oil', 'Nail File', 'French Manicure Kit'],
      basePrice: 99,
      images: [
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400',
        'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400'
      ]
    },
    'Baby Care': {
      brands: ['Johnson\'s Baby', 'Himalaya Baby', 'Sebamed Baby', 'Chicco', 'Mamaearth', 'Pigeon', 'Cetaphil Baby', 'Aveeno Baby', 'Mustela', 'Dabur Baby'],
      subcategories: ['Baby Oil', 'Baby Lotion', 'Baby Shampoo', 'Baby Soap', 'Baby Powder', 'Diaper Rash Cream', 'Baby Wipes', 'Baby Sunscreen'],
      basePrice: 199,
      images: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400'
      ]
    }
  };

  const products: Product[] = [];
  const categoryNames = Object.keys(categories);
  const productsPerCategory = Math.ceil(count / categoryNames.length);

  // Common Indian beauty product descriptions and features
  const features = {
    'Skincare': ['Anti-aging', 'Hydrating', 'Brightening', 'Oil-free', 'Non-comedogenic', 'Dermatologist tested', 'For sensitive skin', 'SPF protection'],
    'Makeup': ['Long-lasting', 'Waterproof', 'Smudge-proof', 'High pigment', 'Matte finish', 'Glossy finish', 'Transfer-proof', 'Easy to blend'],
    'Hair Care': ['Anti-dandruff', 'For dry hair', 'For oily hair', 'Strengthening', 'Shine enhancing', 'Frizz control', 'Color protection', 'Damage repair'],
    'Fragrance': ['Long-lasting', '24-hour protection', 'Fresh scent', 'Masculine', 'Feminine', 'Unisex', 'Alcohol-free', 'Skin-friendly'],
    'Personal Care': ['For all skin types', 'Natural ingredients', 'Gentle formula', 'Quick absorption', 'Non-greasy', 'Dermatologist recommended', 'Ayurvedic', 'Herbal'],
    'Men\'s Grooming': ['For sensitive skin', 'Quick-drying', 'Non-sticky', 'Strong hold', 'Natural finish', 'Alcohol-free', 'Paraben-free', 'Dermatologist tested'],
    'Nail Care': ['Chip-resistant', 'Quick-dry', 'High shine', 'Long-lasting', 'Easy application', 'Salon quality', 'Vibrant color', 'Streak-free'],
    'Baby Care': ['Tear-free', 'Hypoallergenic', 'Clinically proven', 'Pediatrician tested', 'No harmful chemicals', 'Gentle formula', 'Natural ingredients', 'pH balanced']
  };

  let currentId = 1;

  for (const categoryName of categoryNames) {
    const categoryData = categories[categoryName as keyof typeof categories];
    
    for (let i = 0; i < productsPerCategory && products.length < count; i++) {
      const brand = categoryData.brands[Math.floor(Math.random() * categoryData.brands.length)];
      const subcategory = categoryData.subcategories[Math.floor(Math.random() * categoryData.subcategories.length)];
      const feature = features[categoryName as keyof typeof features][Math.floor(Math.random() * features[categoryName as keyof typeof features].length)];
      
      // Generate realistic product names
      const productNames = [
        `${brand} ${feature} ${subcategory}`,
        `${brand} ${subcategory} - ${feature}`,
        `${brand} Professional ${subcategory}`,
        `${brand} ${subcategory} for Daily Use`,
        `${brand} Advanced ${subcategory}`
      ];
      
      const name = productNames[Math.floor(Math.random() * productNames.length)];
      
      // Generate realistic descriptions
      const descriptions = [
        `Premium ${subcategory.toLowerCase()} with ${feature.toLowerCase()} properties. Perfect for daily use with visible results.`,
        `${feature} ${subcategory.toLowerCase()} formulated with advanced ingredients for optimal performance and comfort.`,
        `Professional-grade ${subcategory.toLowerCase()} that delivers long-lasting ${feature.toLowerCase()} benefits for healthy skin.`,
        `Clinically tested ${subcategory.toLowerCase()} with ${feature.toLowerCase()} formula, suitable for all skin types.`
      ];
      
      const description = descriptions[Math.floor(Math.random() * descriptions.length)];
      
      // Realistic Indian pricing
      const basePrice = categoryData.basePrice;
      const priceVariation = Math.random() * 0.8 + 0.6; // 0.6 to 1.4 multiplier
      const price = Math.round(basePrice * priceVariation);
      
      // Random discounts (40% chance)
      let originalPrice: number | undefined;
      let discount: number | undefined;
      
      if (Math.random() < 0.4) {
        const discountPercent = Math.floor(Math.random() * 30) + 10; // 10-39% discount
        originalPrice = Math.round(price / (1 - discountPercent / 100));
        discount = discountPercent;
      }
      
      // Images
      const mainImage = categoryData.images[Math.floor(Math.random() * categoryData.images.length)];
      const images = [mainImage, ...categoryData.images.filter(img => img !== mainImage).slice(0, 2)];
      
      // Ratings and reviews (realistic for Indian market)
      const rating = Math.round((Math.random() * 1.5 + 3.5) * 10) / 10; // 3.5 to 5.0
      const reviewCount = Math.floor(Math.random() * 1000) + 50; // 50-1049 reviews
      
      // Stock
      const stockCount = Math.floor(Math.random() * 200) + 20; // 20-219 stock
      
      // Tags
      const tags = [
        categoryName.toLowerCase(),
        subcategory.toLowerCase().replace(/\s+/g, '-'),
        brand.toLowerCase().replace(/[^a-z0-9]/g, ''),
        feature.toLowerCase().replace(/\s+/g, '-'),
        'beauty',
        'cosmetics'
      ];
      
      const product: Product = {
        id: (currentId + 1000).toString(), // Start from 1001 to avoid conflicts
        name,
        description,
        price,
        originalPrice,
        discount,
        category: categoryName,
        subcategory,
        brand,
        image: mainImage,
        images,
        inStock: stockCount > 0,
        stockCount,
        rating,
        reviewCount,
        tags: tags.filter((tag, index, self) => self.indexOf(tag) === index), // Remove duplicates
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      products.push(product);
      currentId++;
    }
  }
  
  return products;
}

// POST: Import products
export async function POST(request: NextRequest) {
  try {
    const { source, count = 50 } = await request.json();
    
    console.log(`Importing ${count} products from ${source}...`);
    
    // Get existing products
    const existingProducts = await getProducts();
    
    // Generate new products
    const newProducts = generateBeautyProducts(count);
    
    // Combine with existing products
    const allProducts = [...existingProducts, ...newProducts];
    
    // Save to database
    await saveProducts(allProducts);
    
    return NextResponse.json({
      success: true,
      message: `Successfully imported ${newProducts.length} products`,
      data: {
        imported: newProducts.length,
        total: allProducts.length,
        source: source,
        products: newProducts.slice(0, 5) // Return first 5 as preview
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error importing products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to import products' },
      { status: 500 }
    );
  }
}