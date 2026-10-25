/**
 * FasalRakshak AI — Authentication REST Endpoints
 * Versioned under /api/v1/auth
 */

const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticate, requireRole } = require('../middleware/auth');

// Public Authentication Routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected Identity Route
router.get('/me', authenticate, authController.getMe);

// Role Test Route (Demonstrating server-side RBAC guard)
router.get('/admin-only-probe', authenticate, requireRole('admin'), (req, res) => {
  res.json({
    success: true,
    data: { message: 'Admin access verified', adminId: req.user.id },
  });
});

module.exports = router;
