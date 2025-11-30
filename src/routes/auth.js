import express from 'express';
import User from '../models/User.js';
import Tenant from '../models/Tenant.js';
import { generateToken } from '../utils/jwt.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Register new hospital
router.post('/register', async (req, res) => {
  try {
    const { hospitalName, adminEmail, adminName, password } = req.body;

    if (!hospitalName || !adminEmail || !adminName || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create tenant
    const tenant = await Tenant.create({ name: hospitalName });

    // Create admin user
    const user = await User.create({
      tenantId: tenant._id,
      email: adminEmail,
      password,
      name: adminName,
      role: 'HOSPITAL_ADMIN',
    });

    const token = generateToken({ userId: user._id.toString() });

    res.status(201).json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: tenant._id.toString(),
      },
      tenant: {
        id: tenant._id.toString(),
        name: tenant.name,
        createdAt: tenant.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).populate('tenantId');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({ userId: user._id.toString() });

    res.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId._id.toString(),
      },
      tenant: {
        id: user.tenantId._id.toString(),
        name: user.tenantId.name,
        createdAt: user.tenantId.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('tenantId');
    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId._id.toString(),
      },
      tenant: {
        id: user.tenantId._id.toString(),
        name: user.tenantId.name,
        createdAt: user.tenantId.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

