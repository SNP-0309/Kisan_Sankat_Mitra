/**
 * FasalRakshak AI — Authentication Controller
 * Handles HTTP transport, parameters, and standardized envelopes.
 */

const authService = require('../services/authService');
const User = require('../models/User');
const apiResponse = require('../utils/apiResponse');

async function register(req, res, next) {
  try {
    const result = await authService.registerUser(req.body);
    return apiResponse.success(res, result, null, 201);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { identifier, phone, email, password } = req.body;
    const loginIdentifier = identifier || phone || email;

    const result = await authService.loginUser({
      identifier: loginIdentifier,
      password,
    });

    return apiResponse.success(res, result, null, 200);
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return apiResponse.error(
        res,
        'USER_NOT_FOUND',
        'User profile not found.',
        null,
        404
      );
    }

    return apiResponse.success(res, { user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  getMe,
};
