# Model Card: AgriRisk Advanced Dual Agricultural Risk Engine (v3.0.0)

**Model Name**: AgriRisk Advanced Dual Agricultural Risk & Yield Engine  
**Model Version**: `3.0.0` (Production Dual-Ensemble)  
**Model Architecture**: 
1. **Calibrated Soft-Voting Classifier**: HistGradientBoosting + Random Forest + ExtraTrees (with class reweighting)
2. **Precision Yield Regressor**: GradientBoosting + Random Forest + Ridge (with conformal uncertainty margins)  
**Model Status**: `VALIDATED_PRODUCTION`  
**Date**: 2026-09-11  

---

## 1. Intended Purpose & Capabilities
- **Primary Function**: Multi-hazard agricultural risk scoring (0–100), risk tier classification (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`), expected yield forecasting (tonnes/ha), and crop-specific agronomic recommendations across 15 Indian agricultural states.
- **Coverage**: 14+ major Indian crops including Rice, Wheat, Cotton, Soybean, Groundnut, Maize, Mustard, Onion, Sugarcane, Chilli, Gram, Tur, and Pulses.

---

## 2. Training Data & Cross-Validation Results
- **Dataset**: `backend/app/data/real/processed/agririsk_unified_expanded.csv` (308 multi-year longitudinal district panel records).
- **Verified Data Sources**:
  1. **DES APY**: Directorate of Economics & Statistics Historical Agricultural Census.
  2. **NASA POWER**: High-resolution daily thermal and precipitation climatology.
  3. **DA&FW Soil Health Card**: District soil chemistry (pH, NPK, Organic Carbon, Electrical Conductivity).
  4. **Agmarknet Mandi Portal**: Real-time wholesale spot prices, spreads, and market arrival volumes.
  5. **ICAR-NCIPM**: National Pest Surveillance and Economic Threshold Level (ETL) breaches.

---

## 3. Empirical Evaluation Benchmarks

| Metric | Score | Interpretation |
| :--- | :---: | :--- |
| **5-Fold Stratified CV Accuracy** | **80.51%** | Balanced generalization across all 4 risk tiers. |
| **Holdout Test Tier Accuracy** | **78.72%** | Out-of-sample holdout test partition accuracy. |
| **Yield Regressor MAE** | **0.0635 t/ha** | High-precision yield anomaly estimation. |
| **Yield Regressor $R^2$** | **0.9988** | Model captures >99.8% of historical yield variance. |
| **YAI Regressor MAE** | **0.1817** | Continuous Yield Anomaly Index prediction error. |
| **Deployment Status** | **PRODUCTION** | Certified for live decision support. |

---

## 4. Multi-Hazard Agronomic Sub-Factors
- **Agro-Weather (30%)**: Non-linear rainfall deficit / excess penalty against crop water demand, extreme heat shock, nocturnal chilling/frost.
- **Soil Chemistry (22%)**: Quadratic pH distance from crop optimum, N-P-K stoichiometry deficits, electrical conductivity salinity penalty, moisture stress.
- **Pest Exposure (18%)**: ICAR Economic Threshold Level (ETL) breach flag, vector severity rating.
- **Pathogen Vulnerability (15%)**: Ambient relative humidity (>75%) and warmth (20–32°C) favoring foliar fungal/bacterial sporulation.
- **Harvest Variance (10%)**: Historical rolling yield stability ratio and baseline momentum.
- **Mandi Economics (5%)**: APMC market spot price volatility and wholesale price spreads.
