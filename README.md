# FasalRakshak AI (फसल रक्षक)

> **"When plans fail, we find the next move."**

FasalRakshak AI is a native mobile application and intelligent farm-to-market recovery system designed to protect farmers when supply chains break down. When buyers cancel orders, transport vehicles fail, or produce risks spoiling, FasalRakshak AI immediately recalculates available inventory, identifies genuine market alternatives, calculates transparent net returns, and executes farmer-authorized recovery plans.

---

## Architecture Overview

FasalRakshak AI uses a modular 3-tier architecture with strict security boundaries:

```
[ Web Frontend (React + Vite) ]
                │
                │ HTTPS REST API (/api/v1)
                ▼
[ Backend API & Recovery Engine (Node.js / Express) ]
         │                               │
         ▼ Mongoose                      ▼ Internal REST
[ MongoDB Database ]            [ Python ML Service (FastAPI / YOLO) ]
```

- **Web Frontend (`frontend/`):** React + Vite responsive web application. Rich agrarian design system built specifically for farmers with multilingual support (Marathi, Hindi, English), 1-click distress alerts, live algorithmic recovery calculations, and buyer marketplace.
- **Backend API (`backend/`):** Node.js + Express with centralized validation, JWT authentication, and concurrency-safe Mongoose persistence.
- **Deterministic Recovery Engine (`backend/src/recovery/`):** Pure algorithmic engine calculating exact net returns (Gross Revenue − Transport − Packaging − Platform Fees) against hard farmer constraints. Independent of HTTP and AI layers.
- **ML Quality Assessment Service (`ml-service/`):** Python + FastAPI microservice evaluating crop ripeness and visible blemishes from harvest photos.
- **AI Orchestration Layer (`backend/src/agents/`):** Gemini 2.0 sandboxed assistant that interprets farmer voice/text queries into backend tool calls without ever inventing data or overriding business rules.

---

## Monorepo Directory Layout

```
kisan_sankat_rakshak/
├── frontend/                # React + Vite Web Application
│   ├── src/                 # Components, Dashboards (Farmer, Buyer, Admin), Contexts & API
│   ├── index.html           # Google Fonts (Outfit, Inter, Noto Sans Devanagari)
│   └── package.json         # React 19, Vite, Lucide Icons
├── backend/                 # Node.js + Express API & Recovery Engine
├── ml-service/              # Python FastAPI Image Assessment Service
├── docs/                    # Complete Engineering Specifications
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

### 3. Frontend Web Application Setup
```bash
# Install frontend dependencies
npm --prefix frontend install

# Start Vite development server
npm --prefix frontend run dev
```

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
