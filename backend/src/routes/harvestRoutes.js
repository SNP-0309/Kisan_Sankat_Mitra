/**
 * FasalRakshak AI — Harvest Management REST Endpoints
 * Versioned under /api/v1/harvests
 */

const express = require('express');
const router = express.Router();
const apiResponse = require('../utils/apiResponse');
const Harvest = require('../models/Harvest');
const { calculateRecoveryPlan } = require('../recovery/recoveryEngine');
const { DEMO_ALTERNATIVES_POOL } = require('../agents/recoveryAgent');

// Default initial seed harvests for demo dashboard
const SEEDED_HARVESTS = [
  {
    _id: '671ce0010000000000000001',
    farmerName: 'Ramesh Patil (रमेश पाटील)',
    cropType: 'TOMATO',
    variety: 'Vaibhav Hybrid',
    harvestedQty: 1200,
    availableQty: 1000,
    reservedQty: 200,
    minPricePerKg: 15,
    qualityGrade: 'GRADE_A',
    qualityConfidence: 0.94,
    spoilageDeadline: new Date(Date.now() + 34 * 3600 * 1000).toISOString(),
    storageLocation: 'Ozar Farmgate, Junnar, Pune',
    status: 'AVAILABLE',
    isDemo: true,
  },
  {
    _id: '671ce0010000000000000002',
    farmerName: 'Ramesh Patil (रमेश पाटील)',
    cropType: 'TOMATO',
    variety: 'Abhinav Standard',
    harvestedQty: 800,
    availableQty: 800,
    reservedQty: 0,
    minPricePerKg: 13,
    qualityGrade: 'GRADE_B',
    qualityConfidence: 0.82,
    spoilageDeadline: new Date(Date.now() + 18 * 3600 * 1000).toISOString(), // At-risk
    storageLocation: 'Narayangaon Cold Store Shed',
    status: 'AVAILABLE',
    isDemo: true,
  },
  {
    _id: '671ce0010000000000000003',
    farmerName: 'Ramesh Patil (रमेश पाटील)',
    cropType: 'ONION',
    variety: 'Nashik Red',
    harvestedQty: 2500,
    availableQty: 2500,
    reservedQty: 0,
    minPricePerKg: 18,
    qualityGrade: 'GRADE_A',
    qualityConfidence: 0.96,
    spoilageDeadline: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
    storageLocation: 'Alephata Warehouse',
    status: 'AVAILABLE',
    isDemo: true,
  },
];

/**
 * GET /api/v1/harvests
 * List all harvests
 */
router.get('/', async (req, res, next) => {
  try {
    let harvests = [];
    try {
      harvests = await Harvest.find().sort({ createdAt: -1 });
    } catch (dbErr) {
      // Fallback to seeded demo records if offline
      harvests = [];
    }

    if (!harvests || harvests.length === 0) {
      harvests = SEEDED_HARVESTS;
    }

    return apiResponse.success(res, { harvests, total: harvests.length }, null, 200);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/harvests
 * Register a new harvest with quality grading
 */
router.post('/', async (req, res, next) => {
  try {
    const {
      farmerName = 'Ramesh Patil',
      cropType = 'TOMATO',
      variety = 'Standard Red',
      harvestedQty = 1000,
      minPricePerKg = 14,
      spoilageHours = 48,
      storageLocation = 'Narayangaon, Pune',
      qualityGrade = 'GRADE_A',
    } = req.body;

    const qty = Number(harvestedQty);
    const deadline = new Date(Date.now() + Number(spoilageHours) * 3600 * 1000);

    const harvestData = {
      farmerId: '650c1f1e1c9d440000a11111',
      farmerName,
      cropType: cropType.toUpperCase(),
      variety,
      harvestedQty: qty,
      availableQty: qty,
      reservedQty: 0,
      minPricePerKg: Number(minPricePerKg),
      spoilageDeadline: deadline,
      storageLocation,
      qualityGrade,
      status: 'AVAILABLE',
      isDemo: true,
    };

    let saved;
    try {
      saved = await Harvest.create(harvestData);
    } catch (e) {
      saved = { ...harvestData, _id: `harv_${Date.now()}` };
    }

    return apiResponse.success(res, { harvest: saved }, 'Harvest registered successfully', 201);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/harvests/:id/disrupt
 * Simulate sudden order cancellation and generate recovery options
 */
router.post('/:id/disrupt', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { canceledQty = 1000, reason = 'Buyer refrigerated truck broke down on highway' } = req.body;

    const qty = Number(canceledQty);

    const harvest = {
      id,
      cropType: 'TOMATO',
      availableQty: qty,
      minPricePerKg: 14,
      spoilageDeadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    };

    const disruption = {
      eventType: 'BUYER_CANCELLATION',
      affectedStockQty: qty,
      reason,
    };

    const recoveryPlan = calculateRecoveryPlan({
      harvest,
      disruption,
      alternatives: DEMO_ALTERNATIVES_POOL,
      farmerPreferences: { minAcceptablePricePerKg: 14 },
    });

    return apiResponse.success(
      res,
      {
        disruptionAlert: {
          id: `disrupt_${Date.now()}`,
          eventType: 'BUYER_CANCELLATION',
          affectedCrop: 'TOMATO',
          affectedQuantityKg: qty,
          reason,
          urgency: 'HIGH',
          timestamp: new Date().toISOString(),
        },
        recoveryPlan,
      },
      'Disruption detected: recovery plan generated',
      200
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;
