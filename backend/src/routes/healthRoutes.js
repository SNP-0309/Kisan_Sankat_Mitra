/**
 * FasalRakshak AI — Health & Readiness Routes
 * Provides liveness and readiness probes for orchestrators and uptime monitors.
 */

const express = require('express');
const router = express.Router();
const apiResponse = require('../utils/apiResponse');
const config = require('../config');

// Record server boot timestamp
const bootTime = new Date();

/**
 * GET /api/v1/health
 * Liveness probe: returns 200 as long as the Express process is executing.
 */
router.get('/health', (req, res) => {
  const uptimeSeconds = Math.floor(process.uptime());
  const memoryUsage = process.memoryUsage();

  return apiResponse.success(res, {
    status: 'healthy',
    service: 'fasal-rakshak-backend',
    version: '1.0.0',
    environment: config.env,
    uptimeSeconds,
    bootTime: bootTime.toISOString(),
    timestamp: new Date().toISOString(),
    memory: {
      rssMb: Math.round(memoryUsage.rss / (1024 * 1024)),
      heapUsedMb: Math.round(memoryUsage.heapUsed / (1024 * 1024)),
    },
  });
});

/**
 * GET /api/v1/ready
 * Readiness probe: reports readiness to serve traffic.
 * In Phase B (pre-MongoDB connection), reports server initialization readiness.
 * In Phase C+, includes database connectivity status.
 */
router.get('/ready', (req, res) => {
  // Flag can be toggled by database connection lifecycle hooks
  const isDbConnected = Boolean(req.app.locals.isDbConnected);

  const ready = true; // In Phase B foundation, HTTP layer is ready

  const statusCode = ready ? 200 : 503;

  return apiResponse.success(
    res,
    {
      ready,
      checks: {
        httpServer: 'UP',
        database: isDbConnected ? 'CONNECTED' : 'STANDBY',
        mlService: 'CONFIGURED',
      },
      timestamp: new Date().toISOString(),
    },
    null,
    statusCode
  );
});

module.exports = router;
