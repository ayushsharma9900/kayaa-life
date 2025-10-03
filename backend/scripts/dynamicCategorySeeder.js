const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('../models/Category');
const Product = require('../models/Product');

// Dynamic category definitions with subcategories
const categoryDefinitions = {
  'Skincare': {
    description: 'Complete skincare solutions for all skin types',
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop',
    subcategories: ['Face Wash', 'Moisturizer', 'Serum', 'Sunscreen', 'Toner', 'Face Mask']
  },
  'Makeup': {
    description: 'Premium makeup products for every occasion',
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop',
    subcategories: ['Foundation', 'Lipstick', 'Eyeshadow', 'Mascara', 'Blush', 'Concealer']
  },
  'Hair Care': {
    description: 'Professional hair care products for healthy hair',
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400&h=400&fit=crop',
    subcategories: ['Shampoo', 'Conditioner', 'Hair Oil', 'Hair Mask', 'Hair Serum', 'Styling']
  },
  'Fragrance': {
    description: 'Luxury fragrances and perfumes from top brands',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop',
    subcategories: ['Perfume', 'Body Spray', 'Deodorant', 'Cologne']
  },
  'Personal Care': {
    description: 'Essential personal care products for daily wellness',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
    subcategories: ['Body Wash', 'Body Lotion', 'Hand Cream', 'Foot Care', 'Oral Care']
  }
};

async function createDynamicCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get existing product categories to understand what's needed
    const existingProductCategories = await Product.distinct('category');
    console.log('Found product categories:', existingProductCategories);

    let createdCount = 0;
    let updatedCount = 0;
    let subcategoryCount = 0;

    // Process each category definition
    for (const [categoryName, config] of Object.entries(categoryDefinitions)) {
      // Check if main category exists
      let mainCategory = await Category.findOne({ 
        name: categoryName, 
        parentId: null 
      });

      if (!mainCategory) {
        // Create main category
        mainCategory = await Category.create({
          name: categoryName,
          slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
          description: config.description,
          image: config.image,
          isActive: true,
          sortOrder: Object.keys(categoryDefinitions).indexOf(categoryName) + 1
        });
        createdCount++;
        console.log(`✓ Created main category: ${categoryName}`);
      } else {
        // Update existing category if needed
        if (!mainCategory.image || !mainCategory.description) {
          await Category.findByIdAndUpdate(mainCategory._id, {
            description: config.description,
            image: config.image
          });
          updatedCount++;
          console.log(`✓ Updated main category: ${categoryName}`);
        }
      }

      // Process subcategories - ensure no duplicates
      const existingSubcategories = await Category.find({
        parentId: mainCategory._id
      });
      
      const existingSubNames = existingSubcategories.map(sub => sub.name);

      for (const subName of config.subcategories) {
        if (!existingSubNames.includes(subName)) {
          await Category.create({
            name: subName,
            slug: subName.toLowerCase().replace(/\s+/g, '-'),
            description: `${subName} products in ${categoryName}`,
            parentId: mainCategory._id,
            isActive: true,
            sortOrder: config.subcategories.indexOf(subName) + 1
          });
          subcategoryCount++;
          console.log(`  ✓ Created subcategory: ${subName} under ${categoryName}`);
        }
      }
    }

    // Create categories for any orphaned products
    for (const productCategory of existingProductCategories) {
      if (!Object.keys(categoryDefinitions).includes(productCategory)) {
        const existingCategory = await Category.findOne({ 
          name: productCategory, 
          parentId: null 
        });
        
        if (!existingCategory) {
          await Category.create({
            name: productCategory,
            slug: productCategory.toLowerCase().replace(/\s+/g, '-'),
            description: `${productCategory} products and accessories`,
            isActive: true,
            sortOrder: 999 // Put at end
          });
          createdCount++;
          console.log(`✓ Created category for existing products: ${productCategory}`);
        }
      }
    }

    console.log('\n=== Dynamic Category Creation Complete ===');
    console.log(`Main categories created: ${createdCount}`);
    console.log(`Main categories updated: ${updatedCount}`);
    console.log(`Subcategories created: ${subcategoryCount}`);
    console.log('All categories are now properly organized!');

  } catch (error) {
    console.error('Error in dynamic category creation:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Function to clean up duplicate subcategories
async function cleanupDuplicateSubcategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Starting subcategory cleanup...');

    const duplicates = await Category.aggregate([
      {
        $match: { parentId: { $ne: null } }
      },
      {
        $group: {
          _id: { name: '$name', parentId: '$parentId' },
          count: { $sum: 1 },
          docs: { $push: '$_id' }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);

    let removedCount = 0;
    for (const duplicate of duplicates) {
      // Keep the first one, remove the rest
      const toRemove = duplicate.docs.slice(1);
      await Category.deleteMany({ _id: { $in: toRemove } });
      removedCount += toRemove.length;
      console.log(`Removed ${toRemove.length} duplicate subcategories for: ${duplicate._id.name}`);
    }

    console.log(`Cleanup complete. Removed ${removedCount} duplicate subcategories.`);
  } catch (error) {
    console.error('Error cleaning up duplicates:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Run the appropriate function based on command line argument
const command = process.argv[2];

if (command === 'cleanup') {
  cleanupDuplicateSubcategories();
} else {
  createDynamicCategories();
}