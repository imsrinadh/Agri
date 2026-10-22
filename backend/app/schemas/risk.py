from typing import List, Optional
from pydantic import BaseModel, Field


class RiskPredictionRequest(BaseModel):
    """
    Input schema for agricultural risk prediction analysis.
    Validates physical and environmental agronomic ranges.
    """
    region: str = Field(..., min_length=2, max_length=100, description="District / Region name (e.g. Nellore)")
    crop: str = Field(..., min_length=2, max_length=100, description="Crop name (e.g. Rice, Tomato)")
    season: str = Field(..., min_length=2, max_length=50, description="Farming season (e.g. Kharif, Rabi)")
    temperature: float = Field(..., ge=-10.0, le=60.0, description="Temperature in Celsius (-10 to 60)")
    rainfall: float = Field(..., ge=0.0, le=3000.0, description="Rainfall in mm (>= 0)")
    humidity: float = Field(..., ge=0.0, le=100.0, description="Relative humidity percentage (0 - 100)")
    soil_moisture: float = Field(..., ge=0.0, le=100.0, description="Soil moisture percentage (0 - 100)")
    soil_ph: float = Field(..., ge=0.0, le=14.0, description="Soil pH level (0 - 14)")
    nitrogen: float = Field(..., ge=0.0, description="Soil Nitrogen (N) content in kg/ha (>= 0)")
    phosphorus: float = Field(..., ge=0.0, description="Soil Phosphorus (P) content in kg/ha (>= 0)")
    potassium: float = Field(..., ge=0.0, description="Soil Potassium (K) content in kg/ha (>= 0)")
    pest_probability: float = Field(..., ge=0.0, le=1.0, description="Pest occurrence probability (0.0 - 1.0)")
    market_price: float = Field(..., ge=0.0, description="Current market price per quintal (>= 0)")
    production_yield: float = Field(..., ge=0.0, description="Estimated production yield in tonnes/ha (>= 0)")


class RiskFactors(BaseModel):
    """
    Individual risk component scores (0 - 100).
    """
    weather: int
    soil: int
    pest: int
    disease: int
    market: int
    production: int


class RiskContributor(BaseModel):
    """
    Identifies top contributing risk factor and its relative weight/contribution.
    """
    factor: str
    contribution: int


class RiskPredictionResponse(BaseModel):
    """
    Complete risk prediction assessment response with model version and explainability details.
    """
    prediction_id: str
    region: str
    crop: str
    season: Optional[str] = None
    risk_score: int
    risk_level: str
    risk_factors: RiskFactors
    top_contributors: List[RiskContributor]
    top_contributing_factors: List[RiskContributor] = Field(default_factory=list)
    recommendations: List[str]
    prediction_type: str = "ML"
    model_status: str = "PRODUCTION_MODEL"
    model_version: str = "1.0.0"
    data_status: str = "REAL_OBSERVATIONS"
    data_completeness: Optional[str] = "HIGH"
    weather_data_year: Optional[int] = 2025
    market_data_year: Optional[int] = 2025
    pest_data_year: Optional[int] = 2025
    soil_data_year: Optional[int] = 2025
    latest_harvest_outcome_year: Optional[int] = 2025
    latest_final_harvest_outcome_year: Optional[int] = 2023
    harvest_data_status: Optional[str] = "PROVISIONAL_ADVANCE"
    harvest_status_by_year: Optional[dict] = None
    confidence: Optional[float] = None
    confidence_status: Optional[str] = "NOT_AVAILABLE"
    data_sources: List[str] = Field(default_factory=list)
    prediction_timestamp: Optional[str] = None
    created_at: str


class RiskHistoryItem(BaseModel):
    """
    Summarized risk prediction item for user history.
    """
    prediction_id: str
    crop: str
    region: str
    risk_score: int
    risk_level: str
    created_at: str
