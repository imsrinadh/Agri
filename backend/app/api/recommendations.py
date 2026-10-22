from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, Query, status
from app.core.security import get_optional_current_user
from app.schemas.recommendation import (
    RecommendationResponse,
    RecommendationListResponse,
    RecommendationRequest,
    RecommendationTelemetry,
    AskAgronomistRequest,
    AskAgronomistResponse,
)
from app.services.recommendation_service import recommendation_service

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.get(
    "",
    response_model=List[RecommendationResponse],
    status_code=status.HTTP_200_OK,
    summary="Get User Recommendations",
    description="Retrieve agronomic mitigation actions with optional category, priority, crop, district, and state filters.",
)
async def get_recommendations(
    category: Optional[str] = Query(None, description="Filter by Category (e.g. 'Pest Management')"),
    priority: Optional[str] = Query(None, description="Filter by Priority ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')"),
    risk_type: Optional[str] = Query(None, description="Filter by Risk Type"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by Status ('ACTIVE', 'COMPLETED', 'DISMISSED')"),
    crop: Optional[str] = Query("Wheat", description="Target agricultural crop (e.g., 'Wheat', 'Rice', 'Cotton')"),
    district: Optional[str] = Query("Ludhiana", description="District for localized agro-climatic telemetry"),
    state: Optional[str] = Query("Punjab", description="State for regional package of practices"),
    season: Optional[str] = Query("Rabi", description="Agricultural season ('Kharif', 'Rabi', 'Zaid')"),
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
) -> List[Dict[str, Any]]:
    user_id = current_user["id"] if current_user else 1
    return recommendation_service.get_recommendations(
        user_id=user_id,
        category=category,
        priority=priority,
        risk_type=risk_type,
        status_filter=status_filter,
        crop=crop,
        district=district,
        state=state,
        season=season,
    )


@router.post(
    "/generate",
    response_model=RecommendationListResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate Dynamic Recommendations",
    description="Generate tailored agronomic recommendations grounded in live Open-Meteo weather and Soil Health Card telemetry.",
)
async def generate_recommendations(
    payload: Optional[RecommendationRequest] = None,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
) -> Dict[str, Any]:
    crop = payload.crop if payload and payload.crop else "Wheat"
    district = payload.district if payload and payload.district else "Ludhiana"
    state = payload.state if payload and payload.state else "Punjab"
    season = payload.season if payload and payload.season else "Rabi"
    user_id = current_user["id"] if current_user else 1

    return recommendation_service.get_recommendations_with_telemetry(
        user_id=user_id,
        crop=crop,
        district=district,
        state=state,
        season=season,
    )


@router.get(
    "/telemetry",
    response_model=RecommendationTelemetry,
    status_code=status.HTTP_200_OK,
    summary="Get Field Agro-Telemetry",
    description="Retrieve live weather, soil health, mandi modal rate, and ICAR pest surveillance for a crop and region.",
)
async def get_telemetry(
    crop: Optional[str] = Query("Wheat", description="Agricultural crop"),
    district: Optional[str] = Query("Ludhiana", description="District name"),
    state: Optional[str] = Query("Punjab", description="State name"),
    season: Optional[str] = Query("Rabi", description="Cropping season"),
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
) -> Dict[str, Any]:
    return recommendation_service.get_field_telemetry(
        district=district or "Ludhiana",
        state=state or "Punjab",
        crop=crop or "Wheat",
        season=season or "Rabi",
    )


@router.post(
    "/ask",
    response_model=AskAgronomistResponse,
    status_code=status.HTTP_200_OK,
    summary="Ask AI Agronomist",
    description="Consult Google Gemini AI agronomist with empirical telemetry and ICAR scientific protocols.",
)
async def ask_agronomist(
    payload: AskAgronomistRequest,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
) -> Dict[str, Any]:
    return recommendation_service.ask_ai_agronomist(
        question=payload.question,
        crop=payload.crop or "Rice",
        district=payload.district or "Nellore",
        state=payload.state or "Andhra Pradesh",
        season=payload.season or "Kharif",
    )


@router.get(
    "/{recommendation_id}",
    response_model=RecommendationResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Recommendation Detail",
    description="Retrieve full details for a specific recommendation by ID.",
)
async def get_recommendation_detail(
    recommendation_id: str,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
) -> Dict[str, Any]:
    user_id = current_user["id"] if current_user else 1
    return recommendation_service.get_recommendation(
        user_id=user_id,
        recommendation_id=recommendation_id,
    )

