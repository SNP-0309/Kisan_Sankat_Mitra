/**
 * FasalRakshak AI — Core Express Application
 * Configures security, body parsing, routing, and centralized error handling.
 * Exported separately from server.js for fast, isolated integration testing.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./config');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Mobile app / REST API
  })
);

// CORS Configuration
const allowedOrigins = [
  config.cors.clientUrl,
  'http://localhost:8081',
  'http://127.0.0.1:8081',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        config.isDevelopment ||
        allowedOrigins.indexOf(origin) !== -1
      ) {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS policy'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Service-Api-Key', 'Idempotency-Key'],
  })
);

// Body Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP Request Logging (suppressed in test environment)
if (!config.isTest) {
  app.use(
    morgan(':method :url :status :res[content-length] - :response-time ms', {
      skip: (req) => req.url.includes('/health'), // Keep health checks out of noisy logs
    })
  );
}

// Global API Request Timeout Safeguard (30 seconds)
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    if (!res.headersSent) {
      res.status(504).json({
        success: false,
        error: {
          code: 'GATEWAY_TIMEOUT',
          message: 'The request took too long to complete.',
          timestamp: new Date().toISOString(),
        },
      });
    }
  });
  next();
});

// Mount Versioned Routes (/api/v1)
const apiPrefix = config.server.apiPrefix;
app.use(apiPrefix, healthRoutes);
app.use(`${apiPrefix}/auth`, authRoutes);

// Root path redirect/info
app.get('/', (req, res) => {
  res.json({
    name: 'FasalRakshak AI API',
    tagline: 'When plans fail, we find the next move.',
    version: '1.0.0',
    documentation: '/docs',
    endpoints: `${apiPrefix}/health`,
  });
});

// 404 Handler for undefined routes
app.use(notFoundHandler);

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
