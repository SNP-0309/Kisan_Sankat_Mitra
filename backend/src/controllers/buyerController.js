/**
 * FasalRakshak AI — Buyer Controller
 * Handles incoming requests for geographic discovery, settings, and verification.
 */

const buyerService = require('../services/buyerService');
const apiResponse = require('../utils/apiResponse');

async function getNearby(req, res, next) {
  try {
    const buyers = await buyerService.getNearbyBuyers(req.validatedQuery);
    return apiResponse.success(
      res,
      {
        total: buyers.length,
        radiusKm: req.validatedQuery.radiusKm,
        buyers,
      },
      null,
      200
    );
  } catch (err) {
    next(err);
  }
}

async function updateMapSettings(req, res, next) {
  try {
    const updatedBuyer = await buyerService.updateBuyerMapSettings(
      req.user.id,
      req.validatedBody
    );
    return apiResponse.success(
      res,
      {
        message: 'Map listing and location settings updated successfully.',
        buyer: updatedBuyer,
      },
      null,
      200
    );
  } catch (err) {
    next(err);
  }
}

async function adminVerifyBuyer(req, res, next) {
  try {
    const updatedBuyer = await buyerService.adminVerifyBuyer(
      req.params.id,
      req.validatedBody
    );
    return apiResponse.success(
      res,
      {
        message: 'Buyer verification status updated.',
        buyer: updatedBuyer,
      },
      null,
      200
    );
  } catch (err) {
    next(err);
  }
}

async function contactBuyer(req, res, next) {
  try {
    const contactInfo = await buyerService.contactBuyer(
      req.user.id,
      req.params.id
    );
    return apiResponse.success(res, contactInfo, null, 200);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getNearby,
  updateMapSettings,
  adminVerifyBuyer,
  contactBuyer,
};
