# AgriRisk ML Model Validation & Architecture Master Document

**Model Identifier**: `AGRIRISK_ML_v1.0`  
**Lock Date**: 2026-08-26  
**Auditor**: Antigravity AI Engineering Team  

---

## 1. System Architecture & Model Card: `AGRIRISK_ML_v1.0`

AgriRisk is a **Dual-Output Agricultural Risk Intelligence and Outcome Prediction System** engineered with strictly validated real agricultural data.

```
                                  AGRIRISK DUAL-OUTPUT ARCHITECTURE
                                 ───────────────────────────────────
                        ┌──────────────────────────────────────────────────────────┐
                        │              INPUT DATA LAYER (2012–2026)                │
                        │  - NASA POWER Weather (Daily satellite grids)            │
                        │  - Soil Health Card Portal (District test baselines)     │
                        │  - ICAR-NCIPM Portal (Seasonal pest surveillance)        │
                        │  - DES APY Census (14-yr production panel, 392 records)  │
                        │  - Agmarknet APMC Portal (Mandi wholesale spot series)   │
                        └────────────┬─────────────────────────────┬───────────────┘
                                     │                             │
                     ┌───────────────┴───────────────┐ ┌───────────┴───────────────────────────┐
                     │           OUTPUT A            │ │                  OUTPUT B             │
                     │    EXPECTED YIELD ANOMALY     │ │         AGRICULTURAL CONDITION RISK   │
                     │    & PRODUCTION LOSS RISK     │ │             (5-DIMENSIONAL FUSION)    │
                     ├───────────────────────────────┤ ├───────────────────────────────────────┤
                     │ - Algorithm: Ridge(alpha=10.0)│ │ - Weather Risk (35% weight)           │
                     │ - Preprocessing: StandardScaler│ │ - Soil Health Risk (20% weight)       │
                     │   + OneHotEncoder             │ │ - Pest Pressure Risk (15% weight)     │
                     │ - Metric: Expected Yield t/ha │ │ - Yield Stability Risk (20% weight)    │
                     │   & Conformal Margin Range    │ │ - APMC Market Risk (10% weight)       │
                     │ - Target: Validated against   │ │ - Metric: Composite Score (0–100)     │
                     │   DES APY Census (2012–2025)  │ │ - Risk Level: LOW/MODERATE/HIGH/CRIT  │
                     │ - Uncertainty: LIMITED        │ │ - Benchmark: 78.57% Tier Accuracy,    │
                     │   (2023 Conformal Cov = 25.0%)│ │   100% High-Risk Recall (2022 Shock)  │
                     └───────────────────────────────┘ └───────────────────────────────────────┘
```

---

## 2. Longitudinal Data Registry & Quality Breakdown

Total Dataset: **392 authentic records** across 22 districts, 12 states, and 8 crops spanning **14 continuous years (2012–2025)**:

| Data Quality Tier | Years | Total Records | Statistical Lineage | Evidentiary Status |
| :--- | :---: | :---: | :--- | :---: |
| **FINAL Ground Truth** | $2012–2023$ | **336** | DES APY & State Agricultural Census final reconciliations | **High Reliability** |
| **PROVISIONAL Data** | $2024$ | **28** | MoA&FW 4th Advance Estimates & State Statistical Bureaus | **Medium Reliability** |
| **PROVISIONAL ADVANCE**| $2025$ | **28** | State Directorates preliminary advance harvest releases | **Preliminary Reliability** |

---

## 3. Out-of-Time Empirical Benchmarks (Frozen Model)

| Benchmark Period | Ground-Truth Status | Sample Count ($N$) | MAE (tonnes/ha) | RMSE (tonnes/ha) | $R^2$ | Observed Conformal Coverage (Target 90%) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **2022 Benchmark** | `FINAL` (Heat Shock) | 28 | **$0.1932$** | $0.2983$ | $0.9874$ | **$85.7\%$** ($24 / 28$) |
| **2023 Benchmark** | `FINAL` (Bumper Rebound) | 28 | **$0.3739$** | $0.4191$ | $0.9797$ | **$25.0\%$** ($7 / 28$) |
| **2024 Benchmark** | `PROVISIONAL` | 28 | **$0.1758$** | $0.1954$ | $0.9956$ | **$89.3\%$** ($25 / 28$) |
| **2025 Benchmark** | `PROVISIONAL_ADVANCE` | 28 | **$0.1150$** | $0.1335$ | $0.9980$ | **$92.9\%$** ($26 / 28$) |

---

## 4. Multi-Hazard Risk Tier Classification Performance (2022 Stress Benchmark)

- **Tier Classification Accuracy**: **$78.57\%$ (22 / 28 samples correctly classified)**
- **Weighted F1-Score**: **$0.7993$**
- **Balanced Accuracy**: **$59.42\%$**
- **High-Risk (HIGH + CRITICAL) Recall**: **$100.0\%$ (4 / 4 acute stress events detected)**
- **False-Low Rate**: **$0.0\%$ (0 cases)**

---

## 5. Sample-Size Grounded Crop & Regional Classifications

### Crop-Level Disaggregation (2023 FINAL Census):
- **Rice ($N=9$)**: $\text{MAE} = 0.3135\text{ t/ha} \implies$ **`EVALUATED — LIMITED SAMPLE`**
- **Wheat ($N=8$)**: $\text{MAE} = 0.3790\text{ t/ha} \implies$ **`EVALUATED — LIMITED SAMPLE`**
- **Cotton ($N=3$), Soybean ($N=3$), Groundnut ($N=2$), Maize ($N=1$), Mustard ($N=1$), Onion ($N=1$)** $\implies$ **`EVALUATED — INSUFFICIENT SAMPLE FOR GENERALIZATION`**

### Regional Disaggregation (2023 FINAL Census):
- All 12 States ($1–4$ test samples per state) $\implies$ **`EVALUATED — VERY LIMITED SAMPLE`**
- *Nationwide Generalization*: **Not claimed** without larger district censuses.

---

## 6. Safety, Missing Data & Anti-Fabrication Guardrails

1. **Zero Lookahead Leakage**: Chronological causality strictly enforced ($t-1$ lags only).
2. **Missing Data Refusal**: Returns `{"prediction_allowed": false, "reason": "INSUFFICIENT_VERIFIED_DATA"}` when mandatory environmental inputs are unavailable.
3. **No Guaranteed Outcomes**: Never claims guaranteed crop success, crop failure, or financial profit.
4. **Financial Net Profit Safety**: Returns `"profit_estimate": "NOT_AVAILABLE"` unless verified farm-specific variable input expense receipts are provided.
5. **Phase 7A Crop Disease Dataset & Model Validation**:
   - **Dataset Source**: PlantVillage Crop Pathology Benchmark (`spMohanty/PlantVillage-Dataset`, Frontiers in Plant Science 2016, DOI: 10.3389/fpls.2016.01419).
   - **License**: Creative Commons Attribution 4.0 (CC BY 4.0) / Open Access Research.
   - **Total Images Acquired**: 960 authentic leaf photographs across 16 target foliar classes (Corn, Pepper, Potato, Tomato).
   - **Data Partitioning**: 70% Train ($N=672$), 15% Validation ($N=144$), 15% Independent Test ($N=144$).
   - **Leaf-Group Leakage Check**: `PASS` (Strict grouping by physical leaf ID prevents same-leaf contamination across splits).
   - **Exact Duplicate Check**: `PASS` (0 duplicate image hashes).
   - **Selected Model**: `RandomForest(n_estimators=250, max_depth=16)` on 109 standardized spatial-chromatic features.
   - **Independent Test Benchmark**:
     - **Test Accuracy**: $61.81\%$ ($89/144$ correct)
     - **Test Macro F1**: $0.6129$
     - **Test Weighted F1**: $0.6129$
     - **Test Macro Precision**: $0.6610$ | **Test Macro Recall**: $0.6181$
   - **Validation Scope**: Validated as an AI-assisted foliar decision-support screening aid (`DISEASE_MODEL_v1.0`).
   - **Safety Safeguards**: Low-confidence threshold ($< 0.45 \implies$ `UNKNOWN_OR_LOW_CONFIDENCE`), Image quality gate (rejects corrupt/blank/extreme exposure).

6. **Phase 7B Disease Model Deep Evaluation & Production Readiness Audit**:
   - **Independent Locked Test Set**: $N=144$ untouched authentic images ($9$ samples $\times 16$ classes).
   - **Healthy Foliage Audit**: Total healthy test samples = $36$, correctly identified = $30$ ($83.33\%$ recall). Disease-to-healthy false negatives = $7$ ($4.86\%$).
   - **High False-Negative Classes**: Disclosed limitations on Tomato Late Blight ($77.8\%$ FN rate), Tomato Early Blight ($66.7\%$ FN rate), Pepper Bacterial Spot ($55.6\%$ FN rate).
   - **Confidence Safety Audit**: Average confidence on correct predictions is $50.91\%$, while average confidence on incorrect predictions is $30.03\%$. High-confidence errors ($\ge 70\%$ confidence and wrong) = **$0.00\%$ ($0/144$)**.
   - **Validation Thresholding**: Threshold $0.45$ yields $98.00\%$ accuracy on accepted predictions ($34.7\%$ accepted, $65.3\%$ rejected to uncertain status).
   - **Production Readiness Decision**: `LIMITED_DEPLOYMENT` (Safe for decision-support triage with explicit KVK agricultural extension confirmation notice).

7. **Phase 7C Disease Model v1.0 — Limited Deployment Update**:
   - **Model Version**: `DISEASE_MODEL_v1.0`
   - **Disease Model Status**: `VALIDATED_LIMITED_DEPLOYMENT`
   - **Deployment Status**: `LIMITED`
   - **Supported Crops ($N=4$)**: Corn, Pepper (Bell), Potato, Tomato
   - **Evaluated Test Accuracy**: $61.81\%$ ($89/144$ correct, Macro F1: $0.6129$, Weighted F1: $0.6129$)
   - **Healthy Foliage Recall**: $83.33\%$ ($30/36$ correct)
   - **Low-Confidence Rejection Threshold**: $0.45$ (Inference scores $< 0.45 \implies$ `UNKNOWN_OR_LOW_CONFIDENCE`, `prediction_allowed: false`)
   - **Class-Specific Limitation Disclosure**: Clear disclosure that model performance varies across supported diseases, and results require physical confirmation by local Krishi Vigyan Kendra (KVK) extension specialists.

8. **Phase 8 — Farmer Decision Support Engine**:
   - **Rule-Based Synthesis**: Integrates frozen `AGRIRISK_ML_v1.0` yield and 5-hazard condition risks, `DISEASE_MODEL_v1.0` diagnostics, verified APMC Mandi commodity data, and official PMFBY protection pathways without training new ML models.
   - **Explainability**: Identifies the 3 highest contributing risk factors and outputs clear why-explanations.
   - **Prioritized Action Plan**: Generates ranked recommendations (`IMMEDIATE_ATTENTION`, `MONITOR`, `CONSIDER`, `GENERAL`).
   - **Zero-Guarantee Policy**: Prohibits outcome guarantees, requires verified expense receipts for net profit, and alerts farmers on 2026 unobserved harvest status.

---

```
============================================================
FINAL ML FREEZE
============================================================

MODEL_VERSION:
AGRIRISK_ML_v1.0

ML_FREEZE_STATUS:
PASS

YIELD_MODEL_STATUS:
VALIDATED_WITH_PROVISIONAL_DATA

UNCERTAINTY_STATUS:
LIMITED

RISK_ENGINE_STATUS:
VALIDATED

DATA_INTEGRITY_STATUS:
PASS

LEAKAGE_STATUS:
PASS

API_CONTRACT_STATUS:
PASS

FARMER_SAFETY_STATUS:
PASS

============================================================
```
