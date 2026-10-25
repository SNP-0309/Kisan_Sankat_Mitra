/**
 * FasalRakshak AI — User Domain Model
 * Supports multi-role identities (Farmer, Buyer, Admin) with GeoJSON indexing.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const GeoPointSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      default: [73.8567, 18.5204], // Default coordinates (Pune, Maharashtra)
    },
  },
  { _id: false }
);

const FarmerProfileSchema = new mongoose.Schema(
  {
    village: { type: String, trim: true, default: '' },
    district: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: 'Maharashtra' },
    farmSizeAcres: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const BuyerProfileSchema = new mongoose.Schema(
  {
    businessName: { type: String, trim: true, default: '' },
    businessType: {
      type: String,
      enum: ['trader', 'retailer', 'processor', 'other'],
      default: 'trader',
    },
    gstNumber: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'],
      index: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // Allows null/missing emails without uniqueness collision
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false, // Never return password hash in queries by default
    },
    role: {
      type: String,
      enum: {
        values: ['farmer', 'buyer', 'admin'],
        message: 'Role must be farmer, buyer, or admin',
      },
      default: 'farmer',
      required: true,
      index: true,
    },
    language: {
      type: String,
      enum: ['en', 'hi', 'mr'],
      default: 'mr', // Marathi default for Maharashtra regional deployment
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
      index: true,
    },
    location: {
      type: GeoPointSchema,
      default: () => ({ type: 'Point', coordinates: [73.8567, 18.5204] }),
    },
    farmerProfile: {
      type: FarmerProfileSchema,
      default: () => ({}),
    },
    buyerProfile: {
      type: BuyerProfileSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for performant queries
UserSchema.index({ location: '2dsphere' });
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ createdAt: -1 });

/**
 * Compare plain candidate password with stored bcrypt hash
 */
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

/**
 * Sanitize user object to remove sensitive attributes before sending to clients
 */
UserSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
