# FasalRakshak AI (फसल रक्षक)

> **"When plans fail, we find the next move."**

FasalRakshak AI is a native mobile application and intelligent farm-to-market recovery system designed to protect farmers when supply chains break down. When buyers cancel orders, transport vehicles fail, or produce risks spoiling, FasalRakshak AI immediately recalculates available inventory, identifies genuine market alternatives, calculates transparent net returns, and executes farmer-authorized recovery plans.

---

## Architecture Overview

FasalRakshak AI uses a modular 3-tier architecture with strict security boundaries:

```
[ Mobile App (Expo / React Native) ]
                │
                │ HTTPS REST API (/api/v1)
                ▼
[ Backend API & Recovery Engine (Node.js / Express) ]
         │                               │
         ▼ Mongoose                      ▼ Internal REST
[ MongoDB Database ]            [ Python ML Service (FastAPI / YOLO) ]
```

- **Mobile Client (`mobile/`):** React Native + Expo JavaScript with file-based Expo Router navigation. Responsive, clean design built specifically for farmers with intuitive recovery options.
- **Backend API (`backend/`):** Node.js + Express with centralized validation, JWT authentication, and concurrency-safe Mongoose persistence.
- **Deterministic Recovery Engine (`backend/src/recovery/`):** Pure algorithmic engine calculating exact net returns (Gross Revenue − Transport − Packaging − Platform Fees) against hard farmer constraints. Independent of HTTP and AI layers.
- **ML Quality Assessment Service (`ml-service/`):** Python + FastAPI microservice evaluating crop ripeness and visible blemishes from harvest photos.
- **AI Orchestration Layer (`backend/src/agents/`):** Gemini 2.0 sandboxed assistant that interprets farmer voice/text queries into backend tool calls without ever inventing data or overriding business rules.

---

## Monorepo Directory Layout

```
kisan_sankat_rakshak/
├── mobile/                  # React Native + Expo Mobile Client
│   ├── app/                 # Expo Router file-based screens (Tabs: Home, Harvests, Recovery, Profile)
│   ├── constants/           # Design token palette (FasalRakshak green/amber/slate tokens)
│   └── package.json         # Expo SDK 58.0.16, React Native 0.88
├── backend/                 # Node.js + Express API & Recovery Engine
│   ├── src/
│   │   ├── config/          # Centralized configuration & environment validation
│   │   ├── routes/          # REST API route handlers (/api/v1)
│   │   ├── controllers/     # Request/response logic
│   │   ├── middleware/      # Auth, validation, error handler, rate limiting
│   │   ├── models/          # 12 Mongoose data models
│   │   ├── validators/      # Schema validators
│   │   ├── services/        # Business logic & external API clients
│   │   ├── recovery/        # Pure deterministic recovery engine
│   │   ├── agents/          # Gemini LLM tool sandboxing
│   │   ├── utils/           # Math, date, logging helpers
│   │   └── tests/           # Jest unit & integration test suites
│   ├── package.json
│   └── .env.example
├── ml-service/              # Python FastAPI Image Assessment Service
│   ├── app/
│   │   ├── main.py          # FastAPI application
│   │   ├── api/             # API routes
│   │   ├── schemas/         # Pydantic v2 validation models
│   │   ├── services/        # Business services
│   │   └── inference/       # Inference adapters (YOLO + Mock)
│   ├── tests/               # Pytest suite
│   ├── requirements.txt
│   └── .env.example
├── docs/                    # Complete Engineering Specifications
│   ├── architecture.md      # Multi-tier system architecture & security boundaries
│   ├── api-contracts.md     # Express & FastAPI REST API contracts
│   ├── data-models.md       # Schema definitions for all 12 domain models
│   ├── development-guide.md # Local development, ports, and testing commands
│   └── milestone-1-report.md# Milestone 1 verification summary
├── .gitignore               # Multi-tier repository ignore rules
└── README.md                # Project documentation & quickstart
```

---

## Quickstart Guide

### Prerequisites
- Node.js v20+ or v24 (Tested on v24.18.0)
- Python 3.10+ (Tested on v3.14.6)
- Git 2.50+

### 1. Backend Setup
```bash
# Configure environment
copy backend\.env.example backend\.env

# Install dependencies
npm --prefix backend install

# Start Express server in development mode
npm --prefix backend run dev
```

### 2. ML Quality Assessment Service Setup
```bash
# Configure environment
copy ml-service\.env.example ml-service\.env

# Create and activate virtual environment
python -m venv ml-service/venv
ml-service\venv\Scripts\activate

# Install Python dependencies
pip install -r ml-service/requirements.txt

# Run FastAPI service
uvicorn app.main:app --app-dir ml-service --host 0.0.0.0 --port 8000 --reload
```

### 3. Mobile App Setup
```bash
# Start Expo development server (already initialized in Milestone 1)
npm --prefix mobile run start
```
- Press `w` to open web preview.
- Scan QR code with Expo Go on Android or iOS.

---

## Verification & Phased Roadmap

| Phase | Description | Status |
| :--- | :--- | :--- |
| **Milestone 1** | Expo React Native scaffolding, tabs navigation, design token system | ✅ Verified |
| **Phase A** | Monorepo layout, environment contracts, comprehensive documentation | ✅ Completed |
| **Phase B** | Express backend foundation, config validation, logging, health endpoints | ⏳ Next |
| **Phase C** | MongoDB connection & first domain models (User, Harvest) | ⏳ Queued |
| **Phase D** | Deterministic Recovery Engine & inventory accounting | ⏳ Queued |
| **Phase E** | Python FastAPI ML service & tomato quality assessment contract | ⏳ Queued |
| **Phase F** | Mobile client API connection & harvest registration flow | ⏳ Queued |
| **Phase G** | Gemini 2.0 AI assistant & sandboxed tool calling | ⏳ Queued |
| **Phase H** | Cascading disruption test suite & end-to-end recovery demonstration | ⏳ Queued |
| **Phase I** | Hardening, rate limiting, and release documentation | ⏳ Queued |

---

## License
MIT / Academic Project. Built with pride for Indian Agriculture.
