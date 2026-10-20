# FasalRakshak AI — Local Development & Operations Guide

This guide provides instructions for setting up, running, testing, and debugging the complete FasalRakshak AI multi-service architecture on your development machine.

---

## 1. System Services & Port Allocations

| Service | Technology | Port | Base URL | Primary Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Mobile Client** | React Native (Expo) | `8081` | `http://localhost:8081` | Farmer UI and mobile workflow |
| **Backend API** | Node.js + Express | `5000` | `http://localhost:5000/api/v1` | Auth, DB persistence, deterministic recovery |
| **ML Quality Service** | Python + FastAPI | `8000` | `http://localhost:8000` | Crop image quality & ripeness assessment |
| **Database** | MongoDB Atlas | Cloud (27017) | `mongodb+srv://...` | Document persistence |

---

## 2. Prerequisites & Verified Toolchains

- **Node.js:** v24.18.0 (v20+ LTS supported)
- **npm:** v11.16.0
- **Python:** v3.14.6 (Python 3.10+ supported)
- **Git:** v2.53.0
- **Android Debug Bridge (ADB):** Installed (Android SDK 37)

---

## 3. Environment Configuration

### Step A: Backend Setup (`backend/`)
1. Change into the `backend/` directory:
   ```bash
   # From project root:
   copy backend\.env.example backend\.env
   ```
2. Open `backend/.env` and supply:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure 32+ character random secret string.
   - `GEMINI_API_KEY`: (Optional until Phase G) Google AI Studio API key.

3. Install Node.js backend dependencies:
   ```bash
   npm --prefix backend install
   ```

### Step B: ML Service Setup (`ml-service/`)
1. Create and configure `.env`:
   ```bash
   copy ml-service\.env.example ml-service\.env
   ```
2. Create a Python virtual environment and install requirements:
   ```bash
   python -m venv ml-service/venv
   ml-service\venv\Scripts\activate
   pip install -r ml-service/requirements.txt
   ```

### Step C: Mobile Setup (`mobile/`)
1. Dependencies are already installed from Milestone 1.
2. If reinstalling is required:
   ```bash
   npm --prefix mobile install
   ```

---

## 4. Service Startup Sequence

To run the complete system locally, start services in this sequence across separate terminal windows:

### Terminal 1: ML Quality Assessment Service
```powershell
# Activate venv & run FastAPI via uvicorn:
.\ml-service\venv\Scripts\activate
uvicorn app.main:app --app-dir ml-service --host 0.0.0.0 --port 8000 --reload
```
*Verification:* Visit `http://localhost:8000/health` in your browser. Expected: `{"status":"ok", "model_loaded":true}`.

### Terminal 2: Node.js Express Backend
```powershell
npm --prefix backend run dev
```
*Verification:* Visit `http://localhost:5000/api/v1/health` in your browser. Expected: `{"success":true, "status":"healthy"}`.

### Terminal 3: Expo React Native Client
```powershell
npm --prefix mobile run start
```
*Verification:* Press `w` in terminal to launch Web preview, or scan QR code using Expo Go on Android.

---

## 5. Physical Device & Emulator Networking

When running the mobile app on a **physical phone** via Expo Go:
- The phone cannot access the backend at `http://localhost:5000` because `localhost` refers to the phone itself.
- **Option 1 (USB Debugging via ADB):**
  ```powershell
  adb reverse tcp:5000 tcp:5000
  adb reverse tcp:8081 tcp:8081
  ```
  This routes the phone's `localhost:5000` directly over USB to your PC.
- **Option 2 (Wi-Fi LAN IP):**
  Find your computer's local IP address (e.g., `ipconfig` -> `192.168.1.45`), and set the backend API base URL in the mobile app settings to `http://192.168.1.45:5000/api/v1`.

---

## 6. Testing Strategy & Execution

### 1. Deterministic Recovery Engine Tests (Phase D)
Run unit tests for the deterministic recovery calculations without needing MongoDB or HTTP:
```powershell
npm --prefix backend test src/tests/recoveryEngine.test.js
```

### 2. Backend Integration & API Tests (Phase B & C)
Run the full Jest test suite for health checks, auth, harvests, and orders:
```powershell
npm --prefix backend test
```

### 3. ML Service Unit & Contract Tests (Phase E)
Test image validation, mock inference, and API contract:
```powershell
pytest ml-service/tests
```

### 4. Mobile Integrity Checks
Verify Expo dependencies and configuration:
```powershell
npx --prefix mobile expo-doctor
```

---

## 7. Security Best Practices for Development

1. **No Real Credentials in Git:** The `.gitignore` file enforces that `.env` files are never tracked. Only `.env.example` templates may be committed.
2. **Sanitized Logs:** All console logging in Express uses a redaction utility to ensure phone numbers, passwords, and tokens are masked.
3. **Idempotency Protection:** All critical order and recovery events require an `idempotencyKey` to prevent double-charging or multiple stock releases during network retries.
