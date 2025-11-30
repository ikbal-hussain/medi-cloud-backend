import express from 'express';
import Tenant from '../models/Tenant.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all tenants (SUPER_ADMIN only)
router.get('/', authorize('SUPER_ADMIN'), async (req, res) => {
  try {
    const tenants = await Tenant.find().sort({ createdAt: -1 });
    res.json(tenants.map(tenant => ({
      id: tenant._id.toString(),
      name: tenant.name,
      createdAt: tenant.createdAt,
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single tenant
router.get('/:id', authorize('SUPER_ADMIN'), async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    res.json({
      id: tenant._id.toString(),
      name: tenant.name,
      createdAt: tenant.createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

