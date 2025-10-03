const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

async function getUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const users = await User.find({}).select('+password');
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`Email: ${user.email}, Role: ${user.role}, Active: ${user.isActive}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

getUsers();