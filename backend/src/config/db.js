/**
 * FasalRakshak AI — Database Connection Manager
 * Manages Mongoose connection pool, retry events, and graceful termination.
 */

const mongoose = require('mongoose');
const config = require('./index');
const logger = require('../utils/logger');

let isConnected = false;

async function connectDB() {
  if (isConnected) {
    return;
  }

  try {
    const conn = await mongoose.connect(config.database.uri, {
      autoIndex: !config.isProduction, // Build indexes automatically in development/testing
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = conn.connection.readyState === 1;
    logger.info(`MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    logger.error('Failed to establish MongoDB connection:', {
      message: error.message,
      uri: config.database.uri.replace(/\/\/.*@/, '//<redacted>@'),
    });
    // In test environment, allow tests to handle in-memory or mock DB
    if (!config.isTest) {
      process.exit(1);
    }
  }
}

async function disconnectDB() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('MongoDB disconnected.');
  }
}

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  logger.warn('MongoDB connection lost. Attempting reconnect...');
});

module.exports = {
  connectDB,
  disconnectDB,
};
