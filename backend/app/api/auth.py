from typing import Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    UserResponse,
    TokenResponse,
    MessageResponse,
)
from app.services.auth_service import auth_service
from app.core.security import create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Validate credentials, hash password, and register a new user account.",
)
async def register(payload: UserRegister) -> Dict[str, Any]:
    user = auth_service.create_user(
        name=payload.name,
        email=payload.email,
        password=payload.password,
    )
    return user


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate user and return JWT",
    description="Verify email & password, and generate a signed JWT access token.",
)
async def login(payload: UserLogin) -> Dict[str, Any]:
    user = auth_service.authenticate_user(
        email=payload.email,
        password=payload.password,
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Issue JWT containing user ID and email
    token_data = {
        "user_id": user["id"],
        "email": user["email"],
        "name": user["name"],
    }
    access_token = create_access_token(data=token_data)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current authenticated user",
    description="Retrieve profile details for the Bearer token holder.",
)
async def get_me(
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    return current_user


@router.post(
    "/logout",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Logout user session",
    description="Stateless logout response acknowledging client-side token disposal.",
)
async def logout() -> Dict[str, str]:
    return {
        "message": "Logout successful",
    }
