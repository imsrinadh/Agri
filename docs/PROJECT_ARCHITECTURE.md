# AgriRisk System Architecture Master Document

**System Version**: `2.0.0`  
**Model Architecture**: `AGRIRISK_ML_v1.0`  
**Date**: 2026-08-26  

---

## 1. System Architecture Overview

```
 ┌────────────────────────┐
 │  FRONTEND DASHBOARD    │ React 19 + Vite (Responsive, Accessible)
 └───────────┬────────────┘
             │ JSON / REST HTTP
             ▼
 ┌────────────────────────┐
 │   BACKEND FASTAPI      │ Python 3.14 (Async, Stateless, JWT Auth)
 ├────────────────────────┤
 │ - /api/predict         │ Primary ML Prediction & Outcome Endpoint
 │ - /api/risk            │ Multi-Hazard Risk Scoring & History
 │ - /api/disease         │ Decoupled Crop Image Detection
 │ - /api/regions         │ 22 District Agronomic Intelligence
 └───────────┬────────────┘
             │
 ┌───────────┴─────────────────────────────────────────┐
 │       FROZEN ML ENGINE: AGRIRISK_ML_v1.0            │
 ├─────────────────────────────────────────────────────┤
 │ Output A: Expected Yield & Prediction Range         │
 │           (Ridge Regressor, alpha=10.0)             │
 │ Output B: Multi-Dimensional Condition Risk          │
 │           (Weather 35%, Soil 20%, Pest 15%,         │
 │            Yield Stability 20%, Market 10%)         │
 │ Financial: Revenue Scenario Propagation             │
 │           (Conservative, Expected, Optimistic)      │
 └───────────────────────────┬─────────────────────────┘
                             │
 ┌───────────────────────────┴─────────────────────────┐
 │           VERIFIED REAL DATA REGISTRY               │
 ├─────────────────────────────────────────────────────┤
 │ - DES APY Census (2012–2025, 392 records)           │
 │ - NASA POWER Daily Weather Grids (2012–2025)        │
 │ - DA&FW Soil Health Card District Baselines (2025)  │
 │ - ICAR-NCIPM Seasonal Pest Surveillance (2025)      │
 │ - Agmarknet APMC Mandi Wholesale Spot Series (2025) │
 └─────────────────────────────────────────────────────┘
```

---

## 2. Phase 5 — Backend + Frozen ML Integration

In Phase 5, the frozen ML model (`AGRIRISK_ML_v1.0`) was permanently connected to the backend API layer:
1. **Model Singleton Service (`ml_service.py`)**: Loads `Ridge(alpha=10.0)` in memory once on startup to execute fast, non-blocking inference.
2. **Feature & Data Service (`feature_service.py`)**: Executes leak-free data retrieval and validates district/crop coverage across all 22 districts.
3. **Refusal Mechanism**: Automatically rejects unsupported regions with `422 Unprocessable Entity` (`"reason": "INSUFFICIENT_VERIFIED_DATA"`), with zero fake default fallbacks.
4. **Data Freshness & Provenance**: Seamlessly exposes `weather_data_year = 2025`, `latest_harvest_outcome_year = 2025`, and `latest_final_harvest_outcome_year = 2023`.

---

## 3. Phase 6 — Frontend ↔ Backend Integration

In Phase 6, the React dashboard was connected to `POST /api/predict`:
1. **Unified Risk Form (`src/pages/RiskAnalysis.jsx`)**: Connected directly to the centralized API client, sending farmer requests (`state`, `district`, `crop`, `season`, `sowing_date`, `farm_area`) with strict input validation.
2. **Real Data Presentation**: Displays Output A expected yield & prediction ranges, Output B 5-dimensional condition risks, gross revenue scenarios, and 4-tier harvest status (`2022 FINAL`, `2023 FINAL`, `2024 PROVISIONAL`, `2025 PROVISIONAL ADVANCE`).
3. **Scientific Disclaimers & Safety**: Displays limited uncertainty warnings without unverified confidence claims, omits net profit calculations when variable costs are absent, and notifies users when 2026 sowing dates are entered.
4. **Zero-Mock UI**: Removed mock prediction generators and fake progress bars; all results are derived from verified backend responses.

---

## 4. Phase 7C — Crop Disease Image Detection Module (Limited Deployment)

In Phase 7C, the foliar crop disease vision module is deployed under a strictly controlled **Limited Deployment** status:
1. **Decoupled System Architecture**:
   ```
   Disease Image Upload
           ↓
   Image Validation (Quality Check: PASS)
           ↓
   DISEASE_MODEL_v1.0 (Random Forest on 109-D Spatial-Chromatic Features)
           ↓
   Confidence Check (Threshold >= 0.45)
           ↓
   AI-Assisted Screening + KVK Extension Decision Support
   ```
   while the primary yield engine remains strictly independent:
   ```
   Farmer Input → Backend → AGRIRISK_ML_v1.0 → Yield Outcome + Agricultural Risk
   ```
2. **Working Upload & Quality Audit Pipeline**: Checks format (JPG/PNG/WEBP $\le 10$ MB), minimum resolution ($32\times 32$), and rejects corrupted or pitch-black/pitch-white uploads with `HTTP 422 (IMAGE_INSUFFICIENT_FOR_ANALYSIS)`.
3. **Limited Deployment Guardrails**:
   - `DISEASE_MODEL_STATUS = "VALIDATED_LIMITED_DEPLOYMENT"`, `DEPLOYMENT_STATUS = "LIMITED"`.
   - Low-confidence rejection ($< 0.45 \implies$ `UNKNOWN_OR_LOW_CONFIDENCE`, `prediction_allowed = false`).
   - Conservative non-chemical recommendations requiring local Krishi Vigyan Kendra (KVK) field confirmation.

---

## 5. Phase 8 — Farmer Decision Support Engine (Rule-Based Synthesis Layer)

The Farmer Decision Support Engine acts as a holistic rule-based synthesis layer connecting all validated subsystems without altering frozen model weights:

```
                      Farmer Agronomic Request
                                 ↓
         ┌───────────────────────┴───────────────────────┐
         ↓                                               ↓
Frozen AGRIRISK_ML_v1.0                         Validated DISEASE_MODEL_v1.0
(Yield + 5-Hazard Risks)                        (Foliar Pathology Screening)
         ↓                                               ↓
         └───────────────────────┬───────────────────────┘
                                 ↓
                     Verified APMC Mandi Prices
                                 ↓
                Rule-Based Decision Support Engine
                                 ↓
  ┌─────────────────────────────────────────────────────────────┐
  │ 1. Risk Level & Summary (With 'Why' Contributing Factors)   │
  │ 2. Expected Yield & Calibrated Prediction Range             │
  │ 3. Top 3 Highest Contributing Multi-Hazard Factors          │
  │ 4. Foliar Pathology Findings (If scan is provided)          │
  │ 5. Verified Mandi Price & 3 Gross Revenue Scenarios         │
  │ 6. Ranked Action Plan (Immediate, Monitor, Consider, General│
  │ 7. Official PMFBY Crop Insurance Protection Pathways        │
  │ 8. Data Freshness & 2026 Unobserved Harvest Outcome Advisory│
  └─────────────────────────────────────────────────────────────┘
```

1. **Zero-Guarantee Contract**: Strict absence of guaranteed yield, profit, or loss protection claims.
2. **Missing Data Handling**: Refuses missing observations with HTTP 422 `INSUFFICIENT_VERIFIED_DATA` rather than substituting fabricated defaults.
3. **Farmer Protection**: Connects farmers directly to official PMFBY portals, toll-free helplines, and 72-hour localized damage reporting windows.




