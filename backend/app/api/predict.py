"""
AgriRisk Phase 5: Primary Agricultural Prediction API Router (POST /api/predict).
Executes frozen AGRIRISK_ML_v1.0 dual-output pipeline:
- Validates input geographic and crop parameters
- Checks data availability across all 5 verified domains
- Builds leak-free feature vector
- Generates expected yield with conformal uncertainty range
- Computes 5-dimensional condition risk score and top factors
- Computes gross revenue scenarios
- Returns standardized response with data freshness and harvest provenance
"""
import logging
from typing import Union
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import ValidationError

from app.schemas.prediction import (
    UnifiedPredictionRequest,
    UnifiedPredictionResponse,
    PredictionRefusalResponse,
    YieldPredictionOutput,
    PredictionRange,
    RiskOutput,
    RiskDimensions,
    FinancialRiskOutput,
    DataFreshnessOutput,
    FieldTelemetry,
    TelemetryWeather,
    TelemetrySoil,
    TelemetryPest,
    TelemetryMarket,
    TelemetryBaseline,
    RiskExplanation,
    ActionRecommendation,
)
from app.services.feature_service import feature_service
from app.services.ml_service import ml_service, CROP_AGRO_PROFILES, DEFAULT_AGRO_PROFILE

router = APIRouter(prefix="/api/predict", tags=["Agricultural Prediction Engine"])
logger = logging.getLogger("agririsk.prediction")


@router.post(
    "",
    response_model=Union[UnifiedPredictionResponse, PredictionRefusalResponse],
    summary="Execute Agricultural Outcome & Multi-Hazard Risk Prediction (AGRIRISK_ML_v1.0)",
    status_code=status.HTTP_200_OK,
)
def predict_agricultural_outcome(request: UnifiedPredictionRequest):
    """
    Main farmer-facing prediction endpoint connecting the frozen ML system with verified data.
    """
    logger.info(f"Received prediction request: State={request.state}, District={request.district}, Crop={request.crop}")

    # 1. Data Availability & Input Validation Check
    is_available, error_msg = feature_service.check_data_availability(
        state=request.state,
        district=request.district,
        crop=request.crop
    )

    if not is_available:
        logger.warning(f"Data check failed for {request.district}, {request.state}: {error_msg}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "prediction_allowed": False,
                "reason": "INSUFFICIENT_VERIFIED_DATA",
                "detail": error_msg or "Insufficient verified historical observations for this district/crop."
            }
        )

    try:
        # 2. Build feature vector
        feat_df, context = feature_service.build_feature_dataframe(
            state=request.state,
            district=request.district,
            crop=request.crop,
            season=request.season,
            farm_area=request.farm_area,
            soil_ph_override=request.soil_ph,
            nitrogen_override=request.nitrogen,
            phosphorus_override=request.phosphorus,
            potassium_override=request.potassium,
        )

        # 3. Output A: Expected Yield Prediction with Conformal Range
        yield_out = ml_service.predict_yield(feat_df, base_yield=context["base_yield"])

        # 4. Output B: Multi-Dimensional Condition Risk Calculation
        risk_out = ml_service.calculate_condition_risk(feat_df, context)

        # 5. Financial Risk Scenarios
        financial_out = ml_service.calculate_financial_scenarios(yield_out, context)

        # 6. Assemble Transparent Field Telemetry & Farmer Explanations
        profile = CROP_AGRO_PROFILES.get(request.crop.capitalize(), DEFAULT_AGRO_PROFILE)
        opt_rain = profile.get("opt_rain", (400.0, 800.0))
        rain_val = float(context.get("rain_sum", 400.0))
        if rain_val < opt_rain[0]:
            rain_stat = "DEFICIT (Below optimal)"
        elif rain_val > opt_rain[1] * 1.15:
            rain_stat = "EXCESS (Above optimal)"
        else:
            rain_stat = "OPTIMAL (Normal zone)"

        ph_val = float(context.get("ph", 7.2))
        ph_stat = "ACIDIC" if ph_val < 6.0 else ("ALKALINE" if ph_val > 7.8 else "OPTIMAL / NEUTRAL")
        n_val = float(context.get("n", 220.0))
        n_stat = "DEFICIENT" if n_val < 180.0 else "ADEQUATE"
        p_val = float(context.get("p", 20.0))
        p_stat = "DEFICIENT" if p_val < 15.0 else "ADEQUATE"
        k_val = float(context.get("k", 200.0))
        k_stat = "DEFICIENT" if k_val < 140.0 else "ADEQUATE"

        p_etl = bool(context.get("pest_etl", 0))
        pest_stat = "ACTIVE OUTBREAK (ETL EXCEEDED)" if p_etl else "NORMAL MONITORING"

        telemetry_obj = FieldTelemetry(
            weather=TelemetryWeather(
                seasonal_rainfall_mm=round(rain_val, 1),
                optimal_rainfall_range=f"{int(opt_rain[0])}–{int(opt_rain[1])} mm",
                max_temperature_celsius=round(float(context.get("t_max", 32.0)), 1),
                min_temperature_celsius=round(float(context.get("t_min", 18.0)), 1),
                average_temperature_celsius=round(float(context.get("t_avg", 25.0)), 1),
                humidity_pct=round(float(context.get("humidity", 55.0)), 1),
                rainfall_status=rain_stat,
            ),
            soil=TelemetrySoil(
                ph=round(ph_val, 2),
                ph_status=ph_stat,
                nitrogen_kg_ha=round(n_val, 1),
                nitrogen_status=n_stat,
                phosphorus_kg_ha=round(p_val, 1),
                phosphorus_status=p_stat,
                potassium_kg_ha=round(k_val, 1),
                potassium_status=k_stat,
                organic_carbon_pct=round(float(context.get("oc", 0.52)), 2),
                ec_ds_m=round(float(context.get("ec", 0.35)), 2),
            ),
            pest=TelemetryPest(
                pest_name=str(context.get("pest_name", "None")),
                severity_score=int(context.get("pest_sev", 0)),
                etl_exceeded=p_etl,
                status=pest_stat,
            ),
            market=TelemetryMarket(
                modal_price_rs_per_quintal=round(float(context.get("modal_price", 2200.0)), 1),
                min_price_rs_per_quintal=round(float(context.get("min_price", 1980.0)), 1),
                max_price_rs_per_quintal=round(float(context.get("max_price", 2420.0)), 1),
                volatility_pct=round(float(context.get("volatility", 10.0)), 1),
            ),
            baseline=TelemetryBaseline(
                historical_yield_tonnes_ha=round(float(context.get("base_yield", 3.5)), 2),
                historical_yield_std=round(float(context.get("std_yield", 0.2)), 2),
                momentum_pct=round(float(context.get("momentum", 0.0)), 1),
            ),
        )

        explanation_raw = ml_service.generate_risk_explanation(
            score=risk_out["score"],
            level=risk_out["level"],
            dimensions=risk_out["dimensions"],
            top_factors=risk_out["top_factors"],
            crop=request.crop.capitalize(),
            district=request.district.title(),
        )
        explanation_obj = RiskExplanation(**explanation_raw)

        guidance_raw = ml_service.generate_actionable_guidance(
            crop=request.crop.capitalize(),
            season=request.season.capitalize(),
            context=context,
            dimensions=risk_out["dimensions"],
            top_factors=risk_out["top_factors"],
        )
        guidance_obj = [ActionRecommendation(**g) for g in guidance_raw]

        # 7. Assemble Standardized Response Contract
        response = UnifiedPredictionResponse(
            prediction_allowed=True,
            model_version=ml_service.model_version,
            crop=request.crop.capitalize(),
            state=request.state.title(),
            district=request.district.title(),
            yield_prediction=YieldPredictionOutput(
                expected_yield=yield_out["expected_yield"],
                unit="tonnes/hectare",
                prediction_range=PredictionRange(
                    lower=yield_out["prediction_range"]["lower"],
                    upper=yield_out["prediction_range"]["upper"]
                ),
                uncertainty_status=yield_out.get("uncertainty_status", "CALIBRATED_CONFORMAL")
            ),
            risk=RiskOutput(
                score=risk_out["score"],
                level=risk_out["level"],
                dimensions=RiskDimensions(
                    weather=risk_out["dimensions"]["weather"],
                    soil=risk_out["dimensions"]["soil"],
                    pest=risk_out["dimensions"]["pest"],
                    yield_stability=risk_out["dimensions"]["yield_stability"],
                    market=risk_out["dimensions"]["market"],
                ),
                top_factors=risk_out["top_factors"]
            ),
            financial_risk=FinancialRiskOutput(
                conservative_revenue=financial_out["conservative_revenue"],
                expected_revenue=financial_out["expected_revenue"],
                optimistic_revenue=financial_out["optimistic_revenue"],
                profit_estimate=None,
                profit_status="NOT_AVAILABLE"
            ),
            data_freshness=DataFreshnessOutput(
                weather=2025,
                market=2025,
                pest=2025,
                soil=2025,
                latest_harvest_outcome=2025,
                latest_final_harvest_outcome=2023
            ),
            harvest_status={
                "2022": "FINAL",
                "2023": "FINAL",
                "2024": "PROVISIONAL",
                "2025": "PROVISIONAL_ADVANCE"
            },
            field_telemetry=telemetry_obj,
            risk_explanation=explanation_obj,
            actionable_guidance=guidance_obj,
        )

        logger.info(f"Successfully generated prediction for {request.district}: Yield={yield_out['expected_yield']} t/ha, Risk={risk_out['score']} ({risk_out['level']})")
        return response

    except Exception as e:
        logger.error(f"Internal prediction failure: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "prediction_allowed": False,
                "reason": "INTERNAL_MODEL_ERROR",
                "detail": f"An unexpected error occurred during ML inference: {str(e)}"
            }
        )
