const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('../models/Category');

const categories = [
  {
    name: 'Skincare',
    slug: 'skincare',
    description: 'Complete skincare solutions for all skin types including cleansers, serums, moisturizers, and treatments.',
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop',
    isActive: true,
    sortOrder: 1
  },
  {
    name: 'Makeup',
    slug: 'makeup',
    description: 'Premium makeup products for every occasion including foundations, lipsticks, eyeshadows, and more.',
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop',
    isActive: true,
    sortOrder: 2
  },
  {
    name: 'Hair Care',
    slug: 'hair-care',
    description: 'Professional hair care products for healthy, beautiful hair including shampoos, conditioners, and treatments.',
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400&h=400&fit=crop',
    isActive: true,
    sortOrder: 3
  },
  {
    name: 'Fragrance',
    slug: 'fragrance',
    description: 'Luxury fragrances and perfumes from top brands for men and women.',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop',
    isActive: true,
    sortOrder: 4
  },
  {
    name: 'Personal Care',
    slug: 'personal-care',
    description: 'Essential personal care products for daily hygiene and wellness.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
    isActive: true,
    sortOrder: 5
  }
];

async function seedCategories() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Insert new categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`Created ${createdCategories.length} categories:`);
    
    createdCategories.forEach(cat => {
      console.log(`- ${cat.name} (${cat.slug})`);
    });

    console.log('Categories seeded successfully!');
  } catch (error) {
    console.error('Error seeding categories:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seeder
seedCategories();