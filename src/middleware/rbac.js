export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Helper middleware to check if user can access tenant data
export const checkTenantAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // SUPER_ADMIN can access all tenants
  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  // Other roles can only access their own tenant
  const requestedTenantId = req.params.tenantId || req.body.tenantId || req.query.tenantId;
  const userTenantId = req.tenantId?.toString() || req.user.tenantId?.toString();

  if (requestedTenantId && requestedTenantId !== userTenantId) {
    return res.status(403).json({ error: 'Access denied to this tenant' });
  }

  next();
};

