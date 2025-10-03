const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('../models/Category');

const subcategories = {
  'Skincare': [
    { name: 'Face Wash', slug: 'face-wash' },
    { name: 'Moisturizer', slug: 'moisturizer' },
    { name: 'Serum', slug: 'serum' },
    { name: 'Sunscreen', slug: 'sunscreen' }
  ],
  'Makeup': [
    { name: 'Foundation', slug: 'foundation' },
    { name: 'Lipstick', slug: 'lipstick' },
    { name: 'Eyeshadow', slug: 'eyeshadow' },
    { name: 'Mascara', slug: 'mascara' }
  ],
  'Hair Care': [
    { name: 'Shampoo', slug: 'shampoo' },
    { name: 'Conditioner', slug: 'conditioner' },
    { name: 'Hair Oil', slug: 'hair-oil' },
    { name: 'Hair Mask', slug: 'hair-mask' }
  ]
};

async function seedSubcategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const [parentName, subs] of Object.entries(subcategories)) {
      const parent = await Category.findOne({ name: parentName });
      if (!parent) continue;

      for (const sub of subs) {
        const existing = await Category.findOne({ 
          name: sub.name, 
          parentId: parent._id 
        });
        
        if (!existing) {
          await Category.create({
            name: sub.name,
            slug: sub.slug,
            description: `${sub.name} products in ${parentName}`,
            parentId: parent._id,
            isActive: true
          });
          console.log(`Created subcategory: ${sub.name} under ${parentName}`);
        }
      }
    }

    console.log('Subcategories seeded successfully!');
  } catch (error) {
    console.error('Error seeding subcategories:', error);
  } finally {
    await mongoose.connection.close();
  }
}

seedSubcategories();