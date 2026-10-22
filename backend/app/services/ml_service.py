"""
AgriRisk Phase 5: Production-Grade Non-Linear Machine Learning Model Service (AGRIRISK_ML_v2.0).
Provides singleton in-memory access to the dual-output agricultural prediction engine:
- Output A: Expected Yield & Crop-Calibrated Prediction Range (Gradient Boosting & Random Forest Ensemble)
- Output B: Multi-Dimensional Agricultural Condition Risk Engine (Weather, Soil, Pest, Stability, Market)
- Output C: Financial Gross Revenue Scenarios
"""
from typing import Dict, Any, List
from pathlib import Path
import pickle
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor, VotingRegressor

from app.services.feature_service import (
    NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES,
    feature_service,
)

MODEL_VERSION = "AGRIRISK_ML_v2.0 (Ensemble GBR+RFR)"

# Crop-Specific Calibrated Conformal Uncertainty Margins (+/- t/ha)
CROP_CONFORMAL_MARGINS = {
    "Cotton": 0.08,
    "Soybean": 0.20,
    "Mustard": 0.20,
    "Groundnut": 0.25,
    "Wheat": 0.40,
    "Rice": 0.45,
    "Maize": 0.40,
    "Onion": 1.80,
}

# Agronomic Baseline Thresholds per Crop
CROP_AGRO_PROFILES = {
    "Rice": {
        "opt_rain": (750.0, 1500.0),
        "max_temp_opt": 36.0,
        "min_temp_opt": 20.0,
        "n_opt": 240.0,
        "p_opt": 25.0,
        "k_opt": 180.0,
        "ph_opt": (5.5, 7.5),
    },
    "Wheat": {
        "opt_rain": (150.0, 400.0),
        "max_temp_opt": 32.0,
        "min_temp_opt": 4.0,
        "n_opt": 220.0,
        "p_opt": 25.0,
        "k_opt": 160.0,
        "ph_opt": (6.0, 7.8),
    },
    "Cotton": {
        "opt_rain": (500.0, 900.0),
        "max_temp_opt": 38.0,
        "min_temp_opt": 16.0,
        "n_opt": 200.0,
        "p_opt": 20.0,
        "k_opt": 150.0,
        "ph_opt": (6.0, 8.0),
    },
    "Soybean": {
        "opt_rain": (450.0, 850.0),
        "max_temp_opt": 34.0,
        "min_temp_opt": 15.0,
        "n_opt": 180.0,
        "p_opt": 30.0,
        "k_opt": 160.0,
        "ph_opt": (6.0, 7.5),
    },
    "Groundnut": {
        "opt_rain": (400.0, 750.0),
        "max_temp_opt": 35.0,
        "min_temp_opt": 15.0,
        "n_opt": 150.0,
        "p_opt": 25.0,
        "k_opt": 140.0,
        "ph_opt": (6.0, 7.5),
    },
    "Maize": {
        "opt_rain": (400.0, 800.0),
        "max_temp_opt": 36.0,
        "min_temp_opt": 12.0,
        "n_opt": 220.0,
        "p_opt": 25.0,
        "k_opt": 160.0,
        "ph_opt": (5.8, 7.5),
    },
    "Mustard": {
        "opt_rain": (120.0, 300.0),
        "max_temp_opt": 30.0,
        "min_temp_opt": 5.0,
        "n_opt": 180.0,
        "p_opt": 20.0,
        "k_opt": 140.0,
        "ph_opt": (6.0, 7.5),
    },
    "Onion": {
        "opt_rain": (350.0, 700.0),
        "max_temp_opt": 32.0,
        "min_temp_opt": 10.0,
        "n_opt": 200.0,
        "p_opt": 30.0,
        "k_opt": 180.0,
        "ph_opt": (6.0, 7.5),
    },
}

DEFAULT_AGRO_PROFILE = {
    "opt_rain": (400.0, 800.0),
    "max_temp_opt": 35.0,
    "min_temp_opt": 12.0,
    "n_opt": 200.0,
    "p_opt": 25.0,
    "k_opt": 160.0,
    "ph_opt": (6.0, 7.5),
}


class MLService:
    """Non-linear ensemble prediction and multi-dimensional risk engine singleton."""

    def __init__(self):
        self.model_version = MODEL_VERSION
        self.is_loaded = False
        self._initialize_ensemble_model()

    def _initialize_ensemble_model(self):
        """Trains and caches the non-linear Voting Ensemble (Gradient Boosting + Random Forest)."""
        num_pipe = Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler())
        ])
        cat_pipe = Pipeline([
            ("imputer", SimpleImputer(strategy="constant", fill_value="Unknown")),
            ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
        ])
        preprocessor = ColumnTransformer([
            ("num", num_pipe, NUMERICAL_FEATURES),
            ("cat", cat_pipe, CATEGORICAL_FEATURES)
        ], remainder="drop")

        gbr = GradientBoostingRegressor(
            n_estimators=120,
            max_depth=4,
            learning_rate=0.05,
            subsample=0.85,
            random_state=42
        )
        rfr = RandomForestRegressor(
            n_estimators=100,
            max_depth=6,
            min_samples_split=3,
            random_state=42
        )
        ensemble = VotingRegressor([("gb", gbr), ("rf", rfr)])

        self.pipeline = Pipeline([
            ("prep", preprocessor),
            ("reg", ensemble)
        ])

        cache_path = Path(__file__).resolve().parent.parent / "ml" / "models" / "agririsk_ensemble_model.pkl"
        cache_path.parent.mkdir(parents=True, exist_ok=True)

        if cache_path.exists():
            try:
                with open(cache_path, "rb") as f:
                    self.pipeline = pickle.load(f)
                self.is_loaded = True
                return
            except Exception:
                pass

        # Load verified unified panel dataset (2012–2022) with 308 panel records
        dataset_path = Path(__file__).resolve().parent.parent / "data" / "real" / "processed" / "agririsk_unified_expanded.csv"
        if dataset_path.exists():
            df_train = pd.read_csv(dataset_path)
            avail_cols = [c for c in NUMERICAL_FEATURES + CATEGORICAL_FEATURES if c in df_train.columns]
            if len(avail_cols) == len(NUMERICAL_FEATURES + CATEGORICAL_FEATURES):
                X_train = df_train[NUMERICAL_FEATURES + CATEGORICAL_FEATURES]
                y_train = df_train["yield_tonnes_per_hectare"].values
                self.pipeline.fit(X_train, y_train)
                self.is_loaded = True
                try:
                    with open(cache_path, "wb") as f:
                        pickle.dump(self.pipeline, f)
                except Exception:
                    pass
                return

        self.is_loaded = False

    def predict_yield(self, feat_df: pd.DataFrame, base_yield: float) -> Dict[str, Any]:
        """Output A: Executes non-linear expected yield prediction with crop-calibrated conformal range."""
        row = feat_df.iloc[0]
        crop = str(row.get("crop", "Wheat"))

        try:
            pred = float(self.pipeline.predict(feat_df[NUMERICAL_FEATURES + CATEGORICAL_FEATURES])[0])
            exp_yield = max(0.1, round(pred, 2))
        except Exception:
            # Fallback to historical baseline if pipeline inference fails
            exp_yield = round(float(base_yield), 2)

        # Calibrate conformal bounds proportionally to crop biology
        margin = CROP_CONFORMAL_MARGINS.get(crop, max(0.1, round(base_yield * 0.09, 2)))
        y_low = max(0.05, round(exp_yield - margin, 2))
        y_high = round(exp_yield + margin, 2)
        if y_high <= y_low:
            y_high = round(y_low + 0.1, 2)

        return {
            "expected_yield": exp_yield,
            "unit": "tonnes/hectare",
            "prediction_range": {
                "lower": y_low,
                "upper": y_high
            },
            "uncertainty_status": "LIMITED",
            "conformal_margin_tonnes_ha": margin,
            "historical_baseline_yield": round(base_yield, 2)
        }

    def calculate_condition_risk(self, feat_df: pd.DataFrame, context: Dict[str, Any]) -> Dict[str, Any]:
        """Output B: Calculates comprehensive 5-dimensional agricultural condition risk (35/20/15/20/10)."""
        row = feat_df.iloc[0]
        crop = str(row.get("crop", "Wheat"))
        profile = CROP_AGRO_PROFILES.get(crop, DEFAULT_AGRO_PROFILE)

        rain = float(row.get("seasonal_rainfall_mm", context.get("rain_sum", 400.0)))
        t_max = float(row.get("max_temperature_celsius", context.get("t_max", 32.0)))
        t_min = float(row.get("min_temperature_celsius", context.get("t_min", 18.0)))
        t_avg = float(row.get("average_temperature_celsius", context.get("t_avg", 25.0)))
        humidity = float(context.get("humidity", 55.0))

        opt_min, opt_max = profile["opt_rain"]
        t_opt_warn = profile["max_temp_opt"]
        t_min_crit = profile["min_temp_opt"]

        top_factors = []

        # 1. Weather Risk (35%): Deficit (drought) AND excess (flood), heat, and cold
        rain_deficit_pen = 0.0
        rain_excess_pen = 0.0
        if rain < opt_min:
            deficit_pct = ((opt_min - rain) / (opt_min + 1e-4)) * 100.0
            rain_deficit_pen = min(60.0, (deficit_pct / 100.0) * 60.0)
            top_factors.append((
                rain_deficit_pen,
                f"Seasonal rainfall deficit: {round(rain, 1)} mm received vs {int(opt_min)}–{int(opt_max)} mm optimal for {crop}"
            ))
        elif rain > opt_max * 1.25:
            excess_pct = ((rain - opt_max) / (opt_max + 1e-4)) * 100.0
            rain_excess_pen = min(55.0, (excess_pct / 100.0) * 45.0)
            top_factors.append((
                rain_excess_pen,
                f"Excess rainfall / waterlogging alert: {round(rain, 1)} mm vs {int(opt_max)} mm maximum crop tolerance"
            ))

        heat_pen = 0.0
        if t_max > t_opt_warn:
            heat_pen = min(45.0, (t_max - t_opt_warn) * 5.0)
            top_factors.append((
                heat_pen,
                f"Thermal heat shock: Max temperature {round(t_max, 1)}°C exceeds {crop} threshold ({int(t_opt_warn)}°C)"
            ))

        cold_pen = 0.0
        if t_min < t_min_crit:
            cold_pen = min(35.0, (t_min_crit - t_min) * 4.0)
            top_factors.append((
                cold_pen,
                f"Cold/frost exposure: Min temperature {round(t_min, 1)}°C below {crop} sensitivity threshold ({int(t_min_crit)}°C)"
            ))

        w_score = int(round(np.clip(5.0 + rain_deficit_pen + rain_excess_pen + heat_pen + cold_pen, 0, 100)))

        # 2. Soil Risk (20%): pH non-linear curve + NPK macronutrients + EC salinity
        ph = float(row.get("soil_ph", context.get("ph", 7.2)))
        n = float(row.get("available_nitrogen_kg_ha", context.get("n", 220.0)))
        p = float(row.get("available_phosphorus_kg_ha", context.get("p", 20.0)))
        k = float(row.get("available_potassium_kg_ha", context.get("k", 200.0)))
        ec = float(row.get("electrical_conductivity_ds_m", context.get("ec", 0.35)))

        ph_min, ph_max = profile["ph_opt"]
        ph_pen = 0.0
        if ph < ph_min:
            ph_pen = min(40.0, (ph_min - ph) * 28.0)
            top_factors.append((
                ph_pen,
                f"Soil acidification stress: pH {round(ph, 2)} (Acidic vs {ph_min}–{ph_max} optimal)"
            ))
        elif ph > ph_max:
            ph_pen = min(40.0, (ph - ph_max) * 28.0)
            top_factors.append((
                ph_pen,
                f"Soil alkalinity/sodicity stress: pH {round(ph, 2)} (Alkaline vs {ph_min}–{ph_max} optimal)"
            ))

        n_opt = profile["n_opt"]
        n_pen = 0.0
        if n < n_opt:
            n_pen = min(30.0, ((n_opt - n) / n_opt) * 35.0)
            top_factors.append((
                n_pen,
                f"Available Nitrogen deficiency: {int(n)} kg/ha (Deficit vs {int(n_opt)} kg/ha requirement)"
            ))

        p_opt = profile["p_opt"]
        p_pen = 0.0
        if p < p_opt:
            p_pen = min(20.0, ((p_opt - p) / p_opt) * 25.0)
            top_factors.append((
                p_pen,
                f"Available Phosphorus deficit: {int(p)} kg/ha (Below {int(p_opt)} kg/ha requirement)"
            ))

        k_opt = profile["k_opt"]
        k_pen = 0.0
        if k < k_opt:
            k_pen = min(20.0, ((k_opt - k) / k_opt) * 25.0)
            top_factors.append((
                k_pen,
                f"Available Potassium deficit: {int(k)} kg/ha (Below {int(k_opt)} kg/ha requirement)"
            ))

        ec_pen = min(25.0, (ec - 1.2) * 18.0) if ec > 1.2 else 0.0
        s_score = int(round(np.clip(5.0 + ph_pen + n_pen + p_pen + k_pen + ec_pen, 0, 100)))

        # 3. Pest & Disease Risk (15%): ICAR ETL breach, vector severity, humidity fungal favorability
        etl = int(row.get("etl_exceeded_flag", context.get("pest_etl", 0)))
        sev = float(row.get("pest_severity_score", context.get("pest_sev", 0)))
        pest_name = context.get("pest_name", "Active vector")

        if etl:
            top_factors.append((
                40.0,
                f"Pest Economic Threshold Level (ETL) alert: Active {pest_name} outbreak in district"
            ))
        elif sev > 1:
            top_factors.append((
                20.0,
                f"Moderate pest pressure observed: {pest_name}"
            ))

        fungal_hazard = 20.0 if (humidity > 75.0 and 20.0 <= t_avg <= 30.0) else 5.0
        p_score = int(round(np.clip(10.0 + (sev * 15.0) + (35.0 if etl else 0.0) + fungal_hazard, 0, 100)))

        # 4. Yield Stability Risk (20%): Historical standard deviation & negative momentum
        mom = float(row.get("prev_year_yield_momentum_pct", 0.0))
        base_yield = float(context.get("base_yield", 3.5))
        std_yield = float(context.get("std_yield", 0.3))
        std_ratio = (std_yield / (base_yield + 1e-4))
        mom_pen = abs(mom) * 1.2 if mom < 0 else 0.0

        if mom < -10.0:
            top_factors.append((
                25.0,
                f"Negative historical production momentum ({round(mom, 1)}% decline in prior harvest)"
            ))

        y_score = int(round(np.clip(15.0 + (std_ratio * 75.0) + mom_pen, 0, 100)))

        # 5. Market Risk (10%): Price volatility & spread
        vol = float(row.get("price_volatility_pct", context.get("volatility", 10.0)))
        if vol > 15.0:
            top_factors.append((
                18.0,
                f"High commodity price volatility: {round(vol, 1)}% APMC Mandi price variance"
            ))

        m_score = int(round(np.clip(vol * 2.5 + 10.0, 0, 100)))

        # Composite Multi-Hazard Risk Score (35/20/15/20/10)
        comp_score = int(round((w_score * 0.35) + (s_score * 0.20) + (p_score * 0.15) + (y_score * 0.20) + (m_score * 0.10)))
        comp_score = int(np.clip(comp_score, 0, 100))

        if comp_score < 25:
            tier = "LOW"
        elif comp_score < 50:
            tier = "MODERATE"
        elif comp_score < 75:
            tier = "HIGH"
        else:
            tier = "CRITICAL"

        # Sort factors by severity penalty
        top_factors.sort(key=lambda x: x[0], reverse=True)
        factors_clean = [f[1] for f in top_factors[:3]]
        if not factors_clean:
            factors_clean = [f"Optimal agro-climatic conditions for {crop} across all evaluated dimensions."]

        return {
            "score": comp_score,
            "level": tier,
            "dimensions": {
                "weather": w_score,
                "soil": s_score,
                "pest": p_score,
                "yield_stability": y_score,
                "market": m_score,
            },
            "top_factors": factors_clean
        }

    def calculate_financial_scenarios(self, yield_pred: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Calculates revenue scenarios propagating yield prediction range and market prices."""
        exp_y = yield_pred["expected_yield"]
        y_low = yield_pred["prediction_range"]["lower"]
        y_high = yield_pred["prediction_range"]["upper"]

        modal_p = float(context.get("modal_price", 2200.0))
        min_p = float(context.get("min_price", modal_p * 0.90))
        max_p = float(context.get("max_price", modal_p * 1.10))

        # 1 Tonne = 10 Quintals
        exp_rev = int(round(exp_y * 10.0 * modal_p))
        cons_rev = int(round(y_low * 10.0 * min_p))
        opt_rev = int(round(y_high * 10.0 * max_p))

        return {
            "conservative_revenue": f"Rs. {cons_rev:,} / hectare",
            "expected_revenue": f"Rs. {exp_rev:,} / hectare",
            "optimistic_revenue": f"Rs. {opt_rev:,} / hectare",
            "profit_estimate": None,
            "profit_status": "NOT_AVAILABLE"
        }

    def generate_risk_explanation(
        self,
        score: int,
        level: str,
        dimensions: Dict[str, int],
        top_factors: List[str],
        crop: str,
        district: str,
    ) -> Dict[str, Any]:
        """Generates plain-English interpretation of agricultural risk assessment for farmers."""
        if level == "LOW":
            meaning = (
                f"Conditions in {district} are highly favorable for {crop}. "
                "Agro-climatic stress is minimal. Standard field management and routine observation are recommended."
            )
        elif level == "MODERATE":
            meaning = (
                f"Manageable agronomic risks are detected for {crop} in {district}. "
                "While conditions support standard growth, specific stress factors require monitoring to prevent yield degradation."
            )
        elif level == "HIGH":
            meaning = (
                f"Significant environmental or biological stress is present for {crop} in {district}. "
                "Yield loss is probable without timely intervention. Implement corrective soil, water, or pest protocols immediately."
            )
        else: # CRITICAL
            meaning = (
                f"Critical multi-factor hazard alert for {crop} in {district}. "
                "Severe agro-climatic anomalies or threshold breaches pose a major threat to harvest survival. Execute emergency protective measures."
            )

        driver1 = top_factors[0] if len(top_factors) > 0 else "Overall agro-climatic baseline"
        driver2 = top_factors[1] if len(top_factors) > 1 else "Regional yield variance"

        breakdown = {
            "weather": f"Weather Hazard ({dimensions.get('weather', 0)}/100, 35% weight): Seasonal rainfall deficit/excess and thermal anomalies.",
            "soil": f"Soil Chemical Hazard ({dimensions.get('soil', 0)}/100, 20% weight): pH suitability and NPK macronutrient availability.",
            "pest": f"Pest & Disease Pressure ({dimensions.get('pest', 0)}/100, 15% weight): ICAR NCIPM vector surveillance and threshold breach.",
            "yield_stability": f"Yield Stability Risk ({dimensions.get('yield_stability', 0)}/100, 20% weight): Historical harvest volatility and momentum.",
            "market": f"APMC Mandi Economics ({dimensions.get('market', 0)}/100, 10% weight): Commodity wholesale price fluctuations.",
        }

        return {
            "summary": f"Your farm in {district} has a {level} condition risk index ({score}/100) for {crop}.",
            "score_meaning": meaning,
            "primary_driver": driver1,
            "secondary_driver": driver2,
            "score_breakdown": breakdown,
        }

    def generate_actionable_guidance(
        self,
        crop: str,
        season: str,
        context: Dict[str, Any],
        dimensions: Dict[str, int],
        top_factors: List[str],
    ) -> List[Dict[str, str]]:
        """Generates concrete, actionable agronomic guidelines prioritized by hazard severity."""
        guidance = []
        w_score = dimensions.get("weather", 0)
        s_score = dimensions.get("soil", 0)
        p_score = dimensions.get("pest", 0)
        m_score = dimensions.get("market", 0)

        # 1. Immediate Next Steps (Next 7-14 Days)
        if p_score >= 35 or context.get("pest_etl", 0) == 1:
            pest_name = context.get("pest_name", "pest vector")
            guidance.append({
                "category": "Immediate Priority (Next 7–14 Days)",
                "action": f"Initiate field scouting for {pest_name}. Deploy yellow sticky traps and species-specific pheromone lures (5–8 traps/ha).",
                "urgency": "HIGH",
                "rationale": f"ICAR surveillance indicates active {pest_name} threshold elevation in the district."
            })
        elif w_score >= 45:
            guidance.append({
                "category": "Immediate Priority (Next 7–14 Days)",
                "action": "Inspect root-zone soil moisture and apply light frequent protective irrigation during early morning hours.",
                "urgency": "HIGH",
                "rationale": "High agro-climatic thermal or rainfall stress detected in the district."
            })
        else:
            guidance.append({
                "category": "Immediate Priority (Next 7–14 Days)",
                "action": f"Maintain routine 7-day crop scouting cycle for vegetative vigor and foliar health.",
                "urgency": "LOW",
                "rationale": f"Current baseline conditions for {crop} are stable with no urgent threshold breaches."
            })

        # 2. Irrigation & Water Strategy
        rain_sum = float(context.get("rain_sum", 400.0))
        profile = CROP_AGRO_PROFILES.get(crop, DEFAULT_AGRO_PROFILE)
        opt_min, opt_max = profile["opt_rain"]
        if rain_sum < opt_min:
            guidance.append({
                "category": "Irrigation & Moisture Strategy",
                "action": "Deploy micro-irrigation (drip or sprinkler) and apply 5-7 cm organic residue/straw mulching to conserve moisture.",
                "urgency": "HIGH",
                "rationale": f"Seasonal rainfall ({round(rain_sum, 1)} mm) is below optimal crop threshold ({int(opt_min)}–{int(opt_max)} mm)."
            })
        elif rain_sum > opt_max * 1.2:
            guidance.append({
                "category": "Irrigation & Moisture Strategy",
                "action": "Clear bund drainage channels and construct field outlets to prevent water stagnation and root hypoxia.",
                "urgency": "MEDIUM",
                "rationale": f"Cumulative precipitation ({round(rain_sum, 1)} mm) exceeds optimal maximum tolerance ({int(opt_max)} mm)."
            })
        else:
            guidance.append({
                "category": "Irrigation & Moisture Strategy",
                "action": "Maintain scheduled irrigation matching critical phenological stages (flowering and grain/boll formation).",
                "urgency": "LOW",
                "rationale": "Rainfall and available moisture remain within favorable agronomic parameters."
            })

        # 3. Soil & Nutrient Correction
        ph = float(context.get("ph", 7.2))
        n = float(context.get("n", 220.0))
        n_opt = float(profile.get("n_opt", 200.0))
        if ph < 6.0:
            guidance.append({
                "category": "Soil & Nutrient Management",
                "action": "Incorporate agricultural grade lime (CaCO3) at 250–350 kg/ha to alleviate soil acidity and boost phosphorus uptake.",
                "urgency": "MEDIUM",
                "rationale": f"Soil pH is acidic ({round(ph, 2)} vs {profile['ph_opt'][0]}–{profile['ph_opt'][1]} optimal)."
            })
        elif ph > 8.0:
            guidance.append({
                "category": "Soil & Nutrient Management",
                "action": "Apply agricultural gypsum or farmyard manure (FYM) to mitigate sodicity and enhance micronutrient availability.",
                "urgency": "MEDIUM",
                "rationale": f"Soil is moderately alkaline ({round(ph, 2)}), restricting micronutrient bioavailability."
            })
        elif n < n_opt * 0.85:
            n_deficit = int(n_opt - n)
            guidance.append({
                "category": "Soil & Nutrient Management",
                "action": f"Top-dress with urea or ammonium sulphate to compensate for estimated {n_deficit} kg/ha Nitrogen deficit.",
                "urgency": "MEDIUM",
                "rationale": f"Available Soil Nitrogen ({int(n)} kg/ha) is deficient relative to {crop} requirement ({int(n_opt)} kg/ha)."
            })
        else:
            guidance.append({
                "category": "Soil & Nutrient Management",
                "action": "Execute standard split dosage of balanced NPK per package of practices.",
                "urgency": "LOW",
                "rationale": "Soil reaction and macronutrient reserves meet baseline requirements."
            })

        # 4. Market Economics & Post-Harvest Strategy
        modal_p = float(context.get("modal_price", 2200.0))
        vol = float(context.get("volatility", 10.0))
        if vol > 15.0 or m_score >= 40:
            guidance.append({
                "category": "Market & Post-Harvest Economics",
                "action": "Avoid immediate post-harvest distress sale; store in WDRA accredited warehouses using e-NWR pledge financing.",
                "urgency": "MEDIUM",
                "rationale": f"APMC wholesale mandi prices display high volatility ({round(vol, 1)}% variance). Prices typically rebound 4–8 weeks post arrival glut."
            })
        else:
            guidance.append({
                "category": "Market & Post-Harvest Economics",
                "action": f"Target local APMC mandi arrivals during mid-week trading hours; wholesale modal rate is steady around ₹{int(modal_p)}/quintal.",
                "urgency": "LOW",
                "rationale": "Mandi price volatility is moderate and demand absorption is stable."
            })

        return guidance


ml_service = MLService()

