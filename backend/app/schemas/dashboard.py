from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class DashboardUser(BaseModel):
    """
    User context and agricultural profile summary for dashboard header.
    """
    name: str
    region: Optional[str] = "Nellore"
    preferred_crop: Optional[str] = "Rice"


class DashboardRiskOverview(BaseModel):
    """
    Overall agricultural risk metrics and 6 categorical risk components.
    """
    overall_score: int
    overall_level: str
    weather: int
    soil: int
    pest: int
    disease: int
    market: int
    production: int


class DashboardTrend(BaseModel):
    """
    Historical trajectory point for risk trend visualizer.
    """
    date: str
    score: int
    month: Optional[str] = None


class DashboardRegionSummary(BaseModel):
    """
    Distribution of risk levels across all geographical regions.
    """
    low: int
    moderate: int
    high: int
    critical: int


class DashboardRecentPrediction(BaseModel):
    """
    Recent risk prediction summary record.
    """
    prediction_id: str
    crop: str
    region: str
    risk_score: int
    risk_level: str
    created_at: str


class DashboardRecentDisease(BaseModel):
    """
    Recent crop disease diagnostic scan summary record.
    """
    prediction_id: str
    crop: Optional[str] = None
    disease: Optional[str] = None
    confidence: float
    severity: Optional[str] = None
    image_url: Optional[str] = None
    created_at: str


class DashboardRecommendation(BaseModel):
    """
    Actionable agricultural recommendation for the dashboard.
    """
    title: str
    reason: str
    priority: str = "HIGH"
    category: Optional[str] = None


class DashboardResponse(BaseModel):
    """
    Complete consolidated dashboard payload for single-roundtrip frontend initialization.
    """
    user: DashboardUser
    risk_overview: DashboardRiskOverview
    risk_trend: List[DashboardTrend]
    regional_summary: DashboardRegionSummary
    recent_risk_predictions: List[DashboardRecentPrediction]
    recent_disease_analyses: List[DashboardRecentDisease]
    recommendations: List[DashboardRecommendation]
    data_status: str = "DEMO"
    model_status: str = "RULE_BASED"
