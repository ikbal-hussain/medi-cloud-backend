import express from 'express';
import Patient from '../models/Patient.js';
import { authenticate } from '../middleware/auth.js';
import { authorize, checkTenantAccess } from '../middleware/rbac.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all patients
router.get('/', checkTenantAccess, async (req, res) => {
  try {
    const query = {};
    
    // SUPER_ADMIN can see all patients, others only their tenant
    if (req.user.role !== 'SUPER_ADMIN') {
      query.tenantId = req.tenantId;
    } else if (req.query.tenantId) {
      query.tenantId = req.query.tenantId;
    }

    const patients = await Patient.find(query).sort({ createdAt: -1 });
    res.json(patients.map(patient => ({
      id: patient._id.toString(),
      tenantId: patient.tenantId.toString(),
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      type: patient.type,
      phoneNumber: patient.phoneNumber,
      address: patient.address,
      admissionDate: patient.admissionDate,
      status: patient.status,
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single patient
router.get('/:id', checkTenantAccess, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Check tenant access
    if (req.user.role !== 'SUPER_ADMIN' && patient.tenantId.toString() !== req.tenantId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      id: patient._id.toString(),
      tenantId: patient.tenantId.toString(),
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      type: patient.type,
      phoneNumber: patient.phoneNumber,
      address: patient.address,
      admissionDate: patient.admissionDate,
      status: patient.status,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create patient
router.post('/', checkTenantAccess, async (req, res) => {
  try {
    const { name, age, gender, type, phoneNumber, address, admissionDate, status } = req.body;

    if (!name || !age || !gender || !type || !phoneNumber || !address || !admissionDate) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // SUPER_ADMIN can create patients for any tenant, others only their tenant
    const tenantId = req.user.role === 'SUPER_ADMIN' && req.body.tenantId 
      ? req.body.tenantId 
      : req.tenantId;

    const patient = await Patient.create({
      tenantId,
      name,
      age,
      gender,
      type,
      phoneNumber,
      address,
      admissionDate: new Date(admissionDate),
      status: status || 'Active',
    });

    res.status(201).json({
      id: patient._id.toString(),
      tenantId: patient.tenantId.toString(),
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      type: patient.type,
      phoneNumber: patient.phoneNumber,
      address: patient.address,
      admissionDate: patient.admissionDate,
      status: patient.status,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update patient
router.put('/:id', checkTenantAccess, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Check tenant access
    if (req.user.role !== 'SUPER_ADMIN' && patient.tenantId.toString() !== req.tenantId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { name, age, gender, type, phoneNumber, address, admissionDate, status } = req.body;
    if (name) patient.name = name;
    if (age !== undefined) patient.age = age;
    if (gender) patient.gender = gender;
    if (type) patient.type = type;
    if (phoneNumber) patient.phoneNumber = phoneNumber;
    if (address) patient.address = address;
    if (admissionDate) patient.admissionDate = new Date(admissionDate);
    if (status) patient.status = status;

    await patient.save();

    res.json({
      id: patient._id.toString(),
      tenantId: patient.tenantId.toString(),
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      type: patient.type,
      phoneNumber: patient.phoneNumber,
      address: patient.address,
      admissionDate: patient.admissionDate,
      status: patient.status,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete patient
router.delete('/:id', authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'RECEPTIONIST'), checkTenantAccess, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Check tenant access
    if (req.user.role !== 'SUPER_ADMIN' && patient.tenantId.toString() !== req.tenantId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Patient.findByIdAndDelete(req.params.id);
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

