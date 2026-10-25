const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const config = require('../config');
const { generateToken, registerUser, loginUser } = require('../services/authService');
const { authenticate, requireRole } = require('../middleware/auth');

describe('Phase 1: Multi-Role Authentication & Authorization Suite', () => {
  let isDbAvailable = false;

  beforeAll(async () => {
    try {
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(config.database.uri, { serverSelectionTimeoutMS: 1500 });
      }
      isDbAvailable = mongoose.connection.readyState === 1;
    } catch (err) {
      isDbAvailable = false;
    }
  });

  afterAll(async () => {
    if (isDbAvailable) {
      await User.deleteMany({ phone: { $in: ['9876543210', '9876543211', '9876543212', '9876543213'] } });
      await mongoose.disconnect();
    }
  });

  describe('Pure Service Layer & Security Invariants', () => {
    test('generateToken — Creates valid signed JWT with role and status claims', () => {
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        role: 'farmer',
        status: 'active',
      };

      const token = generateToken(mockUser);
      expect(typeof token).toBe('string');

      const decoded = jwt.verify(token, config.jwt.secret);
      expect(decoded.id).toBe(mockUser._id.toString());
      expect(decoded.role).toBe('farmer');
      expect(decoded.status).toBe('active');
    });

    test('registerUser — Blocks public registration as admin with FORBIDDEN_ROLE_ASSIGNMENT', async () => {
      await expect(
        registerUser({
          name: 'Hacker Attempt',
          phone: '9876543219',
          password: 'password123',
          role: 'admin',
        })
      ).rejects.toMatchObject({
        code: 'FORBIDDEN_ROLE_ASSIGNMENT',
        statusCode: 403,
      });
    });

    test('registerUser — Rejects invalid roles with INVALID_ROLE', async () => {
      await expect(
        registerUser({
          name: 'Invalid Role User',
          phone: '9876543219',
          password: 'password123',
          role: 'superadmin',
        })
      ).rejects.toMatchObject({
        code: 'INVALID_ROLE',
        statusCode: 400,
      });
    });

    test('registerUser — Rejects passwords shorter than 6 characters', async () => {
      await expect(
        registerUser({
          name: 'Short Password User',
          phone: '9876543219',
          password: '123',
          role: 'farmer',
        })
      ).rejects.toMatchObject({
        code: 'INVALID_PASSWORD_LENGTH',
        statusCode: 400,
      });
    });

    test('loginUser — Rejects missing identifier or password', async () => {
      await expect(
        loginUser({ identifier: '', password: '123' })
      ).rejects.toMatchObject({
        code: 'MISSING_CREDENTIALS',
        statusCode: 400,
      });
    });
  });

  describe('RBAC Middleware (requireRole)', () => {
    test('requireRole — Allows access when user role matches allowed roles', () => {
      const req = { user: { role: 'farmer' } };
      const res = {};
      const next = jest.fn();

      const middleware = requireRole('farmer', 'admin');
      middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    test('requireRole — Returns 403 Forbidden when user role is not permitted', () => {
      const req = { user: { role: 'buyer' } };
      const statusFn = jest.fn().mockReturnThis();
      const jsonFn = jest.fn();
      const res = { status: statusFn, json: jsonFn };
      const next = jest.fn();

      const middleware = requireRole('farmer');
      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(statusFn).toHaveBeenCalledWith(403);
      expect(jsonFn).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'INSUFFICIENT_PERMISSIONS' }),
        })
      );
    });
  });

  describe('JWT Authentication Middleware (authenticate)', () => {
    test('authenticate — Returns 401 when Authorization header is missing', async () => {
      const res = await request(app).get('/api/v1/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    test('authenticate — Returns 401 when token is forged or malformed', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid_forged_jwt_token_here');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_TOKEN');
    });
  });

  describe('HTTP Endpoints & Database Round-trip (when DB connected)', () => {
    test('POST /api/v1/auth/register — Blocks admin registration via HTTP request', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Public Admin Probe',
          phone: '9876543299',
          password: 'password123',
          role: 'admin',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN_ROLE_ASSIGNMENT');
    });

    test('POST /api/v1/auth/register & login — Integration flow (skipped if offline)', async () => {
      if (!isDbAvailable) {
        console.warn('⚠️ Local MongoDB not reachable. Skipping live database insertion test.');
        return;
      }

      // Register farmer
      const regRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Ramesh Patil',
          phone: '9876543210',
          password: 'securePassword123',
          role: 'farmer',
          farmerProfile: {
            village: 'Ozar',
            district: 'Pune',
            farmSizeAcres: 4,
          },
        });

      expect(regRes.status).toBe(201);
      expect(regRes.body.data.user.role).toBe('farmer');
      expect(regRes.body.data.user.passwordHash).toBeUndefined();

      // Login
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          identifier: '9876543210',
          password: 'securePassword123',
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.data.token).toBeDefined();

      // Access protected profile
      const meRes = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${loginRes.body.data.token}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.data.user.phone).toBe('9876543210');
    });
  });
});
