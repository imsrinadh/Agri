"""
AgriRisk Phase 5: Production Prediction Schemas (AGRIRISK_ML_v1.0).
Defines request validation and complete dual-output API response contracts.
"""
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field


class UnifiedPredictionRequest(BaseModel):
    """
    Farmer prediction request input validation.
    """
    state: str = Field(..., min_length=2, max_length=100, description="Indian State (e.g. Punjab, Maharashtra)")
    district: str = Field(..., min_length=2, max_length=100, description="District name (e.g. Ludhiana, Nashik)")
    crop: str = Field(..., min_length=2, max_length=100, description="Crop name (e.g. Wheat, Rice, Cotton)")
    season: str = Field(..., min_length=2, max_length=50, description="Farming season (e.g. Rabi, Kharif)")
    sowing_date: Optional[str] = Field(None, description="Sowing date (YYYY-MM-DD)")
    farm_area: float = Field(..., gt=0.0, le=10000.0, description="Farm area in hectares")

    # Optional farmer-specific soil overrides
    soil_ph: Optional[float] = Field(None, ge=0.0, le=14.0, description="Optional measured soil pH")
    nitrogen: Optional[float] = Field(None, ge=0.0, description="Optional available Nitrogen (N) kg/ha")
    phosphorus: Optional[float] = Field(None, ge=0.0, description="Optional available Phosphorus (P) kg/ha")
    potassium: Optional[float] = Field(None, ge=0.0, description="Optional available Potassium (K) kg/ha")
    irrigation_available: Optional[bool] = Field(True, description="Irrigation facility status")


class PredictionRange(BaseModel):
    lower: float
    upper: float


class YieldPredictionOutput(BaseModel):
    expected_yield: float
    unit: str = "tonnes/hectare"
    prediction_range: PredictionRange
    uncertainty_status: str = "LIMITED"


class RiskDimensions(BaseModel):
    weather: int
    soil: int
    pest: int
    yield_stability: int
    market: int


class RiskOutput(BaseModel):
    score: int
    level: str
    dimensions: RiskDimensions
    top_factors: List[str]


class FinancialRiskOutput(BaseModel):
    conservative_revenue: str
    expected_revenue: str
    optimistic_revenue: str
    profit_estimate: Optional[float] = None
    profit_status: str = "NOT_AVAILABLE"


class DataFreshnessOutput(BaseModel):
    weather: int = 2025
    market: int = 2025
    pest: int = 2025
    soil: int = 2025
    latest_harvest_outcome: int = 2025
    latest_final_harvest_outcome: int = 2023


class TelemetryWeather(BaseModel):
    seasonal_rainfall_mm: float
    optimal_rainfall_range: str
    max_temperature_celsius: float
    min_temperature_celsius: float
    average_temperature_celsius: float
    humidity_pct: float
    rainfall_status: str


class TelemetrySoil(BaseModel):
    ph: float
    ph_status: str
    nitrogen_kg_ha: float
    nitrogen_status: str
    phosphorus_kg_ha: float
    phosphorus_status: str
    potassium_kg_ha: float
    potassium_status: str
    organic_carbon_pct: float
    ec_ds_m: float


class TelemetryPest(BaseModel):
    pest_name: str
    severity_score: int
    etl_exceeded: bool
    status: str


class TelemetryMarket(BaseModel):
    modal_price_rs_per_quintal: float
    min_price_rs_per_quintal: float
    max_price_rs_per_quintal: float
    volatility_pct: float


class TelemetryBaseline(BaseModel):
    historical_yield_tonnes_ha: float
    historical_yield_std: float
    momentum_pct: float


class FieldTelemetry(BaseModel):
    weather: TelemetryWeather
    soil: TelemetrySoil
    pest: TelemetryPest
    market: TelemetryMarket
    baseline: TelemetryBaseline


class RiskExplanation(BaseModel):
    summary: str
    score_meaning: str
    primary_driver: str
    secondary_driver: str
    score_breakdown: Dict[str, str]


class ActionRecommendation(BaseModel):
    category: str
    action: str
    urgency: str
    rationale: str


class UnifiedPredictionResponse(BaseModel):
    """
    Standardized Phase 5 Response matching AGRIRISK_ML_v1.0 schema contract.
    Extended with transparent local field telemetry and actionable understanding guidance.
    """
    prediction_allowed: bool = True
    model_version: str = "AGRIRISK_ML_v1.0"
    crop: str
    state: str
    district: str
    yield_prediction: YieldPredictionOutput
    risk: RiskOutput
    financial_risk: FinancialRiskOutput
    data_freshness: DataFreshnessOutput
    harvest_status: Dict[str, str] = {
        "2022": "FINAL",
        "2023": "FINAL",
        "2024": "PROVISIONAL",
        "2025": "PROVISIONAL_ADVANCE"
    }
    field_telemetry: Optional[FieldTelemetry] = None
    risk_explanation: Optional[RiskExplanation] = None
    actionable_guidance: Optional[List[ActionRecommendation]] = None


class PredictionRefusalResponse(BaseModel):
    """
    Response returned when verified agricultural data is insufficient.
    """
    prediction_allowed: bool = False
    reason: str = "INSUFFICIENT_VERIFIED_DATA"
    detail: str
