/**
 * FasalRakshak AI — Centralized Environment Configuration & Validation
 * Loads, validates, and exports immutable application configuration.
 */

const dotenv = require('dotenv');
const path = require('path');

// Load .env from backend directory if present
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const nodeEnv = process.env.NODE_ENV || 'development';

// In production, ensure critical secrets are defined
if (nodeEnv === 'production') {
  const requiredVars = ['JWT_SECRET', 'MONGODB_URI'];
  const missing = requiredVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `[Config] CRITICAL: Missing required production environment variables: ${missing.join(', ')}`
    );
  }
}

const config = Object.freeze({
  env: nodeEnv,
  isProduction: nodeEnv === 'production',
  isTest: nodeEnv === 'test',
  isDevelopment: nodeEnv === 'development',

  server: {
    port: parseInt(process.env.PORT, 10) || 5000,
    apiPrefix: process.env.API_PREFIX || '/api/v1',
  },

  database: {
    uri:
      process.env.MONGODB_URI ||
      'mongodb://localhost:27017/fasal_rakshak_dev',
  },

  jwt: {
    secret:
      process.env.JWT_SECRET ||
      'dev_insecure_jwt_secret_change_in_production_key_32chars!',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  mlService: {
    url: process.env.ML_SERVICE_URL || 'http://localhost:8000',
    apiKey:
      process.env.ML_SERVICE_API_KEY ||
      'fasal_rakshak_ml_internal_secret_key_change_me',
    timeoutMs: parseInt(process.env.ML_SERVICE_TIMEOUT_MS, 10) || 10000,
  },

  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  },

  cors: {
    clientUrl: process.env.CLIENT_URL || 'http://localhost:8081',
  },

  logging: {
    level: process.env.LOG_LEVEL || (nodeEnv === 'test' ? 'error' : 'info'),
  },
});

module.exports = config;
