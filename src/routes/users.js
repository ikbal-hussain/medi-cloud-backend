import express from 'express';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { authorize, checkTenantAccess } from '../middleware/rbac.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all users (HOSPITAL_ADMIN and SUPER_ADMIN only)
router.get('/', authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN'), checkTenantAccess, async (req, res) => {
  try {
    const query = {};
    
    // SUPER_ADMIN can see all users, others only their tenant
    if (req.user.role !== 'SUPER_ADMIN') {
      query.tenantId = req.tenantId;
    }

    const users = await User.find(query).populate('tenantId', 'name').select('-password');
    res.json(users.map(user => ({
      id: user._id.toString(),
      tenantId: user.tenantId._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single user
router.get('/:id', authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN'), checkTenantAccess, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('tenantId', 'name');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check tenant access
    if (req.user.role !== 'SUPER_ADMIN' && user.tenantId._id.toString() !== req.tenantId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      id: user._id.toString(),
      tenantId: user.tenantId._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create user (HOSPITAL_ADMIN and SUPER_ADMIN only)
router.post('/', authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN'), checkTenantAccess, async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate role
    const validRoles = ['HOSPITAL_ADMIN', 'DOCTOR', 'RECEPTIONIST'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // SUPER_ADMIN can create users for any tenant, others only their tenant
    const tenantId = req.user.role === 'SUPER_ADMIN' && req.body.tenantId 
      ? req.body.tenantId 
      : req.tenantId;

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = await User.create({
      tenantId,
      email,
      password,
      name,
      role,
    });

    res.status(201).json({
      id: user._id.toString(),
      tenantId: user.tenantId.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user (HOSPITAL_ADMIN and SUPER_ADMIN only)
router.put('/:id', authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN'), checkTenantAccess, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check tenant access
    if (req.user.role !== 'SUPER_ADMIN' && user.tenantId.toString() !== req.tenantId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { email, name, role, password } = req.body;
    if (email) user.email = email;
    if (name) user.name = name;
    if (role) {
      const validRoles = ['HOSPITAL_ADMIN', 'DOCTOR', 'RECEPTIONIST'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }
      user.role = role;
    }
    if (password) user.password = password;

    await user.save();

    res.json({
      id: user._id.toString(),
      tenantId: user.tenantId.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user (HOSPITAL_ADMIN and SUPER_ADMIN only)
router.delete('/:id', authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN'), checkTenantAccess, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check tenant access
    if (req.user.role !== 'SUPER_ADMIN' && user.tenantId.toString() !== req.tenantId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Prevent self-deletion
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

