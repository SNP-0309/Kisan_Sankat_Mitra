/**
 * FasalRakshak AI — Buyer Nearby Query & Profile Validator (Zod)
 * Validates coordinate boundaries, radii, and crop/type enums.
 */

const { z } = require('zod');

const ALLOWED_BUYER_TYPES = ['trader', 'retailer', 'processor'];

const nearbyQuerySchema = z.object({
  lat: z.coerce
    .number({ invalid_type_error: 'Latitude must be a valid number' })
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  lng: z.coerce
    .number({ invalid_type_error: 'Longitude must be a valid number' })
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  radiusKm: z.coerce
    .number()
    .min(1, 'Radius must be at least 1 km')
    .max(200, 'Radius cannot exceed 200 km')
    .default(25),
  crop: z.string().trim().min(1).max(50).optional(),
  type: z.enum(ALLOWED_BUYER_TYPES, {
    errorMap: () => ({ message: 'Buyer type must be trader, retailer, or processor' }),
  }).optional(),
  limit: z.coerce.number().min(1).max(50).default(50),
});

const buyerMapSettingsSchema = z.object({
  listedOnMap: z.boolean().optional(),
  businessName: z.string().trim().min(2).max(100).optional(),
  type: z.enum(ALLOWED_BUYER_TYPES).optional(),
  cropsBought: z.array(z.string().trim().min(1).max(50)).optional(),
  district: z.string().trim().min(2).max(60).optional(),
  coordinates: z
    .array(z.number())
    .length(2, 'Coordinates must be [longitude, latitude]')
    .refine(([lng, lat]) => lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90, {
      message: 'Invalid coordinate values [lng, lat]',
    })
    .optional(),
});

const adminVerifyBuyerSchema = z.object({
  verified: z.boolean().optional(),
  status: z.enum(['active', 'suspended']).optional(),
});

function validateNearbyQuery(req, res, next) {
  const result = nearbyQuerySchema.safeParse(req.query);
  if (!result.success) {
    const issue = result.error.issues[0];
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: issue.message,
        path: issue.path.join('.'),
        timestamp: new Date().toISOString(),
      },
    });
  }
  req.validatedQuery = result.data;
  next();
}

function validateMapSettings(req, res, next) {
  const result = buyerMapSettingsSchema.safeParse(req.body);
  if (!result.success) {
    const issue = result.error.issues[0];
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: issue.message,
        path: issue.path.join('.'),
        timestamp: new Date().toISOString(),
      },
    });
  }
  req.validatedBody = result.data;
  next();
}

function validateAdminVerify(req, res, next) {
  const result = adminVerifyBuyerSchema.safeParse(req.body);
  if (!result.success) {
    const issue = result.error.issues[0];
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: issue.message,
        path: issue.path.join('.'),
        timestamp: new Date().toISOString(),
      },
    });
  }
  req.validatedBody = result.data;
  next();
}

module.exports = {
  validateNearbyQuery,
  validateMapSettings,
  validateAdminVerify,
  ALLOWED_BUYER_TYPES,
};
