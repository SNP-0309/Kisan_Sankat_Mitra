/**
 * FasalRakshak AI — Phase B Backend Foundation Tests
 * Tests health checks, readiness probes, 404 handling, and error response envelopes.
 */

const request = require('supertest');
const app = require('../app');

describe('Phase B: Backend Foundation & Health Probes', () => {
  describe('GET /', () => {
    it('should return service information and API version', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', 'FasalRakshak AI API');
      expect(res.body).toHaveProperty('tagline');
      expect(res.body).toHaveProperty('version', '1.0.0');
    });
  });

  describe('GET /api/v1/health', () => {
    it('should return 200 and healthy status conforming to API envelope', async () => {
      const res = await request(app).get('/api/v1/health');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('status', 'healthy');
      expect(res.body.data).toHaveProperty('service', 'fasal-rakshak-backend');
      expect(res.body.data).toHaveProperty('version', '1.0.0');
      expect(res.body.data).toHaveProperty('uptimeSeconds');
      expect(res.body.data).toHaveProperty('memory');
      expect(res.body.data.memory).toHaveProperty('rssMb');
      expect(res.body.data.memory).toHaveProperty('heapUsedMb');
    });
  });

  describe('GET /api/v1/ready', () => {
    it('should return 200 and readiness check list', async () => {
      const res = await request(app).get('/api/v1/ready');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('ready', true);
      expect(res.body.data.checks).toHaveProperty('httpServer', 'UP');
      expect(res.body.data.checks).toHaveProperty('database');
    });
  });

  describe('404 Not Found & Error Envelope', () => {
    it('should return 404 with standardized error envelope for unknown routes', async () => {
      const res = await request(app).get('/api/v1/unmapped-endpoint-xyz');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error).toHaveProperty('code', 'NOT_FOUND');
      expect(res.body.error).toHaveProperty('message');
      expect(res.body.error.message).toContain('/api/v1/unmapped-endpoint-xyz');
      expect(res.body.error).toHaveProperty('timestamp');
    });
  });

  describe('Malformed JSON Handling', () => {
    it('should intercept malformed JSON and return 400 INVALID_JSON envelope', async () => {
      const res = await request(app)
        .post('/api/v1/health')
        .set('Content-Type', 'application/json')
        .send('{ "invalidJson": broken ');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error).toHaveProperty('code', 'INVALID_JSON');
    });
  });
});
