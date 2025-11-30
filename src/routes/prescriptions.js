import express from 'express';
import Prescription from '../models/Prescription.js';
import { authenticate } from '../middleware/auth.js';
import { authorize, checkTenantAccess } from '../middleware/rbac.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all prescriptions
router.get('/', checkTenantAccess, async (req, res) => {
  try {
    const query = {};
    
    // SUPER_ADMIN can see all prescriptions, others only their tenant
    if (req.user.role !== 'SUPER_ADMIN') {
      query.tenantId = req.tenantId;
    } else if (req.query.tenantId) {
      query.tenantId = req.query.tenantId;
    }

    // Filter by patient if provided
    if (req.query.patientId) {
      query.patientId = req.query.patientId;
    }

    // Filter by doctor if provided
    if (req.query.doctorId) {
      query.doctorId = req.query.doctorId;
    }

    const prescriptions = await Prescription.find(query)
      .populate('patientId', 'name')
      .populate('doctorId', 'name')
      .sort({ createdAt: -1 });

    res.json(prescriptions.map(prescription => ({
      id: prescription._id.toString(),
      tenantId: prescription.tenantId.toString(),
      patientId: prescription.patientId._id.toString(),
      doctorId: prescription.doctorId._id.toString(),
      medications: prescription.medications,
      diagnosis: prescription.diagnosis,
      notes: prescription.notes,
      createdAt: prescription.createdAt ? new Date(prescription.createdAt).toISOString() : new Date().toISOString(),
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single prescription
router.get('/:id', checkTenantAccess, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patientId', 'name')
      .populate('doctorId', 'name');
    
    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    // Check tenant access
    if (req.user.role !== 'SUPER_ADMIN' && prescription.tenantId.toString() !== req.tenantId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      id: prescription._id.toString(),
      tenantId: prescription.tenantId.toString(),
      patientId: prescription.patientId._id.toString(),
      doctorId: prescription.doctorId._id.toString(),
      medications: prescription.medications,
      diagnosis: prescription.diagnosis,
      notes: prescription.notes,
      createdAt: prescription.createdAt ? new Date(prescription.createdAt).toISOString() : new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create prescription (DOCTOR only)
router.post('/', authorize('DOCTOR', 'SUPER_ADMIN'), checkTenantAccess, async (req, res) => {
  try {
    const { patientId, medications, diagnosis, notes } = req.body;

    if (!patientId || !medications || !diagnosis) {
      return res.status(400).json({ error: 'Patient ID, medications, and diagnosis are required' });
    }

    // SUPER_ADMIN can create prescriptions for any tenant, others only their tenant
    const tenantId = req.user.role === 'SUPER_ADMIN' && req.body.tenantId 
      ? req.body.tenantId 
      : req.tenantId;

    // Use current user as doctor if not SUPER_ADMIN
    const doctorId = req.user.role === 'SUPER_ADMIN' && req.body.doctorId 
      ? req.body.doctorId 
      : req.user._id;

    const prescription = await Prescription.create({
      tenantId,
      patientId,
      doctorId,
      medications,
      diagnosis,
      notes: notes || '',
    });

    const populated = await Prescription.findById(prescription._id)
      .populate('patientId', 'name')
      .populate('doctorId', 'name');

    res.status(201).json({
      id: populated._id.toString(),
      tenantId: populated.tenantId.toString(),
      patientId: populated.patientId._id.toString(),
      doctorId: populated.doctorId._id.toString(),
      medications: populated.medications,
      diagnosis: populated.diagnosis,
      notes: populated.notes,
      createdAt: populated.createdAt ? new Date(populated.createdAt).toISOString() : new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update prescription (DOCTOR only, or the doctor who created it)
router.put('/:id', authorize('DOCTOR', 'SUPER_ADMIN'), checkTenantAccess, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    
    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    // Check tenant access
    if (req.user.role !== 'SUPER_ADMIN' && prescription.tenantId.toString() !== req.tenantId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Doctors can only update their own prescriptions
    if (req.user.role === 'DOCTOR' && prescription.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only update your own prescriptions' });
    }

    const { medications, diagnosis, notes } = req.body;
    if (medications) prescription.medications = medications;
    if (diagnosis) prescription.diagnosis = diagnosis;
    if (notes !== undefined) prescription.notes = notes;

    await prescription.save();

    const populated = await Prescription.findById(prescription._id)
      .populate('patientId', 'name')
      .populate('doctorId', 'name');

    res.json({
      id: populated._id.toString(),
      tenantId: populated.tenantId.toString(),
      patientId: populated.patientId._id.toString(),
      doctorId: populated.doctorId._id.toString(),
      medications: populated.medications,
      diagnosis: populated.diagnosis,
      notes: populated.notes,
      createdAt: populated.createdAt ? new Date(populated.createdAt).toISOString() : new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete prescription (DOCTOR and HOSPITAL_ADMIN only)
router.delete('/:id', authorize('DOCTOR', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'), checkTenantAccess, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    
    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    // Check tenant access
    if (req.user.role !== 'SUPER_ADMIN' && prescription.tenantId.toString() !== req.tenantId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Doctors can only delete their own prescriptions
    if (req.user.role === 'DOCTOR' && prescription.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only delete your own prescriptions' });
    }

    await Prescription.findByIdAndDelete(req.params.id);
    res.json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

