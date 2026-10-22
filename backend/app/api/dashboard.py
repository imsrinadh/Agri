from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, status
from app.core.security import get_optional_current_user
from app.schemas.dashboard import DashboardResponse
from app.services.dashboard_service import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get(
    "",
    response_model=DashboardResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Consolidated Dashboard",
    description="Retrieve unified agricultural risk overview, trends, regional metrics, user history, and recommendations.",
)
async def get_dashboard(
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
) -> Dict[str, Any]:
    user_id = current_user["id"] if current_user else 1
    return dashboard_service.get_dashboard_data(user_id)
