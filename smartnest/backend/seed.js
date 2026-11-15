const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const User = require('./models/User');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartnest');
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: 'maintenance@smartnest.com' });
    if (existing) {
      console.log('Maintenance user already exists. Skipping seed.');
      await mongoose.disconnect();
      return;
    }

    await User.create({
      name: 'Maintenance Staff',
      email: 'maintenance@smartnest.com',
      password: 'Maintenance@123',
      role: 'maintenance',
    });

    console.log('✅ Maintenance user seeded: maintenance@smartnest.com / Maintenance@123');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
