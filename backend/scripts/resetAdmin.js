const mongoose = require('mongoose');
const readline = require('readline');
require('dotenv').config();

const User = require('../models/User');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function resetAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const name = await question('Enter admin name: ');
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');

    // Delete existing admin with same email
    await User.deleteOne({ email });
    console.log('Deleted existing user with this email');

    // Create new admin
    const admin = await User.create({
      name,
      email,
      password,
      role: 'admin'
    });

    console.log('\nAdmin created successfully:');
    console.log('Email:', email);
    console.log('Password:', password);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    rl.close();
    await mongoose.connection.close();
  }
}

resetAdmin();