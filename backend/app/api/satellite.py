"""
AgriRisk Satellite Earth Observation API Router (GET /api/satellite).
Provides calibrated NDVI vegetation health, volumetric soil moisture radar data,
multi-date trend series, satellite pass timeline, and official provenance.
"""
from typing import Optional
from fastapi import APIRouter, Query, status
from app.services.satellite_service import satellite_service

router = APIRouter(prefix="/satellite", tags=["Satellite Observation"])


@router.get(
    "",
    summary="Get Calibrated Earth-Observation Satellite Data",
    status_code=status.HTTP_200_OK,
)
def get_satellite_observation(
    district: Optional[str] = Query(None, description="District name for location resolution"),
    state: Optional[str] = Query(None, description="State name for location resolution"),
):
    """
    Returns calibrated NDVI, soil moisture, observation timelines, and satellite metadata.
    """
    return satellite_service.get_satellite_data(district=district, state=state)
