from datetime import datetime, timezone
from typing import Dict, Optional, Any, List
from fastapi import HTTPException, status
from app.core.security import hash_password, verify_password


class AuthService:
    """
    Service layer handling user lifecycle, hashing, and authentication.
    Designed with a clean interface that can later be replaced by PostgreSQL/SQLAlchemy.
    """

    def __init__(self):
        # In-memory user database store for development phase
        self._users: Dict[int, Dict[str, Any]] = {}
        self._email_index: Dict[str, int] = {}
        self._current_id = 0

        # Seed initial demo farmer account with a real bcrypt hashed password
        self._seed_default_user()

    def _seed_default_user(self):
        """Seed default demo user for frictionless development testing."""
        demo_email = "farmer@agririsk.in"
        demo_pass = "password123"
        hashed = hash_password(demo_pass)
        self._current_id += 1
        user_id = self._current_id
        user_record = {
            "id": user_id,
            "name": "Farmer Demo",
            "email": demo_email,
            "hashed_password": hashed,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        self._users[user_id] = user_record
        self._email_index[demo_email.lower()] = user_id

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Look up a user record by email address (case-insensitive)."""
        normalized_email = email.strip().lower()
        user_id = self._email_index.get(normalized_email)
        if user_id:
            return self._users.get(user_id)
        return None

    def get_user_by_id(self, user_id: int) -> Optional[Dict[str, Any]]:
        """Look up a user record by ID."""
        return self._users.get(user_id)

    def create_user(self, name: str, email: str, password: str) -> Dict[str, Any]:
        """
        Create and persist a new user with hashed password.
        Raises 409 Conflict if email is already registered.
        """
        normalized_email = email.strip().lower()
        if normalized_email in self._email_index:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email address already exists.",
            )

        hashed = hash_password(password)
        self._current_id += 1
        user_id = self._current_id

        user_record = {
            "id": user_id,
            "name": name.strip(),
            "email": normalized_email,
            "hashed_password": hashed,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

        self._users[user_id] = user_record
        self._email_index[normalized_email] = user_id
        return user_record

    def authenticate_user(self, email: str, password: str) -> Optional[Dict[str, Any]]:
        """
        Validate email and password without exposing which was incorrect.
        Returns user dictionary if authenticated, None otherwise.
        """
        user = self.get_user_by_email(email)
        if not user:
            return None
        if not verify_password(password, user["hashed_password"]):
            return None
        return user


# Singleton instance
auth_service = AuthService()
