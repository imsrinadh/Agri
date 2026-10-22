from fastapi import APIRouter
from typing import Dict

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    summary="Health check endpoint",
    description="Verify backend server operational status.",
    response_model=Dict[str, str],
)
async def health_check() -> Dict[str, str]:
    return {
        "status": "healthy",
        "service": "AgriRisk Backend",
    }
