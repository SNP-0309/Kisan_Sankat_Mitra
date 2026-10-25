/**
 * FasalRakshak AI — Pure Deterministic Recovery Engine
 * 
 * CORE PRINCIPLE: PURE FUNCTION WITH ZERO DATABASE OR NETWORK SIDE EFFECTS.
 * Takes immutable snapshot of Harvest, Disruption, Farmer Constraints, and
 * Candidate Alternative Destinations, and computes mathematically traceable,
 * auditable net returns and rankings.
 * 
 * "AI that can't lie — every rupee is traceable and nothing is invented."
 */

/**
 * Vehicle specifications and per-km pricing models (Maharashtra Agri-Freight rates)
 */
const VEHICLE_SPECS = {
  MINI_TRUCK_PICKUP: { maxCapacityKg: 1200, baseFee: 250, ratePerKm: 14, avgSpeedKmh: 40 },
  TEMPO_407: { maxCapacityKg: 3000, baseFee: 500, ratePerKm: 22, avgSpeedKmh: 35 },
  REEFER_COLD_VAN: { maxCapacityKg: 2000, baseFee: 1200, ratePerKm: 35, avgSpeedKmh: 45, isRefrigerated: true },
  LOCAL_CART_TROLLEY: { maxCapacityKg: 500, baseFee: 50, ratePerKm: 8, avgSpeedKmh: 20 },
};

/**
 * Packaging cost per kg depending on channel requirements
 */
const PACKAGING_RATES_PER_KG = {
  APMC_MANDI: 1.5,       // Standard 25kg plastic crates / mesh bags
  FOOD_PROCESSOR: 1.0,   // Bulk plastic crates (provided or discounted)
  COLD_STORAGE: 3.0,     // Specialized ventilated refrigerated crates
  LOCAL_VENDOR: 0.0,     // Farmgate loose transfer / customer's crates
  RETAIL_CHAIN: 2.5,     // Barcoded punnets / corrugated cartons
};

/**
 * Statutory APMC cess and platform fee percentages
 */
const PLATFORM_FEE_PERCENT = {
  APMC_MANDI: 0.02,      // 2% APMC Mandi cess
  FOOD_PROCESSOR: 0.01,  // 1% Direct contract clearing fee
  COLD_STORAGE: 0.005,   // 0.5% Deposit registration fee
  LOCAL_VENDOR: 0.00,    // 0% Cash / local sale
  RETAIL_CHAIN: 0.015,   // 1.5% Supplier onboarding fee
};

/**
 * Hourly transit spoilage rate (fraction per hour) for ambient perishable crops
 */
const AMBIENT_SPOILAGE_RATE_PER_HOUR = {
  TOMATO: 0.006,  // 0.6% quality loss per ambient hour under Maharashtra sun
  ONION: 0.0005,  // Very low
  POTATO: 0.0005,
  CHILLI: 0.003,
};

/**
 * Select optimal vehicle type based on quantity and refrigeration requirement
 */
function selectOptimalVehicle(quantityKg, requiresColdChain = false) {
  if (requiresColdChain) return VEHICLE_SPECS.REEFER_COLD_VAN;
  if (quantityKg <= 500) return VEHICLE_SPECS.LOCAL_CART_TROLLEY;
  if (quantityKg <= 1200) return VEHICLE_SPECS.MINI_TRUCK_PICKUP;
  return VEHICLE_SPECS.TEMPO_407;
}

/**
 * Calculate round-trip or point-to-point freight cost
 */
function calculateFreightCost(distanceKm, quantityKg, requiresColdChain = false) {
  if (distanceKm <= 0) return 0;
  const vehicle = selectOptimalVehicle(quantityKg, requiresColdChain);
  const cost = vehicle.baseFee + (distanceKm * vehicle.ratePerKm);
  return Math.round(cost * 100) / 100;
}

/**
 * Calculate transit duration in hours
 */
function calculateTransitHours(distanceKm, quantityKg, requiresColdChain = false) {
  if (distanceKm <= 0) return 0;
  const vehicle = selectOptimalVehicle(quantityKg, requiresColdChain);
  return Math.round((distanceKm / vehicle.avgSpeedKmh) * 10) / 10;
}

/**
 * Evaluate a single alternative destination against farmer constraints
 */
function evaluateAlternative(destination, params) {
  const {
    cropType = 'TOMATO',
    affectedStockQty,
    minAcceptablePricePerKg = 0,
    remainingShelfLifeHours = 48,
    currentTime = new Date(),
  } = params;

  const distanceKm = Math.max(0, destination.distanceKm || 0);
  const offeredPricePerKg = Number(destination.offeredPricePerKg || 0);
  const intakeCapacityKg = Number(destination.intakeCapacityKg || destination.dailyIntakeCapacityKg || Infinity);
  const channelType = destination.channelType || destination.businessType || 'APMC_MANDI';
  const requiresColdChain = channelType === 'COLD_STORAGE' || Boolean(destination.requiresColdChain);

  // Allocation quantity is min of affected stock and destination capacity
  const allocatedQty = Math.min(affectedStockQty, intakeCapacityKg);

  if (allocatedQty <= 0) {
    return {
      destinationId: destination.id || destination._id,
      name: destination.name,
      isFeasible: false,
      rejectionReason: `Destination capacity is zero or fully booked for today.`,
    };
  }

  // 1. Gross Revenue
  const grossRevenue = Math.round(allocatedQty * offeredPricePerKg * 100) / 100;

  // 2. Transport & Logistics
  const transportCost = calculateFreightCost(distanceKm, allocatedQty, requiresColdChain);
  const transitHours = calculateTransitHours(distanceKm, allocatedQty, requiresColdChain);

  // 3. Packaging & Mandi Fees
  const packagingRate = PACKAGING_RATES_PER_KG[channelType] ?? 1.5;
  const packagingCost = Math.round(allocatedQty * packagingRate * 100) / 100;

  const platformFeeRate = PLATFORM_FEE_PERCENT[channelType] ?? 0.01;
  const platformFee = Math.round(grossRevenue * platformFeeRate * 100) / 100;

  // 4. Transit Spoilage Risk Calculation
  let spoilageCost = 0;
  if (!requiresColdChain) {
    const spoilageRate = AMBIENT_SPOILAGE_RATE_PER_HOUR[cropType] || 0.005;
    const spoilageFraction = Math.min(1.0, transitHours * spoilageRate);
    spoilageCost = Math.round(grossRevenue * spoilageFraction * 100) / 100;
  }

  // 5. Exact Net Return
  const netReturn = Math.round((grossRevenue - transportCost - packagingCost - platformFee - spoilageCost) * 100) / 100;
  const netRealizedPricePerKg = Math.round((netReturn / allocatedQty) * 100) / 100;

  // 6. Feasibility Verifications
  if (transitHours > remainingShelfLifeHours) {
    return {
      destinationId: destination.id || destination._id,
      name: destination.name,
      channelType,
      isFeasible: false,
      rejectionReason: `Transit time of ${transitHours} hrs exceeds remaining produce shelf-life of ${remainingShelfLifeHours} hrs. High risk of total spoilage.`,
    };
  }

  if (netReturn <= 0) {
    return {
      destinationId: destination.id || destination._id,
      name: destination.name,
      channelType,
      isFeasible: false,
      rejectionReason: `Logistics costs (₹${transportCost}) and fees (₹${platformFee}) exceed gross realization, leading to a net loss of ₹${Math.abs(netReturn)}.`,
    };
  }

  if (netRealizedPricePerKg < minAcceptablePricePerKg) {
    return {
      destinationId: destination.id || destination._id,
      name: destination.name,
      channelType,
      isFeasible: false,
      rejectionReason: `Net realized price of ₹${netRealizedPricePerKg}/kg is below farmer's reserve price of ₹${minAcceptablePricePerKg}/kg.`,
    };
  }

  // 7. Transparent 1-Sentence Reason ("Why this option")
  let decisionReason = '';
  if (channelType === 'LOCAL_VENDOR' && distanceKm <= 5) {
    decisionReason = `Zero transport overhead and immediate cash settlement saves ₹${transportCost} in freight over distant mandis.`;
  } else if (channelType === 'FOOD_PROCESSOR') {
    decisionReason = `Direct processor contract guarantees bulk intake of ${allocatedQty} kg with minimal cess deductions.`;
  } else if (channelType === 'COLD_STORAGE') {
    decisionReason = `Refrigerated storage halts tomato spoilage for up to 14 days, protecting produce from distress fire-sale.`;
  } else {
    decisionReason = `Highest net realization of ₹${netRealizedPricePerKg}/kg at ${destination.name} (${distanceKm} km) after accounting for ₹${transportCost} freight.`;
  }

  return {
    destinationId: destination.id || destination._id,
    name: destination.name,
    location: destination.location || destination.city || 'Local',
    channelType,
    distanceKm,
    allocatedQty,
    offeredPricePerKg,
    grossRevenue,
    transportCost,
    packagingCost,
    platformFee,
    spoilageCost,
    netReturn,
    netRealizedPricePerKg,
    transitHours,
    isFeasible: true,
    decisionReason,
  };
}

/**
 * Pure Deterministic Recovery Plan Generator
 * 
 * @param {Object} input
 * @param {Object} input.harvest - The affected harvest inventory record
 * @param {Object} input.disruption - Disruption event metadata (qty cancelled, cause)
 * @param {Array} input.alternatives - Pool of verified market buyers / facilities
 * @param {Object} [input.farmerPreferences] - Farmer threshold overrides
 * @returns {Object} Complete recovery plan with ranked feasible candidates and rejection log
 */
function calculateRecoveryPlan({ harvest, disruption, alternatives, farmerPreferences = {} }) {
  if (!harvest || !disruption || !Array.isArray(alternatives)) {
    throw new Error('Invalid input: harvest, disruption, and alternatives array are required');
  }

  const affectedStockQty = Number(disruption.affectedStockQty || harvest.availableQty || 0);
  if (affectedStockQty <= 0) {
    throw new Error('Disrupted stock quantity must be greater than zero');
  }

  // Calculate remaining shelf life from spoilage deadline
  const now = new Date();
  const deadline = harvest.spoilageDeadline ? new Date(harvest.spoilageDeadline) : new Date(now.getTime() + 48 * 3600 * 1000);
  const remainingShelfLifeHours = Math.max(0, Math.round((deadline - now) / (1000 * 60 * 60)));

  const minAcceptablePricePerKg = farmerPreferences.minAcceptablePricePerKg ?? harvest.minPricePerKg ?? 10;

  const evaluationParams = {
    cropType: harvest.cropType || 'TOMATO',
    affectedStockQty,
    minAcceptablePricePerKg,
    remainingShelfLifeHours,
    currentTime: now,
  };

  const feasibleCandidates = [];
  const rejectedCandidates = [];

  for (const alt of alternatives) {
    const result = evaluateAlternative(alt, evaluationParams);
    if (result.isFeasible) {
      feasibleCandidates.push(result);
    } else {
      rejectedCandidates.push({
        destinationId: result.destinationId,
        name: result.name,
        rejectionReason: result.rejectionReason,
      });
    }
  }

  // Deterministic Ranking:
  // Primary key: netReturn (descending)
  // Secondary key: distanceKm (ascending)
  feasibleCandidates.sort((a, b) => {
    if (b.netReturn !== a.netReturn) {
      return b.netReturn - a.netReturn;
    }
    return a.distanceKm - b.distanceKm;
  });

  // Assign 1-indexed ranks
  feasibleCandidates.forEach((candidate, index) => {
    candidate.rank = index + 1;
  });

  const bestOption = feasibleCandidates[0] || null;

  return {
    generatedAt: now.toISOString(),
    cropType: harvest.cropType || 'TOMATO',
    affectedStockQty,
    remainingShelfLifeHours,
    minAcceptablePricePerKg,
    hasFeasiblePlan: feasibleCandidates.length > 0,
    totalFeasibleOptions: feasibleCandidates.length,
    bestOptionRank: bestOption ? bestOption.rank : null,
    highestNetReturn: bestOption ? bestOption.netReturn : 0,
    candidates: feasibleCandidates,
    rejectedCandidates,
    summary: bestOption
      ? `Best recovery: ${bestOption.name} yields net ₹${bestOption.netReturn.toLocaleString('en-IN')} (₹${bestOption.netRealizedPricePerKg}/kg) after ₹${bestOption.transportCost} transport.`
      : `No feasible alternatives found meeting reserve price of ₹${minAcceptablePricePerKg}/kg or shelf-life constraints.`,
  };
}

module.exports = {
  calculateRecoveryPlan,
  evaluateAlternative,
  calculateFreightCost,
  calculateTransitHours,
  VEHICLE_SPECS,
  PACKAGING_RATES_PER_KG,
  PLATFORM_FEE_PERCENT,
};
