import { promises as fs } from 'fs';
import path from 'path';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  category: string;
  subcategory: string;
  brand: string;
  image: string;
  images: string[];
  inStock: boolean;
  stockCount: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Define categories and their details
const categories = {
  'Skincare': {
    brands: ['Lakme', 'The Ordinary', 'Neutrogena', 'CeraVe', 'La Roche-Posay', 'Paula\'s Choice', 'Drunk Elephant', 'Charlotte Tilbury', 'Olay', 'L\'Oreal Paris'],
    subcategories: ['Cleanser', 'Serum', 'Moisturizer', 'Sunscreen', 'Toner', 'Face Wash', 'Exfoliant', 'Mask', 'Eye Cream', 'Night Cream'],
    basePrice: 299,
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400'
    ]
  },
  'Makeup': {
    brands: ['Maybelline', 'MAC', 'Urban Decay', 'Rare Beauty', 'Fenty Beauty', 'NARS', 'Tarte', 'Too Faced', 'Benefit', 'Huda Beauty'],
    subcategories: ['Foundation', 'Concealer', 'Lipstick', 'Eyeshadow', 'Mascara', 'Blush', 'Brow', 'Highlighter', 'Lip Gloss', 'Primer'],
    basePrice: 599,
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400',
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400',
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400'
    ]
  },
  'Hair Care': {
    brands: ['Olaplex', 'L\'Oreal Professionnel', 'Schwarzkopf', 'Matrix', 'WOW Skin Science', 'Mamaearth', 'Dove', 'Tresemme', 'Herbal Essences', 'Kerastase'],
    subcategories: ['Shampoo', 'Conditioner', 'Hair Oil', 'Hair Serum', 'Hair Mask', 'Treatment', 'Styling Gel', 'Hair Spray', 'Leave-in Treatment', 'Scalp Care'],
    basePrice: 349,
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400'
    ]
  },
  'Fragrance': {
    brands: ['Calvin Klein', 'Dior', 'Chanel', 'Gucci', 'Versace', 'Hugo Boss', 'Burberry', 'Tom Ford', 'Paco Rabanne', 'Armaf'],
    subcategories: ['Eau de Parfum', 'Eau de Toilette', 'Body Mist', 'Cologne', 'Perfume Oil', 'Travel Size', 'Gift Set'],
    basePrice: 1299,
    images: [
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'
    ]
  },
  'Personal Care': {
    brands: ['Dove', 'Nivea', 'Himalaya', 'Mamaearth', 'Pears', 'Dettol', 'Lifebuoy', 'Palmolive', 'Colgate', 'Sensodyne'],
    subcategories: ['Body Wash', 'Soap', 'Deodorant', 'Toothpaste', 'Mouthwash', 'Hand Wash', 'Body Lotion', 'Body Scrub', 'Sanitizer', 'Wet Wipes'],
    basePrice: 149,
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
      'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400',
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400'
    ]
  }
};

// Product name templates for each category
const productNameTemplates = {
  'Skincare': [
    '{brand} {subcategory} for {skin_type} Skin',
    '{brand} Advanced {subcategory}',
    '{brand} {benefit} {subcategory}',
    '{brand} Professional {subcategory}',
    '{brand} Daily {subcategory}'
  ],
  'Makeup': [
    '{brand} {subcategory} - {shade}',
    '{brand} Professional {subcategory}',
    '{brand} Long-Lasting {subcategory}',
    '{brand} {finish} {subcategory}',
    '{brand} Waterproof {subcategory}'
  ],
  'Hair Care': [
    '{brand} {benefit} {subcategory}',
    '{brand} Professional {subcategory}',
    '{brand} {hair_type} Hair {subcategory}',
    '{brand} Repair & {benefit} {subcategory}',
    '{brand} Natural {subcategory}'
  ],
  'Fragrance': [
    '{brand} {scent_type} {subcategory}',
    '{brand} {collection} {subcategory}',
    '{brand} Signature {subcategory}',
    '{brand} Premium {subcategory}',
    '{brand} {time_of_day} {subcategory}'
  ],
  'Personal Care': [
    '{brand} {benefit} {subcategory}',
    '{brand} Gentle {subcategory}',
    '{brand} Antibacterial {subcategory}',
    '{brand} Natural {subcategory}',
    '{brand} Family {subcategory}'
  ]
};

const descriptionsTemplates = {
  'Skincare': [
    'A premium {subcategory} formulated for {skin_type} skin with advanced ingredients for visible results.',
    'Professional-grade {subcategory} that provides {benefit} while maintaining skin health.',
    'Gentle yet effective {subcategory} suitable for daily use with proven {benefit} properties.',
    'Clinically tested {subcategory} that delivers long-lasting {benefit} for healthier-looking skin.'
  ],
  'Makeup': [
    'High-pigment {subcategory} with {finish} finish that lasts all day without fading.',
    'Professional quality {subcategory} perfect for creating stunning looks with buildable coverage.',
    'Long-wearing {subcategory} that provides intense color payoff with comfortable wear.',
    'Premium {subcategory} formulated with skin-loving ingredients for flawless application.'
  ],
  'Hair Care': [
    'Nourishing {subcategory} specially formulated for {hair_type} hair with {benefit} properties.',
    'Professional salon-quality {subcategory} that transforms your hair with visible results.',
    'Gentle {subcategory} enriched with natural ingredients for healthy, beautiful hair.',
    'Advanced formula {subcategory} that repairs and protects hair from damage.'
  ],
  'Fragrance': [
    'A captivating {scent_type} fragrance with long-lasting scent that evolves throughout the day.',
    'Elegant {subcategory} featuring premium ingredients for a sophisticated scent experience.',
    'Luxurious fragrance perfect for {time_of_day} wear with excellent sillage and longevity.',
    'Signature scent that combines classic and modern notes for a unique olfactory journey.'
  ],
  'Personal Care': [
    'Gentle {subcategory} suitable for daily use with {benefit} properties for healthy skin.',
    'Dermatologically tested {subcategory} that provides effective care while being gentle on skin.',
    'Family-friendly {subcategory} with natural ingredients for safe and effective cleansing.',
    'Premium {subcategory} that combines effective cleansing with nourishing care.'
  ]
};

// Helper data for templates
const skinTypes = ['Normal', 'Oily', 'Dry', 'Sensitive', 'Combination'];
const benefits = ['Hydrating', 'Anti-Aging', 'Brightening', 'Smoothing', 'Nourishing', 'Rejuvenating'];
const finishes = ['Matte', 'Glossy', 'Satin', 'Shimmer', 'Natural'];
const shades = ['Rose', 'Berry', 'Coral', 'Nude', 'Classic Red', 'Pink', 'Brown'];
const hairTypes = ['Dry', 'Oily', 'Normal', 'Damaged', 'Curly', 'Straight'];
const scentTypes = ['Fresh', 'Floral', 'Woody', 'Oriental', 'Citrus', 'Spicy'];
const collections = ['Signature', 'Classic', 'Modern', 'Luxury', 'Sport'];
const timeOfDay = ['Day', 'Evening', 'Night', 'All-Day'];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateProductName(category: string, brand: string, subcategory: string): string {
  const templates = productNameTemplates[category as keyof typeof productNameTemplates];
  const template = getRandomElement(templates);
  
  return template
    .replace('{brand}', brand)
    .replace('{subcategory}', subcategory)
    .replace('{skin_type}', getRandomElement(skinTypes))
    .replace('{benefit}', getRandomElement(benefits))
    .replace('{finish}', getRandomElement(finishes))
    .replace('{shade}', getRandomElement(shades))
    .replace('{hair_type}', getRandomElement(hairTypes))
    .replace('{scent_type}', getRandomElement(scentTypes))
    .replace('{collection}', getRandomElement(collections))
    .replace('{time_of_day}', getRandomElement(timeOfDay));
}

function generateDescription(category: string, subcategory: string): string {
  const templates = descriptionsTemplates[category as keyof typeof descriptionsTemplates];
  const template = getRandomElement(templates);
  
  return template
    .replace('{subcategory}', subcategory.toLowerCase())
    .replace('{skin_type}', getRandomElement(skinTypes).toLowerCase())
    .replace('{benefit}', getRandomElement(benefits).toLowerCase())
    .replace('{finish}', getRandomElement(finishes).toLowerCase())
    .replace('{hair_type}', getRandomElement(hairTypes).toLowerCase())
    .replace('{scent_type}', getRandomElement(scentTypes).toLowerCase())
    .replace('{time_of_day}', getRandomElement(timeOfDay).toLowerCase());
}

function generateTags(category: string, subcategory: string, brand: string): string[] {
  const baseTags = [category.toLowerCase(), subcategory.toLowerCase(), brand.toLowerCase()];
  const additionalTags = [];
  
  if (category === 'Skincare') {
    additionalTags.push(...getRandomElement([
      ['anti-aging', 'wrinkle-care'],
      ['hydrating', 'moisturizing'],
      ['brightening', 'glow'],
      ['acne-treatment', 'blemish-control'],
      ['sensitive-skin', 'gentle']
    ]));
  } else if (category === 'Makeup') {
    additionalTags.push(...getRandomElement([
      ['long-lasting', 'waterproof'],
      ['matte', 'full-coverage'],
      ['natural', 'everyday'],
      ['professional', 'high-pigment'],
      ['cruelty-free', 'vegan']
    ]));
  } else if (category === 'Hair Care') {
    additionalTags.push(...getRandomElement([
      ['repair', 'damaged-hair'],
      ['volume', 'thickening'],
      ['smooth', 'frizz-control'],
      ['natural', 'organic'],
      ['salon-quality', 'professional']
    ]));
  }
  
  return [...baseTags, ...additionalTags];
}

async function generateProducts(count: number): Promise<Product[]> {
  const products: Product[] = [];
  const categoryNames = Object.keys(categories);
  const productsPerCategory = Math.floor(count / categoryNames.length);
  
  let idCounter = 1;
  
  for (const categoryName of categoryNames) {
    const categoryData = categories[categoryName as keyof typeof categories];
    
    for (let i = 0; i < productsPerCategory; i++) {
      const brand = getRandomElement(categoryData.brands);
      const subcategory = getRandomElement(categoryData.subcategories);
      const name = generateProductName(categoryName, brand, subcategory);
      const description = generateDescription(categoryName, subcategory);
      
      // Generate price with some variation
      const basePrice = categoryData.basePrice;
      const priceVariation = Math.random() * 0.6 + 0.7; // 0.7 to 1.3 multiplier
      const price = Math.round(basePrice * priceVariation);
      
      // 30% chance of having a discount
      let originalPrice: number | undefined;
      let discount: number | undefined;
      
      if (Math.random() < 0.3) {
        const discountPercent = Math.floor(Math.random() * 25) + 5; // 5-29% discount
        originalPrice = Math.round(price / (1 - discountPercent / 100));
        discount = discountPercent;
      }
      
      // Generate images
      const mainImage = getRandomElement(categoryData.images);
      const additionalImages = categoryData.images.filter(img => img !== mainImage).slice(0, 2);
      const images = [mainImage, ...additionalImages];
      
      // Generate ratings and reviews
      const rating = Math.round((Math.random() * 1.5 + 3.5) * 10) / 10; // 3.5 to 5.0
      const reviewCount = Math.floor(Math.random() * 500) + 50; // 50-549 reviews
      
      // Generate stock
      const stockCount = Math.floor(Math.random() * 100) + 10; // 10-109 stock
      
      const product: Product = {
        id: idCounter.toString(),
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
        tags: generateTags(categoryName, subcategory, brand),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      products.push(product);
      idCounter++;
    }
  }
  
  return products;
}

async function seedDatabase() {
  try {
    console.log('🌱 Generating products...');
    const products = await generateProducts(60);
    
    const dbPath = path.join(process.cwd(), 'src/data/products-db.json');
    
    console.log(`📝 Writing ${products.length} products to database...`);
    await fs.writeFile(dbPath, JSON.stringify(products, null, 2));
    
    console.log('✅ Database seeded successfully!');
    console.log(`📊 Generated ${products.length} products across ${Object.keys(categories).length} categories`);
    
    // Show breakdown by category
    const breakdown = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('\n📈 Products by category:');
    Object.entries(breakdown).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} products`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase, generateProducts };