/**
 * FasalRakshak AI — Buyer Service & Geographic Discovery Engine
 * Implements $geoNear proximity pipeline with strict privacy obfuscation.
 */

const mongoose = require('mongoose');
const User = require('../models/User');

/**
 * Find nearby verified buyers who have opted into the map directory.
 * Privacy Invariants:
 * 1. Only returns buyers where verified === true AND listedOnMap === true AND status === 'active'.
 * 2. Coordinates are rounded to 2 decimal places (~1.1 km area obfuscation).
 * 3. Never returns personal phone, email, or exact street address in discovery.
 */
async function getNearbyBuyers({ lat, lng, radiusKm = 25, crop, type, limit = 50 }) {
  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);
  const maxDistanceMeters = parseFloat(radiusKm) * 1000;

  // Build match query for $geoNear
  const matchFilter = {
    role: 'buyer',
    status: 'active',
    'buyerProfile.verified': true,
    'buyerProfile.listedOnMap': true,
  };

  if (crop && typeof crop === 'string') {
    matchFilter['buyerProfile.cropsBought'] = {
      $regex: new RegExp(`^${crop.trim()}$`, 'i'),
    };
  }

  if (type && ['trader', 'retailer', 'processor'].includes(type)) {
    matchFilter['buyerProfile.type'] = type;
  }

  // MongoDB $geoNear aggregation
  const pipeline = [
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [parsedLng, parsedLat], // GeoJSON order: [lng, lat]
        },
        distanceField: 'distanceMeters',
        maxDistance: maxDistanceMeters,
        spherical: true,
        query: matchFilter,
      },
    },
    {
      $limit: Math.min(parseInt(limit, 10) || 50, 50),
    },
    {
      $project: {
        _id: 1,
        businessName: {
          $ifNull: ['$buyerProfile.businessName', '$name'],
        },
        type: {
          $ifNull: ['$buyerProfile.type', 'trader'],
        },
        cropsBought: {
          $ifNull: ['$buyerProfile.cropsBought', []],
        },
        district: {
          $ifNull: ['$buyerProfile.district', 'Maharashtra'],
        },
        verified: {
          $ifNull: ['$buyerProfile.verified', false],
        },
        location: 1,
        distanceMeters: 1,
      },
    },
  ];

  const results = await User.aggregate(pipeline);

  // Post-process with privacy rounding (2 decimals ~ 1km fuzzing)
  return results.map((b) => {
    const rawLng = b.location?.coordinates?.[0] ?? parsedLng;
    const rawLat = b.location?.coordinates?.[1] ?? parsedLat;

    const approxLng = Math.round(rawLng * 100) / 100;
    const approxLat = Math.round(rawLat * 100) / 100;
    const distanceKm = Math.round((b.distanceMeters / 1000) * 10) / 10;

    return {
      _id: b._id,
      businessName: b.businessName,
      type: b.type,
      cropsBought: b.cropsBought,
      district: b.district,
      verified: b.verified,
      distanceKm,
      approximateLocation: {
        type: 'Point',
        coordinates: [approxLng, approxLat], // [lng, lat]
      },
    };
  });
}

/**
 * Update a buyer's map visibility and location settings
 */
async function updateBuyerMapSettings(buyerId, settings) {
  const buyer = await User.findOne({ _id: buyerId, role: 'buyer' });
  if (!buyer) {
    const error = new Error('Buyer account not found.');
    error.statusCode = 404;
    error.code = 'BUYER_NOT_FOUND';
    throw error;
  }

  if (settings.listedOnMap !== undefined) {
    buyer.buyerProfile.listedOnMap = Boolean(settings.listedOnMap);
  }

  if (settings.businessName !== undefined) {
    buyer.buyerProfile.businessName = settings.businessName;
  }

  if (settings.type !== undefined) {
    buyer.buyerProfile.type = settings.type;
  }

  if (settings.cropsBought !== undefined) {
    buyer.buyerProfile.cropsBought = settings.cropsBought;
  }

  if (settings.district !== undefined) {
    buyer.buyerProfile.district = settings.district;
  }

  if (settings.coordinates && Array.isArray(settings.coordinates)) {
    buyer.location = {
      type: 'Point',
      coordinates: settings.coordinates, // [lng, lat]
    };
  }

  await buyer.save();
  return buyer.toSafeObject();
}

/**
 * Admin action: verify, unverify, or suspend a buyer
 */
async function adminVerifyBuyer(buyerId, { verified, status }) {
  const buyer = await User.findOne({ _id: buyerId, role: 'buyer' });
  if (!buyer) {
    const error = new Error('Buyer account not found.');
    error.statusCode = 404;
    error.code = 'BUYER_NOT_FOUND';
    throw error;
  }

  if (verified !== undefined) {
    buyer.buyerProfile.verified = Boolean(verified);
  }

  if (status !== undefined) {
    buyer.status = status;
  }

  await buyer.save();
  return buyer.toSafeObject();
}

/**
 * Explicit contact action: reveals contact phone/desk to authenticated farmer
 */
async function contactBuyer(farmerId, buyerId) {
  const buyer = await User.findOne({
    _id: buyerId,
    role: 'buyer',
    status: 'active',
    'buyerProfile.verified': true,
  });

  if (!buyer) {
    const error = new Error('Buyer is not verified or currently unavailable.');
    error.statusCode = 404;
    error.code = 'BUYER_UNAVAILABLE';
    throw error;
  }

  // Return verified contact channel
  return {
    buyerId: buyer._id,
    businessName: buyer.buyerProfile.businessName || buyer.name,
    contactPhone: buyer.phone,
    district: buyer.buyerProfile.district,
    verified: true,
  };
}

module.exports = {
  getNearbyBuyers,
  updateBuyerMapSettings,
  adminVerifyBuyer,
  contactBuyer,
};
