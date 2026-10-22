# AgriRisk API Documentation (AGRIRISK_ML_v1.0)

**Version**: `AGRIRISK_ML_v1.0`  
**Date**: 2026-08-26  
**Architecture**: Dual-Output Agricultural Risk & Yield Prediction + Decoupled Crop Disease Module  

---

## 1. Primary Prediction Endpoint: `POST /api/predict`

Executes the frozen machine learning model (`AGRIRISK_ML_v1.0`) with verified real agricultural data (2012–2025).

### Request Payload Schema (`UnifiedPredictionRequest`):

```json
{
  "state": "Punjab",
  "district": "Ludhiana",
  "crop": "Wheat",
  "season": "Rabi",
  "sowing_date": "2025-11-15",
  "farm_area": 5.0,
  "soil_ph": 7.2,
  "nitrogen": 240.0,
  "phosphorus": 22.0,
  "potassium": 185.0,
  "irrigation_available": true
}
```

| Parameter | Type | Required | Description / Constraints |
| :--- | :---: | :---: | :--- |
| `state` | string | **Yes** | Indian state name (e.g. `Punjab`, `Maharashtra`, `Gujarat`) |
| `district` | string | **Yes** | Supported district in verified registry (e.g. `Ludhiana`, `Nashik`) |
| `crop` | string | **Yes** | Target crop (`Rice`, `Wheat`, `Cotton`, `Soybean`, `Groundnut`, `Maize`, `Mustard`, `Onion`) |
| `season` | string | **Yes** | Farming season (`Kharif`, `Rabi`, `Whole Year`) |
| `farm_area` | float | **Yes** | Landholding size in hectares ($> 0.0$) |
| `soil_ph` | float | No | Optional measured soil pH ($0.0–14.0$) |
| `nitrogen` | float | No | Optional available Nitrogen in kg/ha |
| `phosphorus`| float | No | Optional available Phosphorus in kg/ha |
| `potassium` | float | No | Optional available Potassium in kg/ha |

---

### Response Payload Schema (`UnifiedPredictionResponse`):

```json
{
  "prediction_allowed": true,
  "model_version": "AGRIRISK_ML_v1.0",
  "crop": "Wheat",
  "state": "Punjab",
  "district": "Ludhiana",
  "yield_prediction": {
    "expected_yield": 5.06,
    "unit": "tonnes/hectare",
    "prediction_range": {
      "lower": 4.73,
      "upper": 5.39
    },
    "uncertainty_status": "LIMITED"
  },
  "risk": {
    "score": 32,
    "level": "MODERATE",
    "dimensions": {
      "weather": 28,
      "soil": 10,
      "pest": 25,
      "yield_stability": 25,
      "market": 35
    },
    "top_factors": [
      "Optimal growing conditions across all major environmental dimensions"
    ]
  },
  "financial_risk": {
    "conservative_revenue": "Rs. 104,060 / hectare",
    "expected_revenue": "Rs. 111,320 / hectare",
    "optimistic_revenue": "Rs. 130,438 / hectare",
    "profit_estimate": null,
    "profit_status": "NOT_AVAILABLE"
  },
  "data_freshness": {
    "weather": 2025,
    "market": 2025,
    "pest": 2025,
    "soil": 2025,
    "latest_harvest_outcome": 2025,
    "latest_final_harvest_outcome": 2023
  },
  "harvest_status": {
    "2022": "FINAL",
    "2023": "FINAL",
    "2024": "PROVISIONAL",
    "2025": "PROVISIONAL_ADVANCE"
  }
}
```

---

## 2. Crop Disease Detection Endpoints

### 2.1 Get Supported Diagnostic Classes: `GET /api/disease/classes`
Returns supported crops (Tomato, Potato, Corn, Pepper) and 16 foliar pathology classes.

### 2.2 Foliar Image Diagnosis: `POST /api/disease/predict`
- **Method**: `POST` (multipart/form-data)
- **Parameters**: `image` (file, max 10MB, JPG/PNG/WEBP), optional `crop` (string)
- **Image Quality Check**: Minimum resolution $32 \times 32$, checks for corruption or extreme blank/darkness.
- **Model Status**: `PRODUCTION_MODEL` (screening tool, `validation_status: "NOT_VALIDATED_FOR_CLINICAL_USE"`).
- **Safety**: Uncalibrated model confidence score ($< 0.45 \implies$ `UNCERTAIN` / `UNKNOWN_OR_LOW_CONFIDENCE`), safe non-chemical recommendations.

---

## 3. Farmer Decision Support Endpoint: `POST /api/decision-support`

Holistic rule-based decision support endpoint synthesizing yield predictions, 5-dimensional multi-hazard condition risks, foliar pathology screening, verified market prices, and PMFBY farmer protection pathways.

### Request Body (`application/json`):
```json
{
  "state": "Punjab",
  "district": "Ludhiana",
  "crop": "Wheat",
  "season": "Rabi",
  "sowing_date": "2025-11-15",
  "farm_area": 4.0,
  "soil_ph": 7.2,
  "nitrogen": 240.0,
  "phosphorus": 22.0,
  "potassium": 185.0,
  "irrigation_available": true,
  "disease_prediction_id": "DIS-A1B2C3D4"
}
```

### Response Schema:
- `prediction_allowed`: `true`
- `risk_score`: `34`
- `risk_level`: `"MODERATE"`
- `risk_summary`: Text summary of overall farm risk level.
- `why_explanation`: Explains the dominant contributing risk factors.
- `top_risk_factors`: Array of 3 highest risk contributors with scores and impact summaries.
- `yield_assessment`: Expected yield, calibrated range, uncertainty status.
- `disease_assessment`: Linked foliar pathology screening result (or DATA_NOT_AVAILABLE).
- `market_assessment`: Verified APMC mandi price and 3 revenue scenarios.
- `recommendations`: Ranked action items (`IMMEDIATE_ATTENTION`, `MONITOR`, `CONSIDER`, `GENERAL`).
- `farmer_protection`: Official PMFBY portal links, helpline numbers, and 72-hour claim windows.

---

## 4. Refusal & Error Responses

### Missing / Unsupported Data (HTTP 422):
```json
{
  "detail": {
    "prediction_allowed": false,
    "reason": "INSUFFICIENT_VERIFIED_DATA",
    "detail": "District 'UnknownDistrict' in Punjab has insufficient verified historical observations."
  }
}
```

### Image Insufficient for Analysis (HTTP 422):
```json
{
  "detail": {
    "prediction_allowed": false,
    "status": "IMAGE_INSUFFICIENT_FOR_ANALYSIS",
    "message": "Image is completely dark or washed out. Please upload an image with visible foliage."
  }
}
```

