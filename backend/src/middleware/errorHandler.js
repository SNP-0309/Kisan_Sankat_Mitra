/**
 * FasalRakshak AI — Centralized Error Handling Middleware
 * Intercepts all unhandled errors, formats them according to apiResponse contracts,
 * and redacts sensitive internal traces in production.
 */

const logger = require('../utils/logger');
const apiResponse = require('../utils/apiResponse');
const config = require('../config');

/**
 * Custom application error class to carry explicit HTTP status and machine codes.
 */
class AppError extends Error {
  constructor(code, message, statusCode = 400, details = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Not Found Middleware for undefined endpoints.
 */
function notFoundHandler(req, res, next) {
  return apiResponse.error(
    res,
    'NOT_FOUND',
    `Resource not found: ${req.method} ${req.originalUrl}`,
    null,
    404
  );
}

/**
 * Global Error Handler Middleware
 */
function errorHandler(err, req, res, next) {
  // If response headers are already sent, delegate to Express default
  if (res.headersSent) {
    return next(err);
  }

  // Handle JSON parsing syntax error in request body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return apiResponse.error(
      res,
      'INVALID_JSON',
      'The request body contains malformed JSON syntax.',
      null,
      400
    );
  }

  // Handle AppError or any Error with explicit statusCode
  if (err instanceof AppError || err.statusCode) {
    return apiResponse.error(
      res,
      err.code || 'BAD_REQUEST',
      err.message,
      err.details || null,
      err.statusCode || 400
    );
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      issue: e.message,
    }));
    return apiResponse.error(
      res,
      'INVALID_INPUT',
      'Validation failed for one or more fields.',
      details,
      400
    );
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId format)
  if (err.name === 'CastError') {
    return apiResponse.error(
      res,
      'INVALID_ID',
      `Invalid identifier provided for ${err.path}.`,
      null,
      400
    );
  }

  // Unhandled / 500 Internal Errors
  logger.error('Unhandled internal server error', err);

  const message = config.isProduction
    ? 'An internal server error occurred. Please try again later.'
    : err.message || 'An unexpected error occurred.';

  const details = config.isProduction ? null : { stack: err.stack };

  return apiResponse.error(
    res,
    'INTERNAL_SERVER_ERROR',
    message,
    details,
    500
  );
}

module.exports = {
  AppError,
  notFoundHandler,
  errorHandler,
};
