/**
 * FasalRakshak AI — Authentication Business Service
 * Encapsulates password hashing, role lockdown, token creation, and credentials verification.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

const BCRYPT_SALT_ROUNDS = 10;

/**
 * Generate signed JWT access token containing only non-sensitive identity claims
 */
function generateToken(user) {
  const payload = {
    id: user._id.toString(),
    role: user.role,
    status: user.status,
  };

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

/**
 * Register a new user
 * Security Rule: Admin accounts CANNOT be created via public registration.
 */
async function registerUser(userData) {
  const {
    name,
    phone,
    email,
    password,
    role = 'farmer',
    language = 'mr',
    location,
    farmerProfile,
    buyerProfile,
  } = userData;

  // Security lockdown: Admin role is prohibited from public signup
  if (role === 'admin') {
    const error = new Error('Admin registration via public API is forbidden. Admins must be provisioned via seed.');
    error.statusCode = 403;
    error.code = 'FORBIDDEN_ROLE_ASSIGNMENT';
    throw error;
  }

  if (!['farmer', 'buyer'].includes(role)) {
    const error = new Error('Invalid registration role. Allowed roles: farmer, buyer.');
    error.statusCode = 400;
    error.code = 'INVALID_ROLE';
    throw error;
  }

  if (!password || password.length < 6) {
    const error = new Error('Password must be at least 6 characters long.');
    error.statusCode = 400;
    error.code = 'INVALID_PASSWORD_LENGTH';
    throw error;
  }

  // Check phone uniqueness
  const existingPhone = await User.findOne({ phone });
  if (existingPhone) {
    const error = new Error('A user with this mobile number is already registered.');
    error.statusCode = 409;
    error.code = 'PHONE_ALREADY_EXISTS';
    throw error;
  }

  // Check email uniqueness if email provided
  if (email) {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      const error = new Error('A user with this email address is already registered.');
      error.statusCode = 409;
      error.code = 'EMAIL_ALREADY_EXISTS';
      throw error;
    }
  }

  // Hash password with minimum cost 10
  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  // Construct user document
  const user = new User({
    name,
    phone,
    email: email || undefined,
    passwordHash,
    role,
    language,
    location: location || { type: 'Point', coordinates: [73.8567, 18.5204] },
    farmerProfile: role === 'farmer' ? farmerProfile : undefined,
    buyerProfile: role === 'buyer' ? buyerProfile : undefined,
  });

  await user.save();

  const token = generateToken(user);
  return {
    user: user.toSafeObject(),
    token,
  };
}

/**
 * Authenticate user with credentials
 * Security Rule: Always return generic error ("Invalid credentials") to prevent user enumeration.
 */
async function loginUser({ identifier, password }) {
  if (!identifier || !password) {
    const error = new Error('Identifier (phone or email) and password are required.');
    error.statusCode = 400;
    error.code = 'MISSING_CREDENTIALS';
    throw error;
  }

  // Look up user by phone or email, explicitly requesting passwordHash
  const query = identifier.includes('@')
    ? { email: identifier.toLowerCase().trim() }
    : { phone: identifier.trim() };

  const user = await User.findOne(query).select('+passwordHash');

  // Generic credential rejection
  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  // Verify account status
  if (user.status === 'suspended') {
    const error = new Error('Your account has been suspended. Please contact platform support.');
    error.statusCode = 403;
    error.code = 'ACCOUNT_SUSPENDED';
    throw error;
  }

  // Constant-time password comparison
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const token = generateToken(user);
  return {
    user: user.toSafeObject(),
    token,
  };
}

module.exports = {
  registerUser,
  loginUser,
  generateToken,
};
