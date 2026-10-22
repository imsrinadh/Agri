from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class RegionTelemetry(BaseModel):
    """
    Live real-time meteorological & agro-climatic telemetry observations.
    """
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    precipitation_mm: Optional[float] = None
    wind_speed_kmh: Optional[float] = None
    weather_condition: Optional[str] = "Clear Sky"
    weather_icon: Optional[str] = "sun"
    soil_moisture: Optional[float] = None
    soil_temperature: Optional[float] = None
    surface_pressure: Optional[float] = None
    ndvi: Optional[float] = None


class RegionalRiskFactor(BaseModel):
    """
    Component risk factors for a specific geographical region.
    """
    weather: int
    soil: int
    pest: int
    disease: int
    market: int
    production: int


class RegionalContributor(BaseModel):
    """
    Top contributor to regional risk.
    """
    factor: str
    contribution: int


class RegionResponse(BaseModel):
    """
    Geographical region details and high-level risk index with live telemetry.
    """
    region_id: str
    region_name: str
    state: str
    country: str = "India"
    latitude: float
    longitude: float
    major_crops: List[str]
    current_risk_score: int
    current_risk_level: str
    data_status: str = "LIVE"
    source: str = "Live IMD / Open-Meteo Agro-Grid Stream"
    telemetry: Optional[RegionTelemetry] = None
    risk_factors: Optional[RegionalRiskFactor] = None
    top_contributors: Optional[List[RegionalContributor]] = None
    factors: Optional[List[str]] = None
    recommendations: Optional[List[str]] = None
    crop_advisories: Optional[Dict[str, Any]] = None
    districts: Optional[List[Dict[str, Any]]] = None
    forecast_7d: Optional[List[Dict[str, Any]]] = None
    last_updated: Optional[str] = None


class RegionRiskResponse(BaseModel):
    """
    Detailed risk breakdown and agronomic recommendations for a specific region.
    """
    region_id: str
    region_name: str
    state: Optional[str] = None
    risk_score: int
    risk_level: str
    risk_factors: RegionalRiskFactor
    top_contributors: List[RegionalContributor]
    recommendations: List[str]
    crop_advisories: Optional[Dict[str, Any]] = None
    telemetry: Optional[RegionTelemetry] = None
    forecast_7d: Optional[List[Dict[str, Any]]] = None
    data_status: str = "LIVE"
    source: str = "Live IMD / Open-Meteo Agro-Grid Stream"
    last_updated: str


class RegionalRiskSummary(BaseModel):
    """
    Platform-wide geographical risk aggregation summary with live status.
    """
    total_regions: int
    low_risk: int
    moderate_risk: int
    high_risk: int
    critical_risk: int
    highest_risk_region: str
    lowest_risk_region: str
    average_risk_score: float
    data_status: str = "LIVE"
    source: str = "Live IMD / Open-Meteo Regional Models"
    coverage: str = "Monitored Indian agricultural states & primary cropping districts"
    last_updated: str
