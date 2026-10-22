from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


from pathlib import Path
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = BACKEND_DIR / ".env"

class Settings(BaseSettings):
    """
    Application Settings loaded from environment variables and .env file.
    """
    APP_NAME: str = "AgriRisk API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    FRONTEND_URL: str = "http://localhost:5173"
    JWT_SECRET_KEY: str = "agririsk-secure-development-jwt-secret-key-32bytes-v1"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    UPLOAD_DIR: str = str(BACKEND_DIR / "uploads")
    DATABASE_URL: str = ""
    GEMINI_API_KEY: str = ""

    ALLOWED_ORIGINS: str = ""

    # Specific origins allowed for CORS
    @property
    def cors_origins(self) -> List[str]:
        origins = [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5174",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]
        if self.FRONTEND_URL and self.FRONTEND_URL not in origins:
            origins.append(self.FRONTEND_URL)
        if self.ALLOWED_ORIGINS:
            for o in self.ALLOWED_ORIGINS.split(","):
                o = o.strip()
                if o and o not in origins:
                    origins.append(o)
        return origins

    model_config = SettingsConfigDict(
        env_file=[str(ENV_PATH), ".env"],
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
