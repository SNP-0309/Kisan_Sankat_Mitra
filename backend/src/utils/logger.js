/**
 * FasalRakshak AI — Structured Logger with Sensitive Data Redaction
 * Ensures PII (passwords, JWTs, API keys, phone numbers) are never leaked to stdout.
 */

const config = require('../config');

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'token',
  'jwt',
  'jwtsecret',
  'authorization',
  'secret',
  'apikey',
  'mlserviceapikey',
  'geminiapikey',
  'creditcard',
]);

/**
 * Deeply redacts sensitive keys from log objects.
 */
function redact(data) {
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    // Redact JWT-like strings
    if (/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/.test(data)) {
      return '[REDACTED_JWT]';
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => redact(item));
  }

  if (typeof data === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase().replace(/[-_]/g, '');
      if (SENSITIVE_KEYS.has(lowerKey)) {
        sanitized[key] = '[REDACTED]';
      } else if (lowerKey === 'phone' && typeof value === 'string' && value.length > 5) {
        // Mask phone numbers preserving last 4 digits: +919876543210 -> +91******3210
        sanitized[key] = value.slice(0, 3) + '******' + value.slice(-4);
      } else {
        sanitized[key] = redact(value);
      }
    }
    return sanitized;
  }

  return data;
}

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevelPriority = LOG_LEVELS[config.logging.level] || LOG_LEVELS.info;

function formatLog(level, message, meta) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level: level.toUpperCase(),
    message,
  };

  if (meta !== undefined) {
    logEntry.meta = redact(meta);
  }

  return JSON.stringify(logEntry);
}

const logger = {
  debug(message, meta) {
    if (config.isTest) return;
    if (LOG_LEVELS.debug >= currentLevelPriority) {
      console.debug(formatLog('debug', message, meta));
    }
  },

  info(message, meta) {
    if (config.isTest) return;
    if (LOG_LEVELS.info >= currentLevelPriority) {
      console.log(formatLog('info', message, meta));
    }
  },

  warn(message, meta) {
    if (config.isTest) return;
    if (LOG_LEVELS.warn >= currentLevelPriority) {
      console.warn(formatLog('warn', message, meta));
    }
  },

  error(message, errorOrMeta) {
    let meta = errorOrMeta;
    if (errorOrMeta instanceof Error) {
      meta = {
        name: errorOrMeta.name,
        message: errorOrMeta.message,
        stack: errorOrMeta.stack,
      };
    }
    console.error(formatLog('error', message, meta));
  },

  redact,
};

module.exports = logger;
