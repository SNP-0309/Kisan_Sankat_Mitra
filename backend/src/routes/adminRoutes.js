/**
 * FasalRakshak AI — Admin Governance REST Endpoints
 * Versioned under /api/v1/admin
 * Strictly guarded by authenticate + requireRole('admin')
 */

const express = require('express');
const router = express.Router();
const apiResponse = require('../utils/apiResponse');
const { authenticate, requireRole } = require('../middleware/auth');
const User = require('../models/User');
const Harvest = require('../models/Harvest');
const Order = require('../models/Order');
const Shop = require('../models/Shop');

// Protect all admin endpoints with strict RBAC guard
router.use(authenticate, requireRole('admin'));

/**
 * GET /api/v1/admin/overview
 * Real-time system audit metrics across users, crops, orders, and facilities
 */
router.get('/overview', async (req, res, next) => {
  try {
    const [totalUsers, farmerCount, buyerCount, totalHarvests, totalOrders, shopCount] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'farmer' }),
      User.countDocuments({ role: 'buyer' }),
      Harvest.countDocuments(),
      Order.countDocuments(),
      Shop.countDocuments(),
    ]);

    const stats = {
      totalUsers,
      farmers: farmerCount,
      buyers: buyerCount,
      activeHarvests: totalHarvests,
      ordersProcessed: totalOrders,
      facilitiesRegistered: shopCount,
      systemHealth: 'OPERATIONAL',
      auditTimestamp: new Date().toISOString(),
    };

    return apiResponse.success(res, stats, 'Admin overview telemetry loaded', 200);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/admin/users
 * Returns all registered platform users with identity and role metadata
 */
router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find({}, 'name phone role status location createdAt').sort({ createdAt: -1 });
    return apiResponse.success(res, { users, total: users.length }, null, 200);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/admin/shops
 * Returns all mandi yards, cold storage units, and agro processors
 */
router.get('/shops', async (req, res, next) => {
  try {
    const shops = await Shop.find().sort({ verified: -1, name: 1 });
    return apiResponse.success(res, { shops, total: shops.length }, null, 200);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/v1/admin/shops/:id/verify
 * Allows APMC admin to verify or flag a mandi or storage facility
 */
router.patch('/shops/:id/verify', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { verified = true } = req.body;

    const updated = await Shop.findByIdAndUpdate(id, { verified: Boolean(verified) }, { new: true });
    if (!updated) {
      return apiResponse.error(res, 'SHOP_NOT_FOUND', 'Facility not found', null, 404);
    }

    return apiResponse.success(res, { shop: updated }, 'Facility verification updated', 200);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/admin/orders
 * Audit log of all platform orders and recovery transfers
 */
router.get('/orders', async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return apiResponse.success(res, { orders, total: orders.length }, null, 200);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
