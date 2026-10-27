/**
 * FasalRakshak AI — In-Memory Rate Limiter Middleware
 * Protects coordinate-based search endpoints against scraping and coordinate enumeration.
 */

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute

const ipRequestMap = new Map();

// Periodic cleanup every 5 minutes to prevent memory accumulation
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, record] of ipRequestMap.entries()) {
    if (now - record.windowStart > WINDOW_MS * 2) {
      ipRequestMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

if (cleanupTimer.unref) {
  cleanupTimer.unref();
}

function rateLimitNearbyBuyers(req, res, next) {
  // Use authenticated user ID or client IP
  const key = req.user ? `usr_${req.user.id}` : `ip_${req.ip || req.socket.remoteAddress}`;
  const now = Date.now();

  const record = ipRequestMap.get(key) || { windowStart: now, count: 0 };

  if (now - record.windowStart > WINDOW_MS) {
    // Reset window
    record.windowStart = now;
    record.count = 1;
    ipRequestMap.set(key, record);
    return next();
  }

  record.count += 1;
  ipRequestMap.set(key, record);

  if (record.count > MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many search requests. Please slow down and try again in 1 minute.',
        retryAfterSeconds: Math.ceil((record.windowStart + WINDOW_MS - now) / 1000),
        timestamp: new Date().toISOString(),
      },
    });
  }

  next();
}

module.exports = {
  rateLimitNearbyBuyers,
};
