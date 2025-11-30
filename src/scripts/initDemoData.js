import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Tenant from '../models/Tenant.js';
import Patient from '../models/Patient.js';
import Prescription from '../models/Prescription.js';
import connectDB from '../config/database.js';

dotenv.config();

const initDemoData = async () => {
  try {
    await connectDB();

    // Clear existing demo data (optional - comment out if you want to keep existing data)
    console.log('Clearing existing demo data...');
    await Patient.deleteMany({});
    await Prescription.deleteMany({});
    await User.deleteMany({});
    await Tenant.deleteMany({});

    // Create Demo Hospital 1: City Hospital
    const tenant1 = await Tenant.create({
      name: 'City Hospital',
    });

    const admin1 = await User.create({
      tenantId: tenant1._id,
      email: 'admin@city.com',
      password: 'admin123',
      name: 'Dr. Sarah Admin',
      role: 'HOSPITAL_ADMIN',
    });

    const doctor1 = await User.create({
      tenantId: tenant1._id,
      email: 'doc@city.com',
      password: 'doc123',
      name: 'Dr. John Smith',
      role: 'DOCTOR',
    });

    const receptionist1 = await User.create({
      tenantId: tenant1._id,
      email: 'nurse@city.com',
      password: 'nurse123',
      name: 'Nurse Emily Brown',
      role: 'RECEPTIONIST',
    });

    // Create Demo Hospital 2: Galaxy Care
    const tenant2 = await Tenant.create({
      name: 'Galaxy Care',
    });

    const admin2 = await User.create({
      tenantId: tenant2._id,
      email: 'admin@galaxy.com',
      password: 'admin123',
      name: 'Dr. Michael Chen',
      role: 'HOSPITAL_ADMIN',
    });

    // Create some demo patients for City Hospital
    const patient1 = await Patient.create({
      tenantId: tenant1._id,
      name: 'Robert Johnson',
      age: 45,
      gender: 'Male',
      type: 'OPD',
      phoneNumber: '555-0101',
      address: '123 Main St, City',
      admissionDate: new Date(),
      status: 'Active',
    });

    const patient2 = await Patient.create({
      tenantId: tenant1._id,
      name: 'Mary Williams',
      age: 32,
      gender: 'Female',
      type: 'IPD',
      phoneNumber: '555-0102',
      address: '456 Oak Ave, City',
      admissionDate: new Date(),
      status: 'Active',
    });

    const patient3 = await Patient.create({
      tenantId: tenant1._id,
      name: 'James Davis',
      age: 67,
      gender: 'Male',
      type: 'IPD',
      phoneNumber: '555-0103',
      address: '789 Pine Rd, City',
      admissionDate: new Date(),
      status: 'Active',
    });

    // Create a demo prescription
    await Prescription.create({
      tenantId: tenant1._id,
      patientId: patient1._id,
      doctorId: doctor1._id,
      medications: 'Amoxicillin 500mg - 3 times daily for 7 days\nParacetamol 500mg - as needed for fever',
      diagnosis: 'Acute Bronchitis',
      notes: 'Patient should rest and drink plenty of fluids. Follow up in 7 days if symptoms persist.',
    });

    console.log('\n✅ Demo data created successfully!\n');
    console.log('=== DEMO CREDENTIALS ===\n');
    
    console.log('🏥 CITY HOSPITAL:');
    console.log('  Admin:');
    console.log('    Email: admin@city.com');
    console.log('    Password: admin123');
    console.log('  Doctor:');
    console.log('    Email: doc@city.com');
    console.log('    Password: doc123');
    console.log('  Receptionist:');
    console.log('    Email: nurse@city.com');
    console.log('    Password: nurse123');
    console.log('\n🏥 GALAXY CARE:');
    console.log('  Admin:');
    console.log('    Email: admin@galaxy.com');
    console.log('    Password: admin123');
    console.log('\n📊 Demo Data:');
    console.log(`  - 2 Hospitals (Tenants)`);
    console.log(`  - 4 Users (1 Admin, 1 Doctor, 1 Receptionist, 1 Admin)`);
    console.log(`  - 3 Patients`);
    console.log(`  - 1 Prescription`);
    console.log('\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating demo data:', error);
    process.exit(1);
  }
};

initDemoData();

