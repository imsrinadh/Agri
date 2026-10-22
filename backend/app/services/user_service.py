from typing import Dict, Any, Optional
from fastapi import HTTPException, status
from app.services.auth_service import auth_service


class UserService:
    """
    Service layer handling user profile retrieval and updates.
    Encapsulated to allow seamless transition to PostgreSQL / SQLAlchemy in later phases.
    """

    def get_current_user_data(self, user_id: int) -> Dict[str, Any]:
        """Retrieve user record by ID."""
        user = auth_service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return user

    def update_user(
        self,
        user_id: int,
        name: Optional[str] = None,
        email: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Update basic identity (name, email).
        Validates email uniqueness across users if email is changed.
        """
        user = self.get_current_user_data(user_id)

        if email is not None:
            normalized_email = email.strip().lower()
            if normalized_email != user["email"].lower():
                # Check if new email is taken by someone else
                existing = auth_service.get_user_by_email(normalized_email)
                if existing and existing["id"] != user_id:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="An account with this email address already exists.",
                    )
                # Remove old email from index and insert new one
                old_email = user["email"].lower()
                if old_email in auth_service._email_index:
                    del auth_service._email_index[old_email]
                auth_service._email_index[normalized_email] = user_id
                user["email"] = normalized_email

        if name is not None:
            user["name"] = name.strip()

        return user

    def get_profile(self, user_id: int) -> Dict[str, Any]:
        """
        Retrieve agricultural profile information for a user.
        """
        user = self.get_current_user_data(user_id)
        return {
            "user_id": user["id"],
            "region": user.get("region"),
            "preferred_crop": user.get("preferred_crop"),
            "season": user.get("season"),
            "phone": user.get("phone"),
            "profile_image_url": user.get("profile_image_url"),
        }

    def update_profile(
        self,
        user_id: int,
        region: Optional[str] = None,
        preferred_crop: Optional[str] = None,
        season: Optional[str] = None,
        phone: Optional[str] = None,
        profile_image_url: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Update agricultural preferences for a user.
        """
        user = self.get_current_user_data(user_id)

        if region is not None:
            user["region"] = region.strip()
        if preferred_crop is not None:
            user["preferred_crop"] = preferred_crop.strip()
        if season is not None:
            user["season"] = season.strip()
        if phone is not None:
            user["phone"] = phone.strip()
        if profile_image_url is not None:
            user["profile_image_url"] = profile_image_url.strip()

        return {
            "user_id": user["id"],
            "region": user.get("region"),
            "preferred_crop": user.get("preferred_crop"),
            "season": user.get("season"),
            "phone": user.get("phone"),
            "profile_image_url": user.get("profile_image_url"),
        }


# Singleton instance
user_service = UserService()
