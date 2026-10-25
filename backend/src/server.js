/**
 * FasalRakshak AI — Backend Server Bootstrap
 * Binds Express application to port and implements graceful termination listeners.
 */

const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');
const { connectDB, disconnectDB } = require('./config/db');

const PORT = config.server.port;

// Connect to Database
connectDB();

const server = app.listen(PORT, () => {
  logger.info(`FasalRakshak AI Backend listening on port ${PORT}`, {
    port: PORT,
    environment: config.env,
    apiPrefix: config.server.apiPrefix,
    healthUrl: `http://localhost:${PORT}${config.server.apiPrefix}/health`,
  });
});

/**
 * Graceful Shutdown Handler
 */
function gracefulShutdown(signal) {
  logger.info(`Received ${signal}. Initiating graceful shutdown...`);

  server.close(async (err) => {
    await disconnectDB();
    if (err) {
      logger.error('Error encountered while closing HTTP server:', err);
      process.exit(1);
    }
    logger.info('HTTP server closed successfully. Process exiting cleanly.');
    process.exit(0);
  });

  // Force exit after 10 seconds if connections fail to close
  setTimeout(() => {
    logger.error('Graceful shutdown timed out after 10s. Forcing exit.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = server;
