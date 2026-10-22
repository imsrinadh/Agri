from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    """
    Schema for user registration input.
    """
    name: str = Field(..., min_length=2, max_length=100, description="Full name of user")
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(..., min_length=6, max_length=128, description="Secure password")


class UserLogin(BaseModel):
    """
    Schema for user login credentials.
    """
    email: EmailStr = Field(..., description="Registered email address")
    password: str = Field(..., min_length=1, description="Account password")


class UserResponse(BaseModel):
    """
    Public user representation without sensitive fields.
    """
    id: int
    name: str
    email: str
    is_active: bool = True
    created_at: Optional[str] = None


class TokenResponse(BaseModel):
    """
    JWT Token response containing access token and user info.
    """
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class MessageResponse(BaseModel):
    """
    Standard informational message response.
    """
    message: str
