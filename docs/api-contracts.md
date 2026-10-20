# FasalRakshak AI — API Contracts & Specifications

This document defines the REST API contract for the **Express Backend** (`/api/v1`) and the private **FastAPI ML Service** interface.

---

## 1. Global Conventions

### Base URLs
- **Backend API:** `http://<host>:5000/api/v1`
- **ML Quality Service (Internal):** `http://<host>:8000/api/v1`

### Standard Response Envelope
All API endpoints return JSON conforming to the standard envelope format:

#### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Harvested quantity must be greater than zero.",
    "details": [
      {
        "field": "harvestedQty",
        "issue": "Must be a positive number"
      }
    ],
    "timestamp": "2026-10-20T23:55:00.000Z"
  }
}
```

### Standard Error Codes
| HTTP Status | Error Code | Description |
| :--- | :--- | :--- |
| `400` | `INVALID_INPUT` | Request body or query parameters failed schema validation. |
| `401` | `UNAUTHORIZED` | Missing, invalid, or expired JWT token. |
| `403` | `FORBIDDEN` | Authenticated user lacks permission to access or modify resource. |
| `404` | `NOT_FOUND` | Requested entity does not exist. |
| `409` | `CONFLICT` | State conflict (e.g., duplicate order, overselling stock, duplicate idempotency key). |
| `422` | `UNPROCESSABLE_ENTITY` | Semantic business rule violation (e.g., negative net return when disallowed). |
| `500` | `INTERNAL_SERVER_ERROR` | Unexpected system failure; logs redacted of sensitive data. |
| `503` | `SERVICE_UNAVAILABLE` | External service (ML engine, MongoDB Atlas) temporarily unreachable. |

---

## 2. Authentication & User Profile (`/auth`)

### POST `/api/v1/auth/register`
Register a new farmer or buyer account.
- **Request Body:**
  ```json
  {
    "name": "Rajesh Kumar",
    "phone": "+919876543210",
    "password": "SecurePassword123!",
    "role": "FARMER",
    "location": {
      "state": "Maharashtra",
      "district": "Nashik",
      "taluka": "Niphad",
      "village": "Pimpalgaon",
      "coordinates": [73.987, 20.174]
    },
    "preferences": {
      "minAcceptablePricePerKg": 18,
      "maxTransportCostPerKm": 4,
      "allowPartialAllocations": true
    }
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "usr_6715f01",
        "name": "Rajesh Kumar",
        "phone": "+919876543210",
        "role": "FARMER"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

### POST `/api/v1/auth/login`
Authenticate with phone number and password.
- **Request Body:**
  ```json
  {
    "phone": "+919876543210",
    "password": "SecurePassword123!"
  }
  ```
- **Response `200 OK`:** Same structure as register.

### GET `/api/v1/auth/me`
Retrieve currently authenticated farmer profile.
- **Headers:** `Authorization: Bearer <jwt_token>`
- **Response `200 OK`:** Profile details and operational preferences.

---

## 3. Harvest & Quality Assessment (`/harvests`)

### POST `/api/v1/harvests`
Register a new harvested batch.
- **Headers:** `Authorization: Bearer <jwt_token>`
- **Request Body:**
  ```json
  {
    "cropType": "TOMATO",
    "variety": "Vaishali",
    "harvestedQty": 500,
    "unit": "KG",
    "harvestDate": "2026-10-20T06:00:00.000Z",
    "spoilageDeadline": "2026-10-24T18:00:00.000Z",
    "storageLocation": "Farm Storehouse 1",
    "minPricePerKg": 20
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "success": true,
    "data": {
      "id": "hrv_982341",
      "cropType": "TOMATO",
      "variety": "Vaishali",
      "harvestedQty": 500,
      "availableQty": 500,
      "reservedQty": 0,
      "committedQty": 0,
      "deliveredQty": 0,
      "lostQty": 0,
      "qualityGrade": "PENDING_ASSESSMENT",
      "status": "AVAILABLE"
    }
  }
  ```

### GET `/api/v1/harvests`
List harvests belonging to the authenticated farmer.
- **Query Params:** `status=AVAILABLE&cropType=TOMATO&page=1&limit=20`

### POST `/api/v1/harvests/:id/assess`
Upload an image of the crop to trigger ML quality assessment.
- **Content-Type:** `multipart/form-data`
- **Form Fields:** `image` (binary, JPEG/PNG/WebP, max 10MB)
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "assessmentId": "qa_55102",
      "harvestId": "hrv_982341",
      "qualityGrade": "GRADE_A",
      "ripenessStage": "TURNING_TO_PINK",
      "confidence": 0.94,
      "visibleCondition": {
        "blemishPercentage": 4.2,
        "bruisingDetected": false,
        "shrivelingDetected": false
      },
      "reviewRequired": false,
      "assessedAt": "2026-10-20T23:56:00.000Z",
      "modelInfo": {
        "modelName": "MockInferenceAdapter",
        "modelVersion": "1.0.0-dev",
        "isMock": true
      }
    }
  }
  ```

---

## 4. Buyers, Offers & Orders (`/buyers`, `/offers`, `/orders`)

### GET `/api/v1/offers`
Discover active buyer bids matching crop type and location.
- **Query Params:** `cropType=TOMATO&minQty=100&status=ACTIVE`
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "off_4401",
        "buyerId": "byr_101",
        "buyerName": "Nashik Agro Processing Ltd",
        "buyerLocation": "Nashik MIDC",
        "distanceKm": 24,
        "cropType": "TOMATO",
        "acceptedGrades": ["GRADE_A", "GRADE_B"],
        "offeredPricePerKg": 24.50,
        "minQty": 200,
        "maxQty": 1000,
        "validUntil": "2026-10-22T12:00:00.000Z",
        "estimatedTransportCost": 450,
        "isSimulated": true
      }
    ]
  }
  ```

### POST `/api/v1/orders`
Allocate harvest stock and create an order with a buyer.
- **Request Body:**
  ```json
  {
    "harvestId": "hrv_982341",
    "offerId": "off_4401",
    "allocatedQty": 300,
    "deliveryDeadline": "2026-10-21T16:00:00.000Z"
  }
  ```
- **Response `201 Created`:** Order details with status `CONFIRMED` and `inventoryAllocationId`.

---

## 5. Disruption Intake & Deterministic Recovery (`/disruptions`, `/recovery`)

### POST `/api/v1/disruptions/intake`
Record a disruption event (e.g., buyer cancellation, truck breakdown).
- **Request Body:**
  ```json
  {
    "idempotencyKey": "evt_disrupt_20261020_001",
    "eventType": "BUYER_CANCELLATION",
    "affectedOrderId": "ord_77102",
    "reason": "Buyer Nashik Agro cancelled due to processing unit cold-storage maintenance.",
    "reportedAt": "2026-10-20T23:57:00.000Z"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "disruptionId": "dis_1109",
      "status": "PROCESSED",
      "releasedQty": 300,
      "harvestId": "hrv_982341",
      "availableQtyNow": 500,
      "recoveryPlanId": "rec_8841"
    }
  }
  ```

### GET `/api/v1/recovery/:id`
Fetch the deterministic recovery plan generated for a disruption.
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "id": "rec_8841",
      "disruptionId": "dis_1109",
      "status": "AWAITING_FARMER_APPROVAL",
      "affectedStockQty": 300,
      "candidates": [
        {
          "rank": 1,
          "buyerId": "byr_105",
          "buyerName": "Siddhivinayak APMC Mandi",
          "buyerLocation": "Pimpalgaon Baswant",
          "distanceKm": 14,
          "allocatedQty": 300,
          "offeredPricePerKg": 23.00,
          "grossRevenue": 6900,
          "transportCost": 280,
          "packagingCost": 150,
          "platformFee": 69,
          "netReturn": 6401,
          "isFeasible": true,
          "decisionReason": "Highest net return among valid Grade-A buyers within 25km radius."
        },
        {
          "rank": 2,
          "buyerId": "byr_108",
          "buyerName": "Sahyadri Farmers Co-op",
          "distanceKm": 38,
          "allocatedQty": 300,
          "offeredPricePerKg": 24.00,
          "grossRevenue": 7200,
          "transportCost": 950,
          "packagingCost": 150,
          "platformFee": 72,
          "netReturn": 6028,
          "isFeasible": true,
          "decisionReason": "Higher gross price but higher transport cost reduces net return."
        }
      ],
      "rejectedCandidates": [
        {
          "buyerName": "Pune Wholesale Market",
          "rejectionReason": "Transport distance exceeds maximum transit time before spoilage deadline."
        }
      ],
      "isSimulated": true
    }
  }
  ```

### POST `/api/v1/recovery/:id/authorize`
Execute farmer's authorized recovery decision.
- **Request Body:**
  ```json
  {
    "selectedCandidateRank": 1,
    "farmerConfirmation": true
  }
  ```
- **Response `200 OK`:** Creates new replacement order, locks the allocation, creates delivery job, logs audit entry.

---

## 6. AI Assistant Orchestration (`/assistant`)

### POST `/api/v1/assistant/chat`
Submit farmer query or audio transcription for tool interpretation and explanation.
- **Request Body:**
  ```json
  {
    "message": "Buyer cancelled my tomato delivery. What is my best option?",
    "harvestId": "hrv_982341"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "intent": "RECOVERY_OPTIONS_QUERY",
      "toolExecuted": "get_recovery_plan",
      "summaryHindi": "नाशिक ॲग्रोने ऑर्डर रद्द केली आहे. तुमच्या 300 किलो टोमॅटोसाठी पिंपळगाव बसवंत मंडी सर्वोत्तम पर्याय आहे, ज्यातून तुम्हाला ₹6,401 निव्वळ परतावा मिळेल.",
      "summaryEnglish": "Nashik Agro cancelled the order. Siddhivinayak APMC Mandi is your highest-return option for 300 kg tomatoes, providing a net return of ₹6,401.",
      "actionPayload": {
        "recoveryPlanId": "rec_8841"
      }
    }
  }
  ```

---

## 7. Python ML Service Contract (`FastAPI`)

The ML microservice runs privately on port `8000`.

### GET `/health`
Check service and model readiness.
- **Response `200 OK`:**
  ```json
  {
    "status": "ok",
    "model_loaded": true,
    "model_name": "MockInferenceAdapter",
    "version": "1.0.0-dev",
    "is_mock": true,
    "timestamp": "2026-10-20T23:58:00.000Z"
  }
  ```

### POST `/api/v1/assess-crop`
Analyze tomato image for visible ripeness and blemish indicators.
- **Headers:** `X-Service-Api-Key: <secret>`
- **Content-Type:** `multipart/form-data`
- **Form Parameters:**
  - `file`: Image file (required; JPEG/PNG/WebP, max 10MB).
  - `crop_type`: `TOMATO` (required string).
- **Response `200 OK`:**
  ```json
  {
    "assessment_id": "qa_ml_99210",
    "crop_type": "TOMATO",
    "ripeness_stage": "TURNING_TO_PINK",
    "quality_grade": "GRADE_A",
    "confidence": 0.94,
    "blemish_percentage": 4.2,
    "bruising_detected": false,
    "shriveling_detected": false,
    "uncertainty_score": 0.06,
    "review_required": false,
    "model_name": "MockInferenceAdapter",
    "model_version": "1.0.0-dev",
    "is_mock": true,
    "processed_at": "2026-10-20T23:58:05.120Z"
  }
  ```
- **Error Response `400 Bad Request`:**
  ```json
  {
    "detail": "Invalid image format. Supported formats are: JPEG, PNG, WEBP."
  }
  ```
