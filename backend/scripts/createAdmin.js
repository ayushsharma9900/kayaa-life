const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@kaayalife.com';
    const adminPassword = 'admin123';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user (password will be hashed by pre-save middleware)
    const admin = await User.create({
      name: 'Admin User',
      email: adminEmail,
      password: adminPassword,
      role: 'admin'
    });

    console.log('Admin user created successfully:');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('Role:', admin.role);

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await mongoose.connection.close();
  }
}

createAdmin();