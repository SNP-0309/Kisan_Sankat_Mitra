/**
 * FasalRakshak AI — Shop & Mandi Domain Model
 * Stores physical agricultural market destinations with 2dsphere location coordinates.
 */

const mongoose = require('mongoose');

const ShopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['mandi', 'cold_storage', 'input_shop', 'market', 'processor'],
      required: true,
      index: true,
    },
    address: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
      default: 'Pune',
    },
    state: {
      type: String,
      default: 'Maharashtra',
    },
    phone: {
      type: String,
      required: true,
    },
    openHours: {
      type: String,
      default: '06:00 AM - 04:00 PM',
    },
    verified: {
      type: Boolean,
      default: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    dailyCapacityKg: {
      type: Number,
      default: 5000,
    },
    typicalOfferedPricePerKg: {
      type: Number,
      default: 20,
    },
    isDemo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

ShopSchema.index({ location: '2dsphere' });
ShopSchema.index({ type: 1, verified: 1 });

module.exports = mongoose.model('Shop', ShopSchema);
