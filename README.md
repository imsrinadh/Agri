# AgriRisk — Agricultural Intelligence & Risk Decision Platform

AgriRisk is a full-stack agricultural decision-support and risk intelligence platform designed for Indian farmers, agronomists, and policymakers. The system combines frozen machine-learning engines (`AGRIRISK_ML_v1.0`), computer vision plant pathology (`DISEASE_MODEL_v1.0`), official meteorological forecasts, Sentinel-2 earth observation telemetry, and comprehensive safety-net guidance.

---

## 🌾 Core Modules & Architecture

1. **Dashboard (`/dashboard`)**:
   - Central agronomic hub tracking development risk indices, recent predictions, pathogen diagnostic histories, and primary platform gateways.
2. **Risk Analysis (`/risk-analysis`)**:
   - Real ML execution against `AGRIRISK_ML_v1.0` (Ridge Regressor trained on 14-year longitudinal 2012–2025 panels).
   - GPS Location Auto-Detection (`[ 📍 Use My Location ]`) with OpenStreetMap reverse geocoding and confirmation map.
   - Outputs: Composite Condition Risk Score, 5-Dimension Weight Breakdown (Weather 35%, Soil 20%, Pest 15%, Stability 20%, Market 10%), Expected Yield (t/ha), Conformal Range, Financial Scenarios, and Decision-Support Actions.
3. **Disease Detection (`/disease-detection`)**:
   - Instant visual leaf pathology classification using `DISEASE_MODEL_v1.0` with confidence scoring and treatment advice.
4. **Farmer Protection (`/farmer-protection`)**:
   - Independent safety net covering PMFBY, RWBCIS, PM-KISAN, KCC, eligibility criteria, document checklists, and the statutory 72-hour crop-loss reporting protocol.
5. **Weather Forecast (`/weather`)**:
   - Real-time weather, 15-day daily forecast, temperature and rainfall trend charts, 30-day extended outlooks, 90-day seasonal outlooks, and IMD-verified alerts.
6. **Satellite Observation (`/satellite`)**:
   - Sentinel-2 calibrated NDVI canopy index gauge, Sentinel-1 radar soil moisture, multi-pass timeline, and interactive mapping.

---

## 🚀 Quick Start (Single-Link Full-Stack)

### Prerequisites
- Node.js (v18+) & npm
- Python (3.10+) in `backend/venv/`

### 1. Start Both Frontend and Backend (Single Command)
```bash
npm run dev
```
- **Frontend App**: `http://localhost:5173`
- **Backend API Docs**: `http://127.0.0.1:8000/docs`
- **Reverse Proxy**: Vite automatically forwards `/api` and `/uploads` to `http://127.0.0.1:8000`.

### 2. Run Backend Test Suite
```bash
cd backend
.\venv\Scripts\python.exe -m pytest tests -q
```

### 3. Build Frontend for Production
```bash
npm run build
```

---

## 🔒 Scientific & Data Integrity Rules
- **Frozen ML Engine**: `AGRIRISK_ML_v1.0` is strictly deterministic, frozen, and validated.
- **Zero Fake / Demo Data**: Production pathways retrieve verified meteorological, satellite, and agronomic telemetry only.
- **No Document Collection**: AgriRisk never collects, uploads, or stores farmer personal documents.
- **Non-Guarantee Decision Support**: Predictions are ML-based estimates to assist decision-making, not financial guarantees.
