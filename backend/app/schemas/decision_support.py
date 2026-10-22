"""
AgriRisk Phase 8: Farmer Decision Support Schemas.
Standardizes rule-based decision support contracts combining yield, multi-hazard risk,
disease diagnostics, verified market indicators, and farmer protection pathways.
"""
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field


class DecisionSupportRequest(BaseModel):
    """
    Farmer input request for holistic decision support.
    """
    state: str = Field(..., min_length=2, max_length=100, description="Indian State (e.g. Punjab, Maharashtra)")
    district: str = Field(..., min_length=2, max_length=100, description="District name (e.g. Ludhiana, Nashik)")
    crop: str = Field(..., min_length=2, max_length=100, description="Crop name (e.g. Wheat, Rice, Cotton)")
    season: str = Field(..., min_length=2, max_length=50, description="Farming season (e.g. Rabi, Kharif)")
    sowing_date: Optional[str] = Field(None, description="Sowing date (YYYY-MM-DD)")
    farm_area: float = Field(..., gt=0.0, le=10000.0, description="Farm area in hectares")

    # Optional soil overrides
    soil_ph: Optional[float] = Field(None, ge=0.0, le=14.0, description="Optional soil pH")
    nitrogen: Optional[float] = Field(None, ge=0.0, description="Optional available Nitrogen (kg/ha)")
    phosphorus: Optional[float] = Field(None, ge=0.0, description="Optional available Phosphorus (kg/ha)")
    potassium: Optional[float] = Field(None, ge=0.0, description="Optional available Potassium (kg/ha)")
    irrigation_available: Optional[bool] = Field(True, description="Irrigation facility status")

    # Optional disease scan reference
    disease_prediction_id: Optional[str] = Field(None, description="Optional recent foliar scan ID")


class TopRiskFactor(BaseModel):
    factor: str
    score: int
    level: str
    impact_summary: str


class PrioritizedRecommendation(BaseModel):
    priority: str = Field(..., description="IMMEDIATE_ATTENTION, MONITOR, CONSIDER, GENERAL")
    category: str
    action: str
    guidance: str


class YieldDecisionSummary(BaseModel):
    status: str = "AVAILABLE"
    expected_yield: Optional[float] = None
    prediction_range_lower: Optional[float] = None
    prediction_range_upper: Optional[float] = None
    unit: str = "tonnes/hectare"
    uncertainty_status: str = "LIMITED"
    explanation: str


class DiseaseDecisionSummary(BaseModel):
    status: str = Field(..., description="AVAILABLE, UNKNOWN_OR_LOW_CONFIDENCE, DATA_NOT_AVAILABLE")
    disease_detected: Optional[str] = None
    model_confidence: Optional[float] = None
    severity: Optional[str] = None
    model_version: str = "DISEASE_MODEL_v1.0"
    deployment_status: str = "LIMITED"
    disclaimer: str


class MarketDecisionSummary(BaseModel):
    status: str = "AVAILABLE"
    modal_price_rs_per_quintal: Optional[float] = None
    data_year: Optional[str] = None
    data_source: str = "Verified Agricultural Mandi Census"
    conservative_revenue: Optional[str] = None
    expected_revenue: Optional[str] = None
    optimistic_revenue: Optional[str] = None
    profit_estimate: Optional[float] = None
    profit_status: str = "NOT_AVAILABLE"


class FarmerProtectionInfo(BaseModel):
    insurance_information: str = "AVAILABLE"
    scheme_name: str = "Pradhan Mantri Fasal Bima Yojana (PMFBY)"
    official_portal_url: str = "https://pmfby.gov.in"
    toll_free_helpline: str = "1800-180-1551 (Kisan Call Centre) / 14447 (PMFBY Helpline)"
    coverage_type: str = "Comprehensive yield loss and localized calamity risk coverage"
    claim_reporting_window: str = "Report localized crop damage within 72 hours via PMFBY portal or district agriculture office."
    disclaimer: str = "AgriRisk provides decision-support estimates and does not underwrite or sell crop insurance policies."


class DecisionSupportResponse(BaseModel):
    """
    Comprehensive rule-based decision support response combining verified ML & agricultural domains.
    """
    prediction_allowed: bool = True
    risk_score: int
    risk_level: str = Field(..., description="LOW, MODERATE, HIGH, CRITICAL")
    risk_summary: str
    why_explanation: str

    top_risk_factors: List[TopRiskFactor]
    risk_dimensions: Dict[str, int]

    yield_assessment: YieldDecisionSummary
    disease_assessment: DiseaseDecisionSummary
    market_assessment: MarketDecisionSummary

    recommendations: List[PrioritizedRecommendation]
    farmer_protection: FarmerProtectionInfo

    data_freshness: Dict[str, str]
    harvest_data_status: str
    year_2026_advisory: Optional[str] = None

    model_versions: Dict[str, str] = Field(
        default_factory=lambda: {
            "yield_model": "AGRIRISK_ML_v1.0",
            "disease_model": "DISEASE_MODEL_v1.0",
            "disease_deployment": "LIMITED",
        }
    )

    decision_support_disclaimer: str = (
        "This assessment provides rule-based agricultural decision support derived from historical and provisional verified datasets. "
        "It does not guarantee crop yields, market prices, profits, or specific farm outcomes. "
        "Consult local agricultural extension officers (KVK) for field-specific management."
    )
