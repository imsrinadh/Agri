from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, Query, status
from app.core.security import get_optional_current_user
from app.schemas.insights import InsightsResponse
from app.services.insights_service import insights_service

router = APIRouter(prefix="/insights", tags=["Insights & Analytics"])


@router.get(
    "",
    response_model=InsightsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Agricultural Insights & Trends",
    description="Retrieve multi-year risk trajectories, crop comparisons, mandi market prices, and harvest production analytics.",
)
async def get_insights(
    time_period: str = Query("30d", description="Time window ('7d', '30d', '90d', '1y')"),
    region: Optional[str] = Query(None, description="Filter by agricultural region"),
    crop: Optional[str] = Query(None, description="Filter by crop name"),
    season: Optional[str] = Query(None, description="Filter by cropping season"),
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
) -> Dict[str, Any]:
    return insights_service.get_insights(
        time_period=time_period,
        region=region,
        crop=crop,
        season=season,
    )
