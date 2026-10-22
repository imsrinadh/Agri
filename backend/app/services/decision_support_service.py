"""
AgriRisk Phase 8: Rule-Based Farmer Decision Support Engine.
Synthesizes predictions and risk metrics from frozen AGRIRISK_ML_v1.0,
validated DISEASE_MODEL_v1.0 (Limited Deployment), and verified market indicators.
"""
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
import numpy as np

from app.services.feature_service import feature_service
from app.services.ml_service import ml_service
from app.services.disease_service import disease_service
from app.schemas.decision_support import (
    DecisionSupportRequest,
    DecisionSupportResponse,
    TopRiskFactor,
    PrioritizedRecommendation,
    YieldDecisionSummary,
    DiseaseDecisionSummary,
    MarketDecisionSummary,
    FarmerProtectionInfo,
)


class DecisionSupportService:
    """
    Rule-based interpretation layer over frozen ML models and verified agricultural domains.
    """

    def generate_decision_support(
        self,
        request: DecisionSupportRequest,
        user_id: Optional[str] = "anonymous"
    ) -> DecisionSupportResponse:
        # 1. Check data availability for primary agronomic inputs
        is_available, error_msg = feature_service.check_data_availability(
            state=request.state,
            district=request.district,
            crop=request.crop
        )

        if not is_available:
            raise ValueError(f"INSUFFICIENT_VERIFIED_DATA: {error_msg}")

        # 2. Build feature vector & execute frozen AGRIRISK_ML_v1.0
        feature_df, context = feature_service.build_feature_dataframe(
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

        yield_pred = ml_service.predict_yield(feature_df, base_yield=context["base_yield"])
        risk_output = ml_service.calculate_condition_risk(feature_df, context)
        financial_output = ml_service.calculate_financial_scenarios(yield_pred, context)

        # 3. Assess 5 Risk Dimensions and extract Top Contributing Factors
        dimensions = risk_output["dimensions"]
        risk_level = risk_output["level"]
        risk_score = risk_output["score"]

        # Map quantified top factors from condition risk engine
        engine_top_factors = risk_output.get("top_factors", [])
        
        factor_items = [
            ("Weather", dimensions["weather"], "Seasonal precipitation balance and thermal heat stress"),
            ("Soil Quality", dimensions["soil"], "Soil pH reaction and NPK macronutrient availability"),
            ("Pest Vector", dimensions["pest"], "ICAR pest ETL threshold breaches and vector pressure"),
            ("Yield Stability", dimensions["yield_stability"], "Multi-year district production variance and momentum"),
            ("Market Price", dimensions["market"], "APMC Mandi spot price fluctuations and volatility"),
        ]
        factor_items.sort(key=lambda x: x[1], reverse=True)

        top_factors: List[TopRiskFactor] = []
        for text in engine_top_factors[:3]:
            lower_text = text.lower()
            if any(k in lower_text for k in ["rain", "temperature", "heat", "cold", "frost", "thermal", "weather", "waterlogging"]):
                cat_name = "Weather Risk"
                cat_score = dimensions.get("weather", 40)
            elif any(k in lower_text for k in ["ph", "acid", "alkal", "nitrogen", "phosphorus", "potassium", "soil"]):
                cat_name = "Soil Quality"
                cat_score = dimensions.get("soil", 30)
            elif any(k in lower_text for k in ["pest", "etl", "outbreak", "vector"]):
                cat_name = "Pest Vector"
                cat_score = dimensions.get("pest", 30)
            elif any(k in lower_text for k in ["volatilit", "market", "mandi", "price"]):
                cat_name = "Market Price"
                cat_score = dimensions.get("market", 20)
            else:
                cat_name = "Yield Stability"
                cat_score = dimensions.get("yield_stability", 25)

            lvl = "LOW" if cat_score < 25 else "MODERATE" if cat_score < 50 else "HIGH" if cat_score < 75 else "CRITICAL"
            top_factors.append(
                TopRiskFactor(
                    factor=cat_name,
                    score=cat_score,
                    level=lvl,
                    impact_summary=text
                )
            )

        # Fallback if no specific factors were generated
        if not top_factors:
            for name, score, desc in factor_items[:3]:
                lvl = "LOW" if score < 25 else "MODERATE" if score < 50 else "HIGH" if score < 75 else "CRITICAL"
                top_factors.append(
                    TopRiskFactor(
                        factor=name,
                        score=score,
                        level=lvl,
                        impact_summary=f"{name} condition index is at {score}/100 ({lvl.lower()} tier)."
                    )
                )

        # 4. Formulate Summary and 'Why' Explanation
        primary_driver = engine_top_factors[0] if engine_top_factors else f"Environmental factors for {request.crop}"

        if risk_level == "LOW":
            risk_summary = f"Favorable agro-climatic conditions for {request.crop} in {request.district}."
            why_explanation = f"Agronomic indicators and verified seasonal trends remain within optimal historical thresholds for {request.crop}."
        elif risk_level == "MODERATE":
            risk_summary = f"Moderate risk detected for {request.crop} requiring targeted management."
            why_explanation = f"Composite risk score ({risk_score}/100) is primarily driven by: {primary_driver}."
        elif risk_level == "HIGH":
            risk_summary = f"Elevated agricultural stress identified for {request.crop} in {request.district}."
            why_explanation = f"High risk rating ({risk_score}/100) requires immediate mitigation. Primary cause: {primary_driver}."
        else:  # CRITICAL
            risk_summary = f"Critical multi-hazard risk alert for {request.crop} in {request.district}."
            why_explanation = f"Severe agronomic hazard ({risk_score}/100): {primary_driver}. Urgent protective intervention is recommended."

        # 5. Integrate Disease Diagnostics (DISEASE_MODEL_v1.0)
        disease_summary = self._resolve_disease_assessment(request.disease_prediction_id, user_id)

        # 6. Build Prioritized Recommendations (Ranked by Urgency)
        recommendations = self._build_prioritized_recommendations(
            risk_level=risk_level,
            dimensions=dimensions,
            disease_summary=disease_summary,
            crop=request.crop,
            context=context
        )

        # 7. Harvest Data Status and 2026 Handling
        sowing_year = 2026
        if request.sowing_date:
            try:
                sowing_year = datetime.strptime(request.sowing_date, "%Y-%m-%d").year
            except Exception:
                pass

        year_2026_advisory = None
        if sowing_year >= 2026:
            year_2026_advisory = (
                "2026 harvest outcome is not yet observed in the verified government outcome dataset. "
                "Current yield projections represent empirical ML estimates based on verified 2012–2023 ground truth and provisional indicators."
            )

        # 8. Assemble Full Response
        return DecisionSupportResponse(
            prediction_allowed=True,
            risk_score=risk_score,
            risk_level=risk_level,
            risk_summary=risk_summary,
            why_explanation=why_explanation,
            top_risk_factors=top_factors,
            risk_dimensions=dimensions,
            yield_assessment=YieldDecisionSummary(
                status="AVAILABLE",
                expected_yield=yield_pred["expected_yield"],
                prediction_range_lower=yield_pred["prediction_range"]["lower"],
                prediction_range_upper=yield_pred["prediction_range"]["upper"],
                unit=yield_pred.get("unit", "tonnes/hectare"),
                uncertainty_status=yield_pred.get("uncertainty_status", "LIMITED"),
                explanation="Yield prediction is empirically calibrated on historical verified census data (AGRIRISK_ML_v1.0)."
            ),
            disease_assessment=disease_summary,
            market_assessment=MarketDecisionSummary(
                status="AVAILABLE",
                modal_price_rs_per_quintal=context.get("modal_price", 2200.0),
                data_year=str(context.get("market_data_year", 2025)),
                data_source="Verified State Agricultural Marketing Board (APMC Mandi Census)",
                conservative_revenue=financial_output.get("conservative_revenue"),
                expected_revenue=financial_output.get("expected_revenue"),
                optimistic_revenue=financial_output.get("optimistic_revenue"),
                profit_estimate=None,
                profit_status="NOT_AVAILABLE"
            ),
            recommendations=recommendations,
            farmer_protection=FarmerProtectionInfo(),
            data_freshness={
                "weather_data_year": str(context.get("weather_data_year", 2025)),
                "soil_data_year": str(context.get("soil_data_year", 2024)),
                "pest_data_year": str(context.get("pest_data_year", 2024)),
                "market_data_year": str(context.get("market_data_year", 2025)),
                "latest_final_harvest_outcome": "2023 FINAL",
                "provisional_harvest_indicators": "2024–2025 PROVISIONAL",
            },
            harvest_data_status="PROVISIONAL_ADVANCE" if sowing_year >= 2025 else "FINAL",
            year_2026_advisory=year_2026_advisory
        )

    def _resolve_disease_assessment(
        self,
        prediction_id: Optional[str],
        user_id: Optional[str]
    ) -> DiseaseDecisionSummary:
        if not prediction_id:
            return DiseaseDecisionSummary(
                status="DATA_NOT_AVAILABLE",
                disease_detected=None,
                model_confidence=None,
                severity=None,
                model_version="DISEASE_MODEL_v1.0",
                deployment_status="LIMITED",
                disclaimer="No foliar image uploaded. Image-based disease identification is available via the Crop Disease scan tool."
            )

        try:
            record = disease_service.get_prediction_detail(user_id=user_id or "anonymous", prediction_id=prediction_id)
            if not record.get("prediction_allowed", True) or record.get("status") == "UNKNOWN_OR_LOW_CONFIDENCE":
                return DiseaseDecisionSummary(
                    status="UNKNOWN_OR_LOW_CONFIDENCE",
                    disease_detected="Unknown or Low Confidence",
                    model_confidence=record.get("confidence"),
                    severity="UNKNOWN",
                    model_version="DISEASE_MODEL_v1.0",
                    deployment_status="LIMITED",
                    disclaimer="Unable to confidently identify foliar condition from uploaded image. Seek field confirmation."
                )
            return DiseaseDecisionSummary(
                status="AVAILABLE",
                disease_detected=record.get("disease"),
                model_confidence=record.get("confidence"),
                severity=record.get("severity", "MODERATE"),
                model_version="DISEASE_MODEL_v1.0",
                deployment_status="LIMITED",
                disclaimer="Image-based identification is a decision-support result and requires field confirmation by an agricultural expert."
            )
        except Exception:
            return DiseaseDecisionSummary(
                status="DATA_NOT_AVAILABLE",
                disease_detected=None,
                model_confidence=None,
                severity=None,
                model_version="DISEASE_MODEL_v1.0",
                deployment_status="LIMITED",
                disclaimer="Disease diagnosis record could not be retrieved."
            )

    def _build_prioritized_recommendations(
        self,
        risk_level: str,
        dimensions: Dict[str, int],
        disease_summary: DiseaseDecisionSummary,
        crop: str,
        context: Optional[Dict[str, Any]] = None
    ) -> List[PrioritizedRecommendation]:
        recs: List[PrioritizedRecommendation] = []
        ctx = context or {}
        soil_ph = float(ctx.get("ph", 7.2))
        nitrogen = float(ctx.get("n", 220.0))
        rainfall = float(ctx.get("rain_sum", 400.0))
        pest_name = ctx.get("pest_name", "vector pests")

        # 1. IMMEDIATE ATTENTION (Critical/High Risks or Active Disease)
        if disease_summary.status == "AVAILABLE" and disease_summary.disease_detected and "healthy" not in disease_summary.disease_detected.lower():
            recs.append(
                PrioritizedRecommendation(
                    priority="IMMEDIATE_ATTENTION",
                    category="Crop Pathology",
                    action=f"Inspect foliage for symptom spread: {disease_summary.disease_detected}",
                    guidance=f"Isolate affected lower leaves, avoid overhead sprinkler irrigation, and apply recommended targeted fungicide or biocontrol for {disease_summary.disease_detected}."
                )
            )

        if dimensions["pest"] >= 65:
            recs.append(
                PrioritizedRecommendation(
                    priority="IMMEDIATE_ATTENTION",
                    category="Pest Management",
                    action=f"Intensify field scouting & IPM for active {pest_name}",
                    guidance=f"Deploy crop-specific pheromone and sticky traps; spray recommended botanical neem formulation (10,000 ppm) or registered bio-agent to suppress {pest_name} below ETL."
                )
            )

        if dimensions["weather"] >= 65:
            if rainfall > 1200.0:
                recs.append(
                    PrioritizedRecommendation(
                        priority="IMMEDIATE_ATTENTION",
                        category="Water Management",
                        action=f"Open drainage channels to clear waterlogging in {crop} field",
                        guidance="Clear field perimeter drainage trenches and broad-bed furrows to prevent root-zone hypoxia and fungal collar rot."
                    )
                )
            else:
                recs.append(
                    PrioritizedRecommendation(
                        priority="IMMEDIATE_ATTENTION",
                        category="Water & Microclimate",
                        action=f"Implement moisture conservation & micro-irrigation for {crop}",
                        guidance="Apply 5–7 cm organic straw mulch to curb surface evaporation and schedule protective drip irrigation during morning or late afternoon."
                    )
                )

        # 2. MONITOR (Moderate or Developing Trends)
        if dimensions["soil"] >= 35:
            if soil_ph < 6.0:
                recs.append(
                    PrioritizedRecommendation(
                        priority="MONITOR",
                        category="Soil Health",
                        action="Apply agricultural lime to neutralize soil acidity",
                        guidance=f"Current soil pH ({round(soil_ph, 2)}) restricts nutrient bioavailability. Apply 2.0–2.5 t/ha agricultural limestone to restore phosphorus uptake."
                    )
                )
            elif soil_ph > 7.8:
                recs.append(
                    PrioritizedRecommendation(
                        priority="MONITOR",
                        category="Soil Health",
                        action="Incorporate agricultural gypsum for alkaline/sodic soil correction",
                        guidance=f"Current soil pH ({round(soil_ph, 2)}) causes micronutrient lockout. Incorporate 2.0–3.0 t/ha gypsum followed by leaching and organic FYM."
                    )
                )
            elif nitrogen < 180.0:
                recs.append(
                    PrioritizedRecommendation(
                        priority="MONITOR",
                        category="Soil Fertility",
                        action=f"Split Nitrogen top-dressing for {crop}",
                        guidance=f"Available Nitrogen is low ({int(nitrogen)} kg/ha). Apply Neem-Coated Urea in split doses aligned with active tillering and panicle initiation."
                    )
                )

        if dimensions["market"] >= 45:
            recs.append(
                PrioritizedRecommendation(
                    priority="MONITOR",
                    category="Market Dynamics",
                    action=f"Track APMC Mandi modal price trends for {crop}",
                    guidance="Review arrival volumes on e-NAM and consider WDRA warehouse receipt financing to avoid distress selling during arrival peaks."
                )
            )

        # 3. CONSIDER (Risk Mitigation & Safety)
        if risk_level in ["HIGH", "CRITICAL"]:
            recs.append(
                PrioritizedRecommendation(
                    priority="CONSIDER",
                    category="Farmer Protection",
                    action="Enroll in Pradhan Mantri Fasal Bima Yojana (PMFBY)",
                    guidance="Ensure active crop insurance coverage on pmfby.gov.in before seasonal cut-off date to protect against localized calamitous yield loss."
                )
            )
        else:
            recs.append(
                PrioritizedRecommendation(
                    priority="CONSIDER",
                    category="Crop Planning",
                    action=f"Evaluate intercropping or staggered sowing for {crop}",
                    guidance="Intercropping with compatible legumes enhances biological nitrogen fixation and buffers farm income against localized climate shocks."
                )
            )

        # 4. GENERAL (Continuous Good Agricultural Practices)
        recs.append(
            PrioritizedRecommendation(
                priority="GENERAL",
                category="Field Stewardship",
                action="Maintain routine crop scouting and local extension contact",
                guidance="Continue weekly representative field quadrant inspections and consult your local Krishi Vigyan Kendra (KVK) for agro-advisories."
            )
        )

        return recs


decision_support_service = DecisionSupportService()
