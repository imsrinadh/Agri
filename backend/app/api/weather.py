"""
AgriRisk Weather Intelligence API Router (GET /api/weather).
Provides official verified agro-meteorological conditions, 15-day forecast,
temperature/rainfall trends, extended outlooks, and active alerts.
"""
from typing import Optional
from fastapi import APIRouter, Query, status
from app.services.weather_service import weather_service

router = APIRouter(prefix="/weather", tags=["Weather Intelligence"])


@router.get(
    "",
    summary="Get Verified Agro-Meteorological Forecast & Conditions",
    status_code=status.HTTP_200_OK,
)
def get_weather_intelligence(
    district: Optional[str] = Query(None, description="District name for location resolution"),
    state: Optional[str] = Query(None, description="State name for location resolution"),
):
    """
    Returns verified official weather conditions, 15-day forecast, trend series, and provenance.
    """
    return weather_service.fetch_weather(district=district, state=state)
