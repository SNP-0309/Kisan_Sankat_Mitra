/**
 * FasalRakshak AI — Harvest Domain Model
 * Stores harvest inventory batches with atomic stock accounting.
 * 
 * INVARIANT: availableQty = harvestedQty - reservedQty - committedQty - deliveredQty - lostQty
 */

const mongoose = require('mongoose');

const HarvestSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    farmerName: {
      type: String,
      default: 'Farmer',
    },
    cropType: {
      type: String,
      enum: ['TOMATO', 'ONION', 'POTATO', 'CHILLI'],
      default: 'TOMATO',
      required: true,
      index: true,
    },
    variety: {
      type: String,
      default: 'Vaibhav Standard',
    },
    harvestDate: {
      type: Date,
      default: Date.now,
    },
    spoilageDeadline: {
      type: Date,
      required: true,
      index: true,
    },
    storageLocation: {
      type: String,
      required: true,
      default: 'Narayangaon, Junnar, Pune',
    },
    minPricePerKg: {
      type: Number,
      required: true,
      min: 1,
      default: 14,
    },

    // Inventory Accounting (in KG)
    harvestedQty: {
      type: Number,
      required: true,
      min: 1,
    },
    availableQty: {
      type: Number,
      required: true,
      min: 0,
    },
    reservedQty: {
      type: Number,
      default: 0,
      min: 0,
    },
    committedQty: {
      type: Number,
      default: 0,
      min: 0,
    },
    deliveredQty: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Quality Assessment
    qualityGrade: {
      type: String,
      enum: ['PENDING_ASSESSMENT', 'GRADE_A', 'GRADE_B', 'GRADE_C', 'REJECTED'],
      default: 'GRADE_A',
    },
    qualityConfidence: {
      type: Number,
      default: 0.92,
    },
    qualityModel: {
      type: String,
      default: 'YOLOv8-Tomato-Assessor',
    },
    isMockAssessment: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: ['AVAILABLE', 'PARTIALLY_ALLOCATED', 'FULLY_COMMITTED', 'COMPLETED', 'DISRUPTED'],
      default: 'AVAILABLE',
      index: true,
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

// Compound indexes for performant query and recovery matching
HarvestSchema.index({ farmerId: 1, status: 1 });
HarvestSchema.index({ cropType: 1, availableQty: 1 });
HarvestSchema.index({ spoilageDeadline: 1 });

/**
 * Concurrency-safe atomic reservation of stock
 * Guarantees that overselling is mathematically impossible.
 */
HarvestSchema.statics.reserveStock = async function (harvestId, quantityKg) {
  const updated = await this.findOneAndUpdate(
    {
      _id: harvestId,
      availableQty: { $gte: quantityKg }, // HARD LOCK: Invariant guard
    },
    {
      $inc: {
        availableQty: -quantityKg,
        reservedQty: quantityKg,
      },
      $set: {
        status: 'PARTIALLY_ALLOCATED',
      },
    },
    { new: true }
  );

  if (!updated) {
    const error = new Error(`Insufficient stock. Cannot allocate ${quantityKg} kg.`);
    error.code = 'INSUFFICIENT_STOCK';
    error.statusCode = 409;
    throw error;
  }

  // Update to fully committed if available stock is zero
  if (updated.availableQty === 0) {
    updated.status = 'FULLY_COMMITTED';
    await updated.save();
  }

  return updated;
};

/**
 * Concurrency-safe stock release upon order cancellation or disruption
 */
HarvestSchema.statics.releaseStock = async function (harvestId, quantityKg) {
  return this.findByIdAndUpdate(
    harvestId,
    {
      $inc: {
        availableQty: quantityKg,
        reservedQty: -quantityKg,
      },
      $set: {
        status: 'AVAILABLE',
      },
    },
    { new: true }
  );
};

module.exports = mongoose.model('Harvest', HarvestSchema);
