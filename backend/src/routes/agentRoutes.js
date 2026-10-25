/**
 * FasalRakshak AI — AI Agent & Voice REST Endpoints
 * Versioned under /api/v1/agent
 */

const express = require('express');
const router = express.Router();
const { processFarmerQuery } = require('../agents/recoveryAgent');
const apiResponse = require('../utils/apiResponse');

/**
 * POST /api/v1/agent/query
 * Process voice or text queries in Marathi, Hindi, or English.
 */
router.post('/query', async (req, res, next) => {
  try {
    const { query, language = 'mr', context = {} } = req.body;
    if (!query || typeof query !== 'string') {
      return apiResponse.error(res, 'INVALID_QUERY', 'A voice or text query string is required', null, 400);
    }

    const result = await processFarmerQuery({
      query,
      language,
      context,
    });

    return apiResponse.success(res, result, null, 200);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
