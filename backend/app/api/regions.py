from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, status
from app.core.security import get_current_user, get_optional_current_user
from app.schemas.region import (
    RegionResponse,
    RegionRiskResponse,
    RegionalRiskSummary,
)
from app.services.region_service import region_service

router = APIRouter(prefix="/regions", tags=["Regional Risk"])


@router.get(
    "",
    response_model=List[RegionResponse],
    status_code=status.HTTP_200_OK,
    summary="Get All Regions",
    description="Retrieve list of agricultural regions with live risk indices. Supports filtering by state, crop, and risk level.",
)
async def get_regions(
    state: Optional[str] = Query(default=None, description="Filter by Indian State (e.g. 'Andhra Pradesh')"),
    crop: Optional[str] = Query(default=None, description="Filter by Major Crop (e.g. 'Rice')"),
    risk_level: Optional[str] = Query(default=None, description="Filter by Risk Level ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')"),
    fresh: bool = Query(default=False, description="Force real-time live telemetry refresh from Open-Meteo & IMD"),
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
) -> List[Dict[str, Any]]:
    s_val = state if isinstance(state, str) else None
    c_val = crop if isinstance(crop, str) else None
    r_val = risk_level if isinstance(risk_level, str) else None
    f_val = fresh if isinstance(fresh, bool) else False
    return region_service.get_all_regions(state=s_val, crop=c_val, risk_level=r_val, force_refresh=f_val)


@router.get(
    "/risk/summary",
    response_model=RegionalRiskSummary,
    status_code=status.HTTP_200_OK,
    summary="Get Regional Risk Summary",
    description="Retrieve aggregated live statistics across all monitored geographical regions.",
)
async def get_regional_risk_summary(
    fresh: bool = Query(default=False, description="Force real-time live telemetry refresh"),
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
) -> Dict[str, Any]:
    f_val = fresh if isinstance(fresh, bool) else False
    return region_service.get_risk_summary(force_refresh=f_val)


@router.get(
    "/{region_id}",
    response_model=RegionResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Region Details",
    description="Retrieve geographical, agricultural, and live risk profile for a specific region ID or state name.",
)
async def get_region_detail(
    region_id: str,
    fresh: bool = Query(default=False, description="Force real-time live telemetry refresh"),
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
) -> Dict[str, Any]:
    f_val = fresh if isinstance(fresh, bool) else False
    return region_service.get_region_by_id(region_id, force_refresh=f_val)


@router.get(
    "/{region_id}/risk",
    response_model=RegionRiskResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Detailed Regional Risk",
    description="Retrieve live multi-factor risk components, top contributing stressors, and agronomic recommendations.",
)
async def get_region_risk(
    region_id: str,
    fresh: bool = Query(default=False, description="Force real-time live telemetry refresh"),
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
) -> Dict[str, Any]:
    f_val = fresh if isinstance(fresh, bool) else False
    return region_service.get_region_risk(region_id, force_refresh=f_val)
