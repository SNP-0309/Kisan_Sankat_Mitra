/**
 * FasalRakshak AI — ML Quality Service Client
 * 
 * Communicates with the FastAPI microservice over internal HTTP REST.
 * Implements strict timeouts, error trapping, and graceful fallbacks:
 * If the vision model is unreachable or fails, harvest registration continues
 * unblocked with a 'PENDING_ASSESSMENT' fallback status.
 */

const http = require('http');
const https = require('https');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Maps raw model detections to standard agricultural quality grades
 */
function mapAssessmentToGrade(assessment) {
  if (!assessment || assessment.overall_health === 'unknown') {
    return 'GRADE_B';
  }

  if (assessment.overall_health === 'healthy') {
    return assessment.confidence >= 0.8 ? 'GRADE_A' : 'GRADE_B';
  }

  // Check detected disease severity
  const detections = assessment.detections || [];
  const hasHighSeverity = detections.some((d) => d.severity === 'high');

  if (hasHighSeverity) {
    return 'REJECTED';
  }

  return 'GRADE_C';
}

/**
 * Perform crop assessment via ML microservice
 * 
 * @param {Buffer} imageBuffer - Raw image binary buffer
 * @param {string} mimeType - e.g. 'image/jpeg'
 * @param {string} cropType - e.g. 'tomato'
 * @returns {Promise<Object>} Assessment result or graceful fallback
 */
async function assessCropImage(imageBuffer, mimeType = 'image/jpeg', cropType = 'tomato', endpointOverride = null) {
  const baseUrl = endpointOverride || config.mlService.url;
  const mlUrl = new URL(`${baseUrl}/api/v1/assess`);
  const boundary = `----FasalRakshakBoundary${Date.now()}`;

  // Construct multipart/form-data payload in memory
  const preBuffer = Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="crop_type"\r\n\r\n` +
    `${cropType}\r\n` +
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="upload.jpg"\r\n` +
    `Content-Type: ${mimeType}\r\n\r\n`
  );
  const postBuffer = Buffer.from(`\r\n--${boundary}--\r\n`);
  const payload = Buffer.concat([preBuffer, imageBuffer, postBuffer]);

  const requestOptions = {
    method: 'POST',
    hostname: mlUrl.hostname,
    port: mlUrl.port || (mlUrl.protocol === 'https:' ? 443 : 80),
    path: `${mlUrl.pathname}${mlUrl.search}`,
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': payload.length,
      'X-API-Key': config.mlService.apiKey,
    },
    timeout: config.mlService.timeoutMs || 5000,
  };

  const client = mlUrl.protocol === 'https:' ? https : http;

  return new Promise((resolve) => {
    const req = client.request(requestOptions, (res) => {
      let rawData = '';

      res.on('data', (chunk) => {
        rawData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = JSON.parse(rawData);
            const calculatedGrade = mapAssessmentToGrade(parsed);
            resolve({
              success: true,
              qualityGrade: calculatedGrade,
              rawAssessment: parsed,
              isMock: parsed.is_mock,
              confidence: parsed.confidence,
              modelName: parsed.model_name,
            });
          } catch (parseErr) {
            logger.warn('Failed to parse ML response body. Using fallback grade.', { err: parseErr.message });
            resolve(getFallbackResponse('MALFORMED_RESPONSE'));
          }
        } else {
          logger.warn(`ML service returned status ${res.statusCode}. Using fallback grade.`);
          resolve(getFallbackResponse(`HTTP_${res.statusCode}`));
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      logger.warn('ML quality service request timed out. Using fallback grade.');
      resolve(getFallbackResponse('TIMEOUT'));
    });

    req.on('error', (err) => {
      logger.warn('Failed to connect to ML quality service. Using fallback grade.', { error: err.message });
      resolve(getFallbackResponse('CONNECTION_ERROR'));
    });

    req.write(payload);
    req.end();
  });
}

/**
 * Safe fallback envelope when ML service is down or degraded
 */
function getFallbackResponse(reason) {
  return {
    success: false,
    qualityGrade: 'PENDING_ASSESSMENT',
    fallbackReason: reason,
    isMock: true,
    confidence: 0,
    modelName: 'None (Service Fallback)',
    rawAssessment: null,
  };
}

module.exports = {
  assessCropImage,
  mapAssessmentToGrade,
  getFallbackResponse,
};
