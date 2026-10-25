/**
 * FasalRakshak AI — Recovery Engine REST Endpoints
 * Versioned under /api/v1/recovery
 */

const express = require('express');
const router = express.Router();
const apiResponse = require('../utils/apiResponse');
const { calculateRecoveryPlan } = require('../recovery/recoveryEngine');
const { DEMO_ALTERNATIVES_POOL } = require('../agents/recoveryAgent');
const Harvest = require('../models/Harvest');
const Order = require('../models/Order');

/**
 * POST /api/v1/recovery/calculate
 * Calculate transparent, ranked alternatives for disrupted crop
 */
router.post('/calculate', async (req, res, next) => {
  try {
    const {
      cropType = 'TOMATO',
      affectedStockQty = 1000,
      minPricePerKg = 14,
      hoursRemaining = 36,
      reason = 'Buyer canceled order unexpectedly',
    } = req.body;

    const harvest = {
      cropType: cropType.toUpperCase(),
      availableQty: Number(affectedStockQty),
      minPricePerKg: Number(minPricePerKg),
      spoilageDeadline: new Date(Date.now() + hoursRemaining * 3600 * 1000).toISOString(),
    };

    const disruption = {
      eventType: 'BUYER_CANCELLATION',
      affectedStockQty: Number(affectedStockQty),
      reason,
    };

    const plan = calculateRecoveryPlan({
      harvest,
      disruption,
      alternatives: DEMO_ALTERNATIVES_POOL,
      farmerPreferences: { minAcceptablePricePerKg: Number(minPricePerKg) },
    });

    return apiResponse.success(res, plan, null, 200);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/recovery/execute
 * Authorize and commit chosen recovery alternative
 */
router.post('/execute', async (req, res, next) => {
  try {
    const { destinationId, allocatedQtyKg, offeredPricePerKg, farmerId } = req.body;

    const chosenDestination = DEMO_ALTERNATIVES_POOL.find((d) => d.id === destinationId) || DEMO_ALTERNATIVES_POOL[0];

    const orderNumber = `REC-${Date.now().toString().slice(-6)}`;
    const grossTotal = Number(allocatedQtyKg || 1000) * Number(offeredPricePerKg || chosenDestination.offeredPricePerKg);

    // Create replacement order
    const orderData = {
      orderNumber,
      farmerId: farmerId || '650c1f1e1c9d440000a11111',
      buyerName: chosenDestination.name,
      buyerLocation: chosenDestination.location,
      cropType: 'TOMATO',
      allocatedQtyKg: Number(allocatedQtyKg || 1000),
      pricePerKg: Number(offeredPricePerKg || chosenDestination.offeredPricePerKg),
      grossTotal,
      status: 'CONFIRMED',
      isDemo: true,
    };

    return apiResponse.success(
      res,
      {
        message: 'Recovery option authorized and committed successfully',
        recoveryOrder: orderData,
        destination: chosenDestination,
      },
      null,
      201
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;
