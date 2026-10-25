/**
 * FasalRakshak AI — Authentication Controller
 * Handles HTTP transport, parameters, and standardized envelopes.
 */

const authService = require('../services/authService');
const User = require('../models/User');
const { sendSuccess } = require('../utils/apiResponse');

async function register(req, res, next) {
  try {
    const result = await authService.registerUser(req.body);
    return sendSuccess(res, result, 'User registered successfully', 201);
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

    return sendSuccess(res, result, 'Login successful', 200);
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User profile not found.',
          timestamp: new Date().toISOString(),
        },
      });
    }

    return sendSuccess(res, { user: user.toSafeObject() }, 'Profile retrieved successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  getMe,
};
