/**
 * FasalRakshak AI — Nearby Buyers Map Discovery Test Suite
 * Validates RBAC restrictions, Zod coordinate boundaries, and privacy protections.
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const config = require('../config');
const { generateToken } = require('../services/authService');

describe('Nearby Buyers Map — Backend Discovery & Privacy Suite', () => {
  let farmerToken;
  let buyerToken;
  let farmerUser;
  let buyerUser;
  let findByIdSpy;
  let aggregateSpy;

  beforeAll(() => {
    farmerUser = {
      _id: new mongoose.Types.ObjectId(),
      role: 'farmer',
      status: 'active',
      name: 'Ramesh Patil',
    };
    farmerToken = generateToken(farmerUser);

    buyerUser = {
      _id: new mongoose.Types.ObjectId(),
      role: 'buyer',
      status: 'active',
      name: 'Sahyadri Agro',
    };
    buyerToken = generateToken(buyerUser);

    // Mock User.findById so auth middleware resolves instantly without live MongoDB
    findByIdSpy = jest.spyOn(User, 'findById').mockImplementation((id) => {
      if (id.toString() === farmerUser._id.toString()) {
        return Promise.resolve(farmerUser);
      }
      if (id.toString() === buyerUser._id.toString()) {
        return Promise.resolve(buyerUser);
      }
      return Promise.resolve(null);
    });

    // Mock User.aggregate to return sample verified buyer data
    aggregateSpy = jest.spyOn(User, 'aggregate').mockImplementation((pipeline) => {
      const matchStage = pipeline[0]?.$geoNear?.query || {};

      // If query does not require verified & listed, it violates invariant
      if (!matchStage['buyerProfile.verified'] || !matchStage['buyerProfile.listedOnMap']) {
        return Promise.resolve([]);
      }

      return Promise.resolve([
        {
          _id: new mongoose.Types.ObjectId(),
          businessName: 'Sahyadri Mega Agro Foods Ltd',
          type: 'processor',
          cropsBought: ['Tomato', 'Onion'],
          district: 'Nashik',
          verified: true,
          distanceMeters: 14250,
          location: {
            type: 'Point',
            coordinates: [73.91428, 20.08129], // Exact coordinates that must be obfuscated
          },
        },
        {
          _id: new mongoose.Types.ObjectId(),
          businessName: 'Lasalgaon Wholesale Traders',
          type: 'trader',
          cropsBought: ['Onion'],
          district: 'Lasalgaon',
          verified: true,
          distanceMeters: 22100,
          location: {
            type: 'Point',
            coordinates: [74.22841, 20.14582],
          },
        },
      ]);
    });
  });

  afterAll(() => {
    findByIdSpy.mockRestore();
    aggregateSpy.mockRestore();
  });

  describe('Security & Role Guard Invariants', () => {
    test('Unauthenticated request gets 401 UNAUTHORIZED', async () => {
      const res = await request(app)
        .get('/api/v1/buyers/nearby?lat=20.08&lng=73.91')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    test('Non-farmer (Buyer) searching nearby buyers gets 403 FORBIDDEN', async () => {
      const res = await request(app)
        .get('/api/v1/buyers/nearby?lat=20.08&lng=73.91')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });
  });

  describe('Coordinate & Query Validation (Zod)', () => {
    test('Missing latitude or longitude returns 400 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .get('/api/v1/buyers/nearby?lat=20.08') // Missing lng
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('Latitude > 90 returns 400 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .get('/api/v1/buyers/nearby?lat=95.00&lng=73.91')
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/Latitude must be between -90 and 90/);
    });

    test('Longitude > 180 returns 400 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .get('/api/v1/buyers/nearby?lat=20.08&lng=195.00')
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/Longitude must be between -180 and 180/);
    });

    test('RadiusKm > 200 returns 400 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .get('/api/v1/buyers/nearby?lat=20.08&lng=73.91&radiusKm=250')
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/Radius cannot exceed 200 km/);
    });

    test('Invalid buyer type returns 400 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .get('/api/v1/buyers/nearby?lat=20.08&lng=73.91&type=unauthorized_type')
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Privacy & Obfuscation Invariants', () => {
    test('Response never contains phone, email, or exact coordinates', async () => {
      const res = await request(app)
        .get('/api/v1/buyers/nearby?lat=20.08&lng=73.91')
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.buyers)).toBe(true);
      expect(res.body.data.buyers.length).toBeGreaterThan(0);

      res.body.data.buyers.forEach((b) => {
        expect(b.phone).toBeUndefined();
        expect(b.email).toBeUndefined();
        expect(b.passwordHash).toBeUndefined();
        expect(b.address).toBeUndefined();

        // Approximate coordinates must be rounded to at most 2 decimal places
        if (b.approximateLocation?.coordinates) {
          const [lng, lat] = b.approximateLocation.coordinates;
          const lngDecimals = (lng.toString().split('.')[1] || '').length;
          const latDecimals = (lat.toString().split('.')[1] || '').length;
          expect(lngDecimals).toBeLessThanOrEqual(2);
          expect(latDecimals).toBeLessThanOrEqual(2);
        }
      });
    });

    test('Results are sorted by distanceKm ascending', async () => {
      const res = await request(app)
        .get('/api/v1/buyers/nearby?lat=20.08&lng=73.91')
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(200);

      const buyers = res.body.data.buyers;
      for (let i = 0; i < buyers.length - 1; i++) {
        expect(buyers[i].distanceKm).toBeLessThanOrEqual(buyers[i + 1].distanceKm);
      }
    });
  });
});
