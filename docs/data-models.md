# FasalRakshak AI — Data Models & Schema Specifications

This document outlines the data schemas, indexes, status enums, and state transitions for the 12 core domain models in Mongoose/MongoDB.

---

## 1. User (`users`)
Represents registered farmers, verified buyers, and system administrators.

```javascript
{
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['FARMER', 'BUYER', 'ADMIN'], 
    default: 'FARMER', 
    required: true 
  },
  location: {
    state: { type: String, required: true },
    district: { type: String, required: true },
    taluka: { type: String, required: true },
    village: { type: String, required: true },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  preferences: {
    minAcceptablePricePerKg: { type: Number, default: 15, min: 1 },
    maxTransportCostPerKm: { type: Number, default: 5, min: 0 },
    allowPartialAllocations: { type: Boolean, default: true },
    preferredNotificationChannel: { 
      type: String, 
      enum: ['IN_APP', 'SMS', 'WHATSAPP'], 
      default: 'IN_APP' 
    }
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

---

## 2. Harvest (`harvests`)
The central inventory record for a harvested crop batch.

```javascript
{
  farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  cropType: { 
    type: String, 
    enum: ['TOMATO', 'ONION', 'POTATO', 'CHILLI'], 
    required: true 
  },
  variety: { type: String, default: 'Standard' },
  harvestDate: { type: Date, required: true },
  spoilageDeadline: { type: Date, required: true },
  storageLocation: { type: String, required: true },
  minPricePerKg: { type: Number, required: true, min: 1 },

  // Inventory Accounting Ledger (in KG)
  harvestedQty: { type: Number, required: true, min: 1 },
  availableQty: { type: Number, required: true, min: 0 },
  reservedQty: { type: Number, default: 0, min: 0 },
  committedQty: { type: Number, default: 0, min: 0 },
  deliveredQty: { type: Number, default: 0, min: 0 },
  lostQty: { type: Number, default: 0, min: 0 },

  // Assessment & Status
  qualityGrade: { 
    type: String, 
    enum: ['PENDING_ASSESSMENT', 'GRADE_A', 'GRADE_B', 'GRADE_C', 'REJECTED'], 
    default: 'PENDING_ASSESSMENT' 
  },
  latestAssessmentId: { type: Schema.Types.ObjectId, ref: 'QualityAssessment' },
  status: { 
    type: String, 
    enum: ['AVAILABLE', 'PARTIALLY_ALLOCATED', 'FULLY_COMMITTED', 'COMPLETED', 'EXPIRED'], 
    default: 'AVAILABLE',
    index: true
  },
  version: { type: Number, default: 0 }, // For optimistic concurrency
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```
**Invariant:** `availableQty = harvestedQty - reservedQty - committedQty - deliveredQty - lostQty`

---

## 3. QualityAssessment (`quality_assessments`)
Visual crop quality findings returned by the ML service.

```javascript
{
  harvestId: { type: Schema.Types.ObjectId, ref: 'Harvest', required: true, index: true },
  imageUrl: { type: String, required: true },
  cropType: { type: String, default: 'TOMATO' },
  qualityGrade: { 
    type: String, 
    enum: ['GRADE_A', 'GRADE_B', 'GRADE_C', 'REJECTED'], 
    required: true 
  },
  ripenessStage: { 
    type: String, 
    enum: ['GREEN', 'BREAKER', 'TURNING_TO_PINK', 'LIGHT_RED', 'RED_RIPE', 'OVER_RIPE'], 
    required: true 
  },
  confidence: { type: Number, required: true, min: 0, max: 1 },
  visibleCondition: {
    blemishPercentage: { type: Number, default: 0 },
    bruisingDetected: { type: Boolean, default: false },
    shrivelingDetected: { type: Boolean, default: false }
  },
  uncertaintyScore: { type: Number, default: 0 },
  reviewRequired: { type: Boolean, default: false },
  modelInfo: {
    modelName: { type: String, required: true },
    modelVersion: { type: String, required: true },
    isMock: { type: Boolean, default: false }
  },
  assessedAt: { type: Date, default: Date.now }
}
```

---

## 4. Buyer (`buyers`)
Commercial entities offering to purchase harvested produce.

```javascript
{
  name: { type: String, required: true },
  businessType: { 
    type: String, 
    enum: ['APMC_COMMISSION_AGENT', 'FOOD_PROCESSOR', 'RETAIL_CHAIN', 'WHOLESALE_TRADER', 'LOCAL_VENDOR'], 
    required: true 
  },
  location: {
    facilityName: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    coordinates: { type: [Number], index: '2dsphere' }
  },
  contactPhone: { type: String, required: true },
  acceptedCrops: [{ type: String }],
  dailyIntakeCapacityKg: { type: Number, required: true },
  paymentTerms: { 
    type: String, 
    enum: ['IMMEDIATE_CASH', 'SAME_DAY_UPI', 'NET_3_DAYS', 'NET_7_DAYS'], 
    default: 'SAME_DAY_UPI' 
  },
  isVerified: { type: Boolean, default: true },
  isSimulated: { type: Boolean, default: false }
}
```

---

## 5. Offer (`offers`)
Open bids from buyers specifying grade, price, and quantity limits.

```javascript
{
  buyerId: { type: Schema.Types.ObjectId, ref: 'Buyer', required: true, index: true },
  cropType: { type: String, required: true },
  acceptedGrades: [{ type: String, enum: ['GRADE_A', 'GRADE_B', 'GRADE_C'] }],
  offeredPricePerKg: { type: Number, required: true, min: 1 },
  minQuantityKg: { type: Number, required: true, min: 1 },
  maxQuantityKg: { type: Number, required: true },
  validFrom: { type: Date, default: Date.now },
  validUntil: { type: Date, required: true, index: true },
  status: { 
    type: String, 
    enum: ['ACTIVE', 'PAUSED', 'FULFILLED', 'EXPIRED'], 
    default: 'ACTIVE',
    index: true
  },
  isSimulated: { type: Boolean, default: false }
}
```

---

## 6. Order (`orders`)
Contractual agreement linking a farmer's harvest to a buyer's offer.

```javascript
{
  orderNumber: { type: String, required: true, unique: true },
  farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  buyerId: { type: Schema.Types.ObjectId, ref: 'Buyer', required: true },
  harvestId: { type: Schema.Types.ObjectId, ref: 'Harvest', required: true },
  offerId: { type: Schema.Types.ObjectId, ref: 'Offer', required: true },
  allocatedQtyKg: { type: Number, required: true, min: 1 },
  pricePerKg: { type: Number, required: true },
  grossTotal: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'CONFIRMED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'], 
    default: 'PENDING',
    index: true
  },
  cancellationReason: { type: String },
  deliveryDeadline: { type: Date, required: true },
  isSimulated: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

---

## 7. InventoryAllocation (`inventory_allocations`)
Tracks stock reservation for orders to prevent overselling and race conditions.

```javascript
{
  harvestId: { type: Schema.Types.ObjectId, ref: 'Harvest', required: true, index: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
  allocatedQty: { type: Number, required: true, min: 1 },
  status: { 
    type: String, 
    enum: ['RESERVED', 'COMMITTED', 'DISPATCHED', 'RELEASED'], 
    default: 'RESERVED' 
  },
  releasedAt: { type: Date },
  releaseReason: { type: String }
}
```

---

## 8. Delivery (`deliveries`)
Manages transport assignment, vehicle details, and route progress.

```javascript
{
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  vehicleType: { 
    type: String, 
    enum: ['MINI_TRUCK_PICKUP', 'TEMPO_407', 'REEFER_COLD_VAN', 'TRACTOR_TROLLEY'], 
    required: true 
  },
  vehicleCapacityKg: { type: Number, required: true },
  driverName: { type: String, required: true },
  driverPhone: { type: String, required: true },
  transportCost: { type: Number, required: true },
  distanceKm: { type: Number, required: true },
  estimatedTransitMinutes: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['SCHEDULED', 'PICKED_UP', 'IN_TRANSIT', 'VEHICLE_BREAKDOWN', 'DELIVERED', 'FAILED'], 
    default: 'SCHEDULED' 
  },
  isSimulated: { type: Boolean, default: false }
}
```

---

## 9. DisruptionEvent (`disruption_events`)
Intake log for supply chain shocks with idempotency protection.

```javascript
{
  idempotencyKey: { type: String, required: true, unique: true, index: true },
  eventType: { 
    type: String, 
    enum: ['BUYER_CANCELLATION', 'VEHICLE_BREAKDOWN', 'PRICE_CRASH_ALERT', 'ROUTE_BLOCKED'], 
    required: true 
  },
  affectedOrderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  affectedHarvestId: { type: Schema.Types.ObjectId, ref: 'Harvest', required: true },
  affectedStockQty: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['RECEIVED', 'STOCK_RELEASED', 'RECOVERY_GENERATED', 'RESOLVED', 'FAILED'], 
    default: 'RECEIVED' 
  },
  recoveryPlanId: { type: Schema.Types.ObjectId, ref: 'RecoveryPlan' },
  isSimulated: { type: Boolean, default: false },
  occurredAt: { type: Date, default: Date.now },
  processedAt: { type: Date }
}
```

---

## 10. RecoveryPlan (`recovery_plans`)
Structured recovery candidates calculated by the deterministic engine.

```javascript
{
  disruptionId: { type: Schema.Types.ObjectId, ref: 'DisruptionEvent', required: true, index: true },
  harvestId: { type: Schema.Types.ObjectId, ref: 'Harvest', required: true },
  version: { type: Number, default: 1 },
  affectedStockQty: { type: Number, required: true },
  candidates: [{
    rank: { type: Number, required: true },
    buyerId: { type: Schema.Types.ObjectId, ref: 'Buyer', required: true },
    buyerName: { type: String, required: true },
    buyerLocation: { type: String, required: true },
    distanceKm: { type: Number, required: true },
    allocatedQty: { type: Number, required: true },
    offeredPricePerKg: { type: Number, required: true },
    grossRevenue: { type: Number, required: true },
    transportCost: { type: Number, required: true },
    packagingCost: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
    netReturn: { type: Number, required: true },
    isFeasible: { type: Boolean, default: true },
    decisionReason: { type: String, required: true }
  }],
  rejectedCandidates: [{
    buyerName: { type: String, required: true },
    rejectionReason: { type: String, required: true }
  }],
  status: { 
    type: String, 
    enum: ['AWAITING_FARMER_APPROVAL', 'APPROVED', 'REJECTED_BY_FARMER', 'NO_FEASIBLE_PLAN', 'SUPERSEDED'], 
    default: 'AWAITING_FARMER_APPROVAL' 
  },
  chosenCandidateRank: { type: Number },
  replacementOrderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  approvedAt: { type: Date },
  isSimulated: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}
```

---

## 11. AuditLog (`audit_logs`)
Tamper-evident append-only history of every inventory change and recovery decision.

```javascript
{
  entityType: { 
    type: String, 
    enum: ['HARVEST', 'ORDER', 'INVENTORY_ALLOCATION', 'DISRUPTION', 'RECOVERY_PLAN'], 
    required: true, 
    index: true 
  },
  entityId: { type: Schema.Types.ObjectId, required: true, index: true },
  action: { 
    type: String, 
    enum: ['CREATE', 'UPDATE', 'ALLOCATE', 'RELEASE', 'CANCEL', 'AUTHORIZE_RECOVERY'], 
    required: true 
  },
  performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  stateBefore: { type: Schema.Types.Mixed },
  stateAfter: { type: Schema.Types.Mixed },
  metadata: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now, index: true }
}
```

---

## 12. Notification (`notifications`)
Actionable alerts delivered to the farmer's mobile interface.

```javascript
{
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  priority: { 
    type: String, 
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], 
    default: 'MEDIUM' 
  },
  category: { 
    type: String, 
    enum: ['DISRUPTION_ALERT', 'RECOVERY_PROPOSAL', 'ORDER_STATUS', 'QUALITY_RESULT'], 
    required: true 
  },
  actionUrl: { type: String }, // e.g. "/recovery?planId=rec_8841"
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
}
```
