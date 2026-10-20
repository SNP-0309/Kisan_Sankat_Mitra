# FasalRakshak AI (फसल रक्षक) — System Architecture

**Tagline:** "When plans fail, we find the next move."

---

## 1. System Vision & Objective

FasalRakshak AI is an intelligent farm-to-market recovery system and native mobile application. When buyers cancel orders, transport vehicles break down, or delivery plans become infeasible, FasalRakshak AI steps in to:
1. Maintain accurate, concurrency-safe harvest inventory accounting.
2. Evaluate real, non-fabricated alternative buyer offers and transport routes.
3. Calculate transparent net returns (Offer Revenue - Transport - Packaging - Platform Fees).
4. Verify candidate recovery plans against strict farmer constraints.
5. Execute only actions explicitly authorized by the farmer.

---

## 2. High-Level Architecture Diagram

```
┌────────────────────────────────────────────────────────┐
│             Mobile Client (React Native + Expo)        │
│             JavaScript / JSX (Expo Router)             │
│                                                        │
│  - Farmer Dashboard         - Harvest Registration     │
│  - Quality Assessment View  - Buyer Marketplace        │
│  - Order & Delivery Tracking - Disruption Intake Form  │
│  - Recovery Plan Comparison - Audit History Timeline   │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ HTTPS / REST API (/api/v1)
                            │ Bearer JWT Authentication
                            ▼
┌────────────────────────────────────────────────────────┐
│             Backend API (Node.js + Express)            │
│                                                        │
│  ┌───────────────────────┐  ┌───────────────────────┐  │
│  │ Auth & Ownership      │  │ Inventory Accounting  │  │
│  │ Middleware            │  │ (Concurrency-Safe)    │  │
│  └───────────────────────┘  └───────────────────────┘  │
│  ┌───────────────────────┐  ┌───────────────────────┐  │
│  │ Disruption Processor  │  │ Deterministic         │  │
│  │ & Idempotency         │  │ Recovery Engine       │  │
│  └───────────────────────┘  └───────────────────────┘  │
│  ┌───────────────────────┐  ┌───────────────────────┐  │
│  │ AI Orchestration      │  │ Audit Logging &       │  │
│  │ (Gemini Tool Sandboxing│ │ Notifications         │  │
│  └───────────────────────┘  └───────────────────────┘  │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               │ Mongoose                 │ Private Service Interface
               ▼                          │ (API Key Auth + JSON)
┌─────────────────────────────┐           ▼
│      MongoDB Database       │ ┌─────────────────────────────┐
│                             │ │ Python ML Quality Service   │
│  - Users & Profiles         │ │ (FastAPI + YOLO Inference)  │
│  - Harvests & Assessments   │ │                             │
│  - Buyers & Offers          │ │  - Image Validation         │
│  - Orders & Allocations     │ │  - Ripeness Classification  │
│  - Deliveries & Disruptions │ │  - Visible Blemish Detection│
│  - Recovery Plans & Audits  │ │  - Uncertainty Scoring      │
└─────────────────────────────┘ └─────────────────────────────┘
```

---

## 3. Communication & Security Boundaries

1. **Client Isolation:** The mobile client communicates exclusively with the Express backend via `/api/v1`. It never communicates directly with MongoDB, the Python ML service, or LLM providers.
2. **Secret Management:** LLM API keys (`GEMINI_API_KEY`) and ML service shared secrets (`ML_SERVICE_API_KEY`) reside exclusively in backend environment variables. The mobile app never receives model-service credentials or LLM keys.
3. **Recovery Engine Decoupling:** The deterministic recovery engine (`backend/src/recovery/`) contains pure domain logic and is completely independent of Express route handlers and HTTP frameworks. It can be executed and unit-tested without running an HTTP server or database connection.
4. **Deterministic Before Generative:** The deterministic recovery engine operates independently of the LLM. The AI orchestration layer only interprets unstructured disruption descriptions, matches permitted backend tools, and explains verified recovery results in plain language.
5. **No Data Fabrication:** The system never fabricates market prices, buyer demand, travel distances, transport costs, or external availability. If no feasible plan exists, the engine reports an honest `NO_FEASIBLE_PLAN` result.

---

## 4. Multi-Service Monorepo Layout

```
kisan_sankat_rakshak/
├── mobile/                  # React Native + Expo JavaScript client
│   ├── app/                 # Expo Router file-based screens
│   ├── constants/           # Design tokens (Colors, Typography, Spacing)
│   ├── components/          # Reusable UI and Domain components
│   └── services/            # Backend API client with timeouts & retry logic
├── backend/                 # Node.js + Express + Mongoose REST API
│   ├── src/
│   │   ├── config/          # Centralized validated environment configuration
│   │   ├── routes/          # Versioned routes (/api/v1)
│   │   ├── controllers/     # Request/response translation
│   │   ├── middleware/      # Auth, ownership, validation, error handling
│   │   ├── models/          # 12 Mongoose domain models with strict enums
│   │   ├── validators/      # express-validator schemas
│   │   ├── services/        # Business logic services
│   │   ├── recovery/        # Pure deterministic recovery engine
│   │   ├── agents/          # LLM orchestration and tool sandboxing
│   │   ├── utils/           # Math, date, formatting, logging utilities
│   │   └── tests/           # Unit and integration test suites
│   ├── package.json
│   └── .env.example
├── ml-service/              # Python FastAPI image quality assessment service
│   ├── app/
│   │   ├── main.py          # FastAPI application & lifespan management
│   │   ├── api/             # API route definitions
│   │   ├── schemas/         # Pydantic v2 request/response schemas
│   │   ├── services/        # Service layer & validation
│   │   └── inference/       # YOLO inference adapter & Mock fallback
│   ├── tests/               # Pytest suite
│   ├── requirements.txt
│   └── .env.example
├── docs/                    # Architectural and developer documentation
│   ├── architecture.md      # This document
│   ├── api-contracts.md     # Complete REST & ML service contract specifications
│   ├── data-models.md       # Full schema specifications for the 12 models
│   └── development-guide.md # Local environment setup, ports, startup sequence
├── .gitignore               # Multi-tier ignore rules
└── README.md                # Project root guide & quickstart
```

---

## 5. Domain Entities (The 12 Core Models)

| Model | Purpose | Critical Invariants |
| :--- | :--- | :--- |
| **1. User** | Farmer & operator profiles, credentials, role | Farmer, Buyer, Admin roles; encrypted passwords (bcrypt). |
| **2. Harvest** | Harvested crop batches, total & available quantity | `availableQty = totalQty - reservedQty - committedQty - deliveredQty - lostQty`. |
| **3. QualityAssessment** | Vision analysis result from ML service | Ripeness stage, visible condition findings, confidence, uncertainty score. |
| **4. Buyer** | Verified buyer profiles, location, accepted crops | Active status, location coordinates, storage capacity. |
| **5. Offer** | Open bids by buyers for specific crop grades | Price per kg, min/max quantity, expiration timestamp. |
| **6. Order** | Contractual sale linking a harvest to an offer | Status: `PENDING`, `CONFIRMED`, `IN_TRANSIT`, `DELIVERED`, `CANCELLED`. |
| **7. InventoryAllocation** | Specific kg reservation against a harvest | Locks stock for a specific order. Released on cancellation. |
| **8. Delivery** | Transport assignment, vehicle info, dispatch time | Vehicle capacity, transport cost per km, tracking status. |
| **9. DisruptionEvent** | Event intake (buyer cancellation, transport breakdown)| Idempotency key, processed status, affected order/allocation reference. |
| **10. RecoveryPlan** | Generated alternatives and ranking from engine | Net returns breakdown, constraints verified, chosen plan, farmer approval. |
| **11. AuditLog** | Append-only tamper-evident event log | Entity type, action, before/after snapshot, actor ID, timestamp. |
| **12. Notification** | Actionable push/in-app alert for farmer | Priority level, status (`UNREAD`, `READ`), deep-link action payload. |

---

## 6. Deterministic Recovery Engine Specifications

The recovery engine receives:
1. The **Disruption Event** (e.g., Buyer cancelled 300 kg tomato order).
2. The **Current Stock State** for the affected harvest.
3. The **Farmer Constraints** (minimum price/kg, max transport cost, partial splits allowed/prohibited, max transit distance).
4. The **Available Buyer Offers** in the system.
5. The **Available Logistics/Transport Options**.

### Deterministic Calculation Formula:
$$\text{Net Return} = (\text{Allocated Qty} \times \text{Price/kg}) - \text{Transport Cost} - \text{Packaging Cost} - \text{Platform Fee}$$

### Recovery Processing Steps:
1. **Idempotency Check:** Verify if `idempotencyKey` has already been processed. If yes, return the existing `RecoveryPlan` without re-allocating.
2. **Stock Release:** Identify and immediately release only the affected order's allocation back into `availableQty`.
3. **Offer Filtering:** Filter active, non-expired offers that accept the crop type and quality grade.
4. **Constraint Filtering:**
   - Offer price $\ge$ Farmer's minimum acceptable price.
   - Required transport cost $\le$ Farmer's max transport cost threshold.
   - Batch size matches farmer split policy (`allowPartialAllocations`).
   - Delivery deadline meets crop spoilage deadline.
5. **Candidate Ranking:** Rank candidates by descending **Net Return**.
6. **Integrity Verification:** If no candidate passes constraints, return an explicit `NO_FEASIBLE_PLAN` with transparent rejection reasons for each rejected candidate.

---

## 7. AI Orchestration Boundary (Gemini 2.0)

The LLM is strictly an orchestration and explanation tool. It executes within a sandbox:

### Permitted Capabilities:
- Parsing natural language messages from farmers (e.g., "Buyer Ramesh just backed out of his 300kg order, what can I do?").
- Mapping the farmer's intent to a validated system tool:
  - `trigger_disruption_recovery({ orderId, reason })`
  - `get_harvest_status({ harvestId })`
  - `explain_recovery_plan({ planId })`
- Generating bilingual (Hindi / English) explanations of the verified recovery plan.

### Strictly Prohibited Capabilities:
- The LLM **cannot** write or modify database records directly.
- The LLM **cannot** compute inventory balances or financial net returns.
- The LLM **cannot** invent non-existent buyers, rates, or transport routes.
- The LLM **cannot** override hard business rules or bypass farmer approval.

---

## 8. Implementation Phases (Phased Roadmap)

- **Phase A — Audit and Foundation** *(Current)*: Monorepo scaffolding, environment contracts, comprehensive documentation, baseline verification.
- **Phase B — Backend Foundation**: Express API setup, centralized config, error handling, structured logging, health/readiness endpoints, tests.
- **Phase C — Data Persistence**: MongoDB connection, Mongoose models (User, Harvest, QualityAssessment), CRUD routes, persistence tests.
- **Phase D — Recovery Engine**: Inventory accounting, Buyer/Offer models, cancellation event pipeline, deterministic recovery engine, edge-case unit tests.
- **Phase E — ML Quality Assessment Service**: FastAPI application, tomato image validation, inference schema contract, mock fallback adapter, tests.
- **Phase F — Mobile Integration**: Expo API client, real harvest creation, inventory view, recovery plan display, loading/error states.
- **Phase G — AI Orchestration**: Gemini tool-calling interface, prompt templates, structured output validation, non-LLM fallback.
- **Phase H — End-to-End Workflow**: Cascading disruption simulations (buyer cancellation followed by vehicle breakdown), notifications, audit history.
- **Phase I — Hardening and Release**: Security audit, rate limiting, final integration tests, deployment guide.
