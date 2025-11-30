import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Tenant from '../models/Tenant.js';
import connectDB from '../config/database.js';

dotenv.config();

const initSuperAdmin = async () => {
  try {
    await connectDB();

    // Check if SUPER_ADMIN already exists
    const existingSuperAdmin = await User.findOne({ role: 'SUPER_ADMIN' });
    if (existingSuperAdmin) {
      console.log('SUPER_ADMIN already exists');
      process.exit(0);
    }

    // Create a default tenant for SUPER_ADMIN
    const tenant = await Tenant.create({
      name: 'System Administration',
    });

    // Create SUPER_ADMIN user
    const superAdmin = await User.create({
      tenantId: tenant._id,
      email: 'admin@medicloud.com',
      password: 'admin123', // Change this in production!
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
    });

    console.log('SUPER_ADMIN created successfully!');
    console.log('Email: admin@medicloud.com');
    console.log('Password: admin123');
    console.log('⚠️  Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating SUPER_ADMIN:', error);
    process.exit(1);
  }
};

initSuperAdmin();

