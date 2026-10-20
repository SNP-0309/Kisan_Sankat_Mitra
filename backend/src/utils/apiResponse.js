/**
 * FasalRakshak AI — Standardized API Response Helper
 * Ensures all REST responses strictly adhere to the contracts defined in docs/api-contracts.md
 */

const apiResponse = {
  /**
   * Send a standardized success response.
   * @param {Object} res - Express response object
   * @param {*} data - Payload to return
   * @param {Object} [meta=null] - Optional pagination or metadata
   * @param {number} [statusCode=200] - HTTP status code
   */
  success(res, data = null, meta = null, statusCode = 200) {
    const responsePayload = {
      success: true,
      data,
    };

    if (meta) {
      responsePayload.meta = meta;
    }

    return res.status(statusCode).json(responsePayload);
  },

  /**
   * Send a standardized error response.
   * @param {Object} res - Express response object
   * @param {string} code - Machine-readable error code (e.g., 'INVALID_INPUT')
   * @param {string} message - Human-readable explanation
   * @param {Array|Object} [details=null] - Validation issues or extra details
   * @param {number} [statusCode=400] - HTTP status code
   */
  error(res, code, message, details = null, statusCode = 400) {
    const errorPayload = {
      code,
      message,
      timestamp: new Date().toISOString(),
    };

    if (details) {
      errorPayload.details = details;
    }

    return res.status(statusCode).json({
      success: false,
      error: errorPayload,
    });
  },
};

module.exports = apiResponse;
