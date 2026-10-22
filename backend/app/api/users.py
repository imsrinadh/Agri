from typing import Dict, Any
from fastapi import APIRouter, Depends, status
from app.core.security import get_current_user
from app.schemas.user import (
    UserResponse,
    UserUpdate,
    UserProfileResponse,
    UserProfileUpdate,
)
from app.services.user_service import user_service

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user details",
    description="Retrieve account identity and profile information for the authenticated user.",
)
async def get_my_details(
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    return user_service.get_current_user_data(current_user["id"])


@router.put(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Update current user details",
    description="Update user name and email. Validates email uniqueness across accounts.",
)
async def update_my_details(
    payload: UserUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    return user_service.update_user(
        user_id=current_user["id"],
        name=payload.name,
        email=payload.email,
    )


@router.get(
    "/me/profile",
    response_model=UserProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Get agricultural profile",
    description="Retrieve agricultural preferences (region, crop, season, contact) for the user.",
)
async def get_my_profile(
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    return user_service.get_profile(current_user["id"])


@router.put(
    "/me/profile",
    response_model=UserProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Update agricultural profile",
    description="Update agricultural details including region, preferred crop, season, and phone.",
)
async def update_my_profile(
    payload: UserProfileUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    return user_service.update_profile(
        user_id=current_user["id"],
        region=payload.region,
        preferred_crop=payload.preferred_crop,
        season=payload.season,
        phone=payload.phone,
        profile_image_url=payload.profile_image_url,
    )
