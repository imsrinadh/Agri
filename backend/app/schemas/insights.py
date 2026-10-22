from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class RiskTrendPoint(BaseModel):
    """
    Trajectory risk score point across environmental and market factors.
    """
    date: str
    score: int
    weather: Optional[int] = None
    soil: Optional[int] = None
    pest: Optional[int] = None
    disease: Optional[int] = None
    market: Optional[int] = None
    production: Optional[int] = None


class CropComparison(BaseModel):
    """
    Multi-factor risk comparison by agricultural crop.
    """
    crop: str
    risk_score: int
    weather: Optional[int] = None
    soil: Optional[int] = None
    pest: Optional[int] = None
    disease: Optional[int] = None
    market: Optional[int] = None


class RegionalTrend(BaseModel):
    """
    Geographical risk level index for district/state comparison.
    """
    region: str
    risk_score: int
    level: Optional[str] = "HIGH"


class MarketTrend(BaseModel):
    """
    Development mandi commodity price trend index (₹/quintal).
    """
    date: str
    price: Optional[float] = None
    rice: Optional[float] = None
    wheat: Optional[float] = None
    cotton: Optional[float] = None
    maize: Optional[float] = None
    soybean: Optional[float] = None
    groundnut: Optional[float] = None
    mustard: Optional[float] = None
    onion: Optional[float] = None


class ProductionTrend(BaseModel):
    """
    Development crop harvest yield trajectory trends.
    """
    model_config = ConfigDict(populate_by_name=True)

    date: str
    yield_val: Optional[float] = Field(None, alias="yield")
    unit: str = "tons per hectare"
    rice: Optional[float] = None
    wheat: Optional[float] = None
    maize: Optional[float] = None
    cotton: Optional[float] = None
    soybean: Optional[float] = None
    groundnut: Optional[float] = None
    mustard: Optional[float] = None
    onion: Optional[float] = None


class MacroStats(BaseModel):
    total_verified_records: int = 392
    districts_covered: int = 22
    states_covered: int = 12
    historical_years: str = "2012–2025"
    national_baseline_yield: float = 3.38


class TabInsight(BaseModel):
    title: str
    takeaway: str
    agronomic_context: str
    indicator_explained: str


class RawRecordItem(BaseModel):
    year: int
    state: str
    district: str
    crop: str
    season: str
    yield_tonnes_ha: float
    rainfall_mm: float
    temperature_c: float
    modal_price_rs_q: float
    risk_level: str


class InsightsResponse(BaseModel):
    """
    Consolidated analytics, comparative trends, and price trajectory response with verified empirical data.
    """
    time_period: str
    region: Optional[str] = None
    crop: Optional[str] = None
    season: Optional[str] = None
    data_status: str = "VERIFIED"
    source: str = "DES APY, NASA POWER, Agmarknet & Soil Health Card"
    last_updated: str = "2026-08-26T00:00:00Z"
    macro_stats: Optional[MacroStats] = None
    tab_insights: Optional[Dict[str, TabInsight]] = None
    risk_trend: List[RiskTrendPoint]
    crop_comparison: List[CropComparison]
    regional_trends: List[RegionalTrend]
    market_trends: List[MarketTrend]
    production_trends: List[ProductionTrend]
    raw_records: Optional[List[RawRecordItem]] = None
    mandi_msp_benchmarks: Optional[List[Dict[str, Any]]] = None

