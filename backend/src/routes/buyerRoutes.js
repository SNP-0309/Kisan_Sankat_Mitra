/**
 * FasalRakshak AI — Buyer Proximity & Settings Routes
 * Versioned under /api/v1/buyers
 */

const express = require('express');
const router = express.Router();

const buyerController = require('../controllers/buyerController');
const { authenticate, requireRole } = require('../middleware/auth');
const { rateLimitNearbyBuyers } = require('../middleware/rateLimiter');
const {
  validateNearbyQuery,
  validateMapSettings,
  validateAdminVerify,
} = require('../validators/buyerValidator');

/**
 * GET /api/v1/buyers/nearby
 * Authenticated Farmers only. Rate limited and Zod validated.
 */
router.get(
  '/nearby',
  authenticate,
  requireRole('farmer'),
  rateLimitNearbyBuyers,
  validateNearbyQuery,
  buyerController.getNearby
);

/**
 * PATCH /api/v1/buyers/profile/map-settings
 * Authenticated Buyers only. Updates location coordinates and opt-in listedOnMap toggle.
 */
router.patch(
  '/profile/map-settings',
  authenticate,
  requireRole('buyer'),
  validateMapSettings,
  buyerController.updateMapSettings
);

/**
 * POST /api/v1/buyers/:id/contact
 * Authenticated Farmers only. Logs intent and reveals verified buyer contact desk.
 */
router.post(
  '/:id/contact',
  authenticate,
  requireRole('farmer'),
  buyerController.contactBuyer
);

/**
 * PATCH /api/v1/buyers/admin/:id/verify
 * Authenticated Admins only. Verifies or suspends buyer map participation.
 */
router.patch(
  '/admin/:id/verify',
  authenticate,
  requireRole('admin'),
  validateAdminVerify,
  buyerController.adminVerifyBuyer
);

module.exports = router;
