/**
 * FasalRakshak AI — Authentication & Role-Based Authorization Guard
 * Verifies JWT tokens and enforces server-side role boundaries.
 */

const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');

/**
 * Authenticate incoming requests via Bearer JWT token
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Access denied. No authentication token provided.',
          timestamp: new Date().toISOString(),
        },
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;

    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (jwtErr) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Authentication token is invalid or has expired.',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Verify user exists and status is active in database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'The user belonging to this token no longer exists.',
          timestamp: new Date().toISOString(),
        },
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_SUSPENDED',
          message: 'Account suspended. Access revoked.',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Attach validated identity to request context
    req.user = {
      id: user._id.toString(),
      role: user.role,
      status: user.status,
      phone: user.phone,
      name: user.name,
      location: user.location,
    };

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Enforce role authorization (Server-side RBAC guard)
 * @param  {...string} allowedRoles - Allowed roles (e.g. 'farmer', 'admin')
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Authentication required prior to role verification.',
          timestamp: new Date().toISOString(),
        },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: `Forbidden: role '${req.user.role}' lacks permission for this resource. Required: [${allowedRoles.join(', ')}]`,
          timestamp: new Date().toISOString(),
        },
      });
    }

    next();
  };
}

module.exports = {
  authenticate,
  requireRole,
};
