const {
  calculateRecoveryPlan,
  evaluateAlternative,
  calculateFreightCost,
  calculateTransitHours,
  VEHICLE_SPECS,
} = require('../recovery/recoveryEngine');

describe('Pure Deterministic Recovery Engine Unit Tests', () => {
  const mockHarvest = {
    id: 'harvest_tomato_001',
    cropType: 'TOMATO',
    availableQty: 1000,
    minPricePerKg: 14,
    spoilageDeadline: new Date(Date.now() + 36 * 3600 * 1000).toISOString(), // 36 hours remaining
    storageLocation: 'Narayangaon, Junnar, Pune',
  };

  const mockDisruption = {
    eventType: 'BUYER_CANCELLATION',
    affectedStockQty: 1000,
    reason: 'Buyer vehicle broken down, unable to collect batch',
  };

  const mockAlternatives = [
    {
      id: 'alt_mandi_narayangaon',
      name: 'Narayangaon APMC Mandi',
      channelType: 'APMC_MANDI',
      distanceKm: 8,
      offeredPricePerKg: 20,
      intakeCapacityKg: 5000,
    },
    {
      id: 'alt_processor_pune',
      name: 'Sahyadri Agro Processing Hub',
      channelType: 'FOOD_PROCESSOR',
      distanceKm: 65,
      offeredPricePerKg: 21,
      intakeCapacityKg: 2000,
    },
    {
      id: 'alt_mandi_vashi',
      name: 'Mumbai Vashi APMC',
      channelType: 'APMC_MANDI',
      distanceKm: 165,
      offeredPricePerKg: 26,
      intakeCapacityKg: 10000,
    },
    {
      id: 'alt_local_vendor',
      name: 'Local Junnar Farmgate Trader',
      channelType: 'LOCAL_VENDOR',
      distanceKm: 2,
      offeredPricePerKg: 16,
      intakeCapacityKg: 800,
    },
  ];

  test('Freight calculation selects optimal vehicle and returns correct pricing', () => {
    // 1000 kg -> MINI_TRUCK_PICKUP (base: 250, rate: 14)
    const distanceKm = 10;
    const cost = calculateFreightCost(distanceKm, 1000);
    expect(cost).toBe(250 + (10 * 14)); // 390
  });

  test('Zero distance incurs zero freight cost', () => {
    expect(calculateFreightCost(0, 500)).toBe(0);
  });

  test('Evaluates alternative with transparent, traceable deductions', () => {
    const singleAlt = {
      id: 'alt_test',
      name: 'Nearby APMC',
      channelType: 'APMC_MANDI',
      distanceKm: 20,
      offeredPricePerKg: 20,
      intakeCapacityKg: 1000,
    };

    const evaluation = evaluateAlternative(singleAlt, {
      cropType: 'TOMATO',
      affectedStockQty: 1000,
      minAcceptablePricePerKg: 14,
      remainingShelfLifeHours: 30,
    });

    expect(evaluation.isFeasible).toBe(true);
    expect(evaluation.grossRevenue).toBe(20000); // 1000 * 20
    expect(evaluation.transportCost).toBe(250 + (20 * 14)); // 530
    expect(evaluation.packagingCost).toBe(1000 * 1.5); // 1500
    expect(evaluation.platformFee).toBe(20000 * 0.02); // 400
    expect(evaluation.netReturn).toBe(
      Math.round((20000 - 530 - 1500 - 400 - evaluation.spoilageCost) * 100) / 100
    );
    expect(evaluation.netRealizedPricePerKg).toBeGreaterThan(15);
    expect(evaluation.decisionReason).toContain('Highest net realization');
  });

  test('Rejects destination when transit time exceeds remaining shelf life', () => {
    const farDestination = {
      id: 'alt_delhi',
      name: 'Azadpur Mandi Delhi',
      channelType: 'APMC_MANDI',
      distanceKm: 1400, // ~35 hours
      offeredPricePerKg: 35,
      intakeCapacityKg: 5000,
    };

    const evaluation = evaluateAlternative(farDestination, {
      cropType: 'TOMATO',
      affectedStockQty: 1000,
      minAcceptablePricePerKg: 14,
      remainingShelfLifeHours: 12, // Only 12 hours left before rotting
    });

    expect(evaluation.isFeasible).toBe(false);
    expect(evaluation.rejectionReason).toContain('exceeds remaining produce shelf-life');
  });

  test('Rejects alternative when net realized price drops below reserve price', () => {
    const lowBidDestination = {
      id: 'alt_low',
      name: 'Distress Clearance Buyer',
      channelType: 'LOCAL_VENDOR',
      distanceKm: 10,
      offeredPricePerKg: 10,
      intakeCapacityKg: 1000,
    };

    const evaluation = evaluateAlternative(lowBidDestination, {
      cropType: 'TOMATO',
      affectedStockQty: 1000,
      minAcceptablePricePerKg: 14, // Reserve price 14
      remainingShelfLifeHours: 36,
    });

    expect(evaluation.isFeasible).toBe(false);
    expect(evaluation.rejectionReason).toContain('is below farmer\'s reserve price');
  });

  test('Ranks alternatives deterministically with correct winner', () => {
    const plan = calculateRecoveryPlan({
      harvest: mockHarvest,
      disruption: mockDisruption,
      alternatives: mockAlternatives,
      farmerPreferences: { minAcceptablePricePerKg: 12 },
    });

    expect(plan.hasFeasiblePlan).toBe(true);
    expect(plan.candidates.length).toBeGreaterThan(0);
    expect(plan.candidates[0].rank).toBe(1);

    // Ensure candidates are strictly sorted descending by netReturn
    for (let i = 0; i < plan.candidates.length - 1; i++) {
      expect(plan.candidates[i].netReturn).toBeGreaterThanOrEqual(plan.candidates[i + 1].netReturn);
    }

    // Traceability test: every candidate has non-empty decisionReason
    plan.candidates.forEach((cand) => {
      expect(typeof cand.decisionReason).toBe('string');
      expect(cand.decisionReason.length).toBeGreaterThan(10);
    });
  });

  test('Produces identical output on repeated executions (Purity & Determinism)', () => {
    const plan1 = calculateRecoveryPlan({
      harvest: mockHarvest,
      disruption: mockDisruption,
      alternatives: mockAlternatives,
    });

    const plan2 = calculateRecoveryPlan({
      harvest: mockHarvest,
      disruption: mockDisruption,
      alternatives: mockAlternatives,
    });

    expect(plan1.candidates.length).toBe(plan2.candidates.length);
    expect(plan1.candidates[0].destinationId).toBe(plan2.candidates[0].destinationId);
    expect(plan1.candidates[0].netReturn).toBe(plan2.candidates[0].netReturn);
  });
});
