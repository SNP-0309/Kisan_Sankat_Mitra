/**
 * FasalRakshak AI — Order Domain Model
 * Contractual agreements linking harvests to buyers with lifecycle transitions.
 */

const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    buyerName: {
      type: String,
      required: true,
    },
    buyerLocation: {
      type: String,
      default: 'Pune APMC Mandi',
    },
    buyerContact: {
      type: String,
      default: '9822012345',
    },
    harvestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Harvest',
      required: true,
      index: true,
    },
    cropType: {
      type: String,
      default: 'TOMATO',
    },
    allocatedQtyKg: {
      type: Number,
      required: true,
      min: 1,
    },
    pricePerKg: {
      type: Number,
      required: true,
      min: 1,
    },
    grossTotal: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'],
      default: 'CONFIRMED',
      index: true,
    },
    cancellationReason: {
      type: String,
      default: null,
    },
    isSimulated: {
      type: Boolean,
      default: true,
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

OrderSchema.index({ farmerId: 1, status: 1 });
OrderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', OrderSchema);
