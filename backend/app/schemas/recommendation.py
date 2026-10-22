from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class RecommendationTelemetry(BaseModel):
    """Telemetry grounding the recommendations in live empirical observations."""
    district: str
    state: str
    crop: str
    season: str
    temperature_celsius: Optional[float] = None
    rainfall_forecast_mm: Optional[float] = None
    humidity_pct: Optional[float] = None
    wind_speed_kmh: Optional[float] = None
    soil_ph: Optional[float] = None
    soil_nitrogen_kg_ha: Optional[float] = None
    soil_phosphorus_kg_ha: Optional[float] = None
    soil_potassium_kg_ha: Optional[float] = None
    pest_threat_status: Optional[str] = None
    modal_mandi_price_rs_quintal: Optional[float] = None
    historical_benchmark_yield_tonnes_ha: Optional[float] = None


class RecommendationResponse(BaseModel):
    """
    Actionable agricultural recommendation model with multi-factor risk justifications
    and precise ICAR/PAU scientific chemical & organic protocols.
    """
    recommendation_id: str
    id: Optional[str] = None
    title: str
    risk: Optional[str] = None
    category: str = Field(..., description="Weather Protection, Soil Management, Pest Management, Disease Management, Water Management, Market Planning, Production Management")
    risk_type: str = "Agricultural Risk"
    priority: str = Field(..., description="LOW, MEDIUM, HIGH, or CRITICAL")
    reason: str
    action: str
    expected_benefit: str
    benefit: Optional[str] = None
    status: str = "ACTIVE"
    icon: Optional[str] = None
    dosage: Optional[str] = None
    chemical_active: Optional[str] = None
    organic_alternative: Optional[str] = None
    spray_timing: Optional[str] = None
    scheme_support: Optional[str] = None
    created_at: str


class RecommendationDetail(RecommendationResponse):
    """
    Detailed recommendation profile including source risk metrics.
    """
    source_risk_score: Optional[int] = None
    applied_rule: Optional[str] = None


class RecommendationRequest(BaseModel):
    """
    Field-specific parameter request to dynamically generate localized agronomic recommendations.
    """
    crop: Optional[str] = "Wheat"
    district: Optional[str] = "Ludhiana"
    state: Optional[str] = "Punjab"
    season: Optional[str] = "Rabi"
    farm_area: Optional[float] = 2.0
    soil_ph: Optional[float] = None
    nitrogen: Optional[float] = None
    phosphorus: Optional[float] = None
    potassium: Optional[float] = None
    force_refresh: bool = False


class RecommendationListResponse(BaseModel):
    """
    List wrapper for recommendation responses with empirical telemetry grounding.
    """
    recommendations: List[RecommendationResponse]
    telemetry: Optional[RecommendationTelemetry] = None
    ai_advisory_summary: Optional[str] = None
    advisory_source: str = "ICAR / PAU Package of Practices & Verified Agro-Meteo Telemetry"


class AskAgronomistRequest(BaseModel):
    """Farmer inquiry asking AI Agronomist for guidance grounded in field telemetry."""
    question: str
    crop: Optional[str] = "Rice"
    district: Optional[str] = "Nellore"
    state: Optional[str] = "Andhra Pradesh"
    season: Optional[str] = "Kharif"


class AskAgronomistResponse(BaseModel):
    """Response from AI Agronomist with actionable guidance and scientific citations."""
    answer: str
    action_items: List[str] = []
    source: str = "Google Gemini AI / ICAR Agronomic Knowledge Base"
    confidence: str = "VERIFIED"
    disclaimer: str = "Always verify chemical spray concentrations with local KVK / Block Agricultural Officer."
