# AgriRisk Agricultural Data Sources

**Generated**: 2026-08-26

---

## Summary

| Source | Type | Status | Location |
|--------|------|--------|----------|
| DES APY Crop Production Statistics | Production yield (district-year) | Partially downloaded | ml/data/real/raw/ |
| NASA POWER Daily Agro-Climatology | Weather (daily, district-level) | Partially downloaded | ml/data/real/raw/ |
| Soil Health Card Survey | Soil NPK, pH | Partially downloaded | ml/data/real/raw/ |
| APMC Market Prices | Commodity wholesale prices | NOT YET DOWNLOADED | N/A |
| PlantVillage Disease Dataset | Crop leaf disease images | NOT YET DOWNLOADED | ml/disease/data/raw/ |

---

## 1. DES APY Crop Production Statistics

| Field | Value |
|-------|-------|
| Full Name | Directorate of Economics and Statistics, Area Production and Yield |
| URL | https://data.gov.in/catalog/district-wise-season-wise-crop-production-statistics |
| License | National Data Sharing and Accessibility Policy (NDSAP) — Open Government Data |
| Coverage | 1997-2023, district-level, all major crops |
| Records Available | 56 district-years (partial) |
| Format | CSV |
| Notes | Only 56 records loaded. Full dataset has 300,000+ records. |

## 2. NASA POWER Daily Agro-Climatology

| Field | Value |
|-------|-------|
| Full Name | NASA Prediction of Worldwide Energy Resources (POWER) |
| URL | https://power.larc.nasa.gov/ |
| License | NASA Open Data — CC0 |
| Coverage | 1981-present, global, daily resolution, 0.5-degree grid |
| Records Available | 56 district-years (aligned with DES APY) |
| Format | JSON/CSV API response |
| Variables | Temperature, Rainfall, Humidity, Solar Radiation |

## 3. Soil Health Card Survey

| Field | Value |
|-------|-------|
| Full Name | Government of India Soil Health Card Survey |
| URL | https://soilhealth.dac.gov.in |
| License | Open Government Data |
| Coverage | District-level averages for NPK, pH |
| Records Available | 56 records (aligned with DES APY districts) |
| Variables | N (kg/ha), P (kg/ha), K (kg/ha), pH |

## 4. APMC Market Prices — NOT YET DOWNLOADED

| Field | Value |
|-------|-------|
| Full Name | Agricultural Produce Market Committee (APMC) Wholesale Prices |
| URL | https://agmarknet.gov.in |
| License | Open Government Data |
| Status | NOT YET INTEGRATED |
| Required For | Market risk factor computation |

## 5. PlantVillage Disease Dataset — NOT YET DOWNLOADED

| Field | Value |
|-------|-------|
| Full Name | PlantVillage Crop Pathology Benchmark |
| URL | https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset |
| License | CC0 1.0 Public Domain |
| Size | ~3.5 GB, 54,305 images |
| Status | NOT YET DOWNLOADED |
| Notes | Current disease model was trained on synthetic images. See DATA_PROVENANCE.md |

---

## Unified Dataset

File: `ml/data/real/processed/agririsk_unified.csv`
Records: 56 rows, 22+ features per row
Coverage: 7 districts across Andhra Pradesh and Telangana
Note: 56 rows is INSUFFICIENT for national ML model training.
