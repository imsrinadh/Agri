from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserResponse(BaseModel):
    """
    Public user representation without sensitive fields.
    """
    id: int
    name: str
    email: EmailStr
    is_active: bool = True
    region: Optional[str] = None
    preferred_crop: Optional[str] = None
    season: Optional[str] = None
    phone: Optional[str] = None
    profile_image_url: Optional[str] = None
    created_at: Optional[str] = None


class UserUpdate(BaseModel):
    """
    Schema for updating basic user identity information.
    """
    name: Optional[str] = Field(None, min_length=2, max_length=100, description="Full name of user")
    email: Optional[EmailStr] = Field(None, description="Updated valid email address")


class UserProfileResponse(BaseModel):
    """
    Agricultural profile details for the user.
    """
    user_id: int
    region: Optional[str] = None
    preferred_crop: Optional[str] = None
    season: Optional[str] = None
    phone: Optional[str] = None
    profile_image_url: Optional[str] = None


class UserProfileUpdate(BaseModel):
    """
    Schema for updating agricultural preferences and contact info.
    """
    region: Optional[str] = Field(None, max_length=100, description="Primary farming district/region")
    preferred_crop: Optional[str] = Field(None, max_length=100, description="Main crop cultivated")
    season: Optional[str] = Field(None, max_length=50, description="Current farming season (e.g., Kharif, Rabi)")
    phone: Optional[str] = Field(None, max_length=20, description="Contact phone number")
    profile_image_url: Optional[str] = Field(None, description="Profile avatar URL")
