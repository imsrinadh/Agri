from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.api.health import router as health_router
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.risk import router as risk_router
from app.api.disease import router as disease_router
from app.api.regions import router as regions_router
from app.api.dashboard import router as dashboard_router
from app.api.insights import router as insights_router
from app.api.recommendations import router as recommendations_router
from app.api.predict import router as predict_router
from app.api.decision_support import router as decision_support_router
from app.api.weather import router as weather_router
from app.api.satellite import router as satellite_router

from fastapi.middleware.gzip import GZipMiddleware
import time
from starlette.requests import Request

# Initialize FastAPI Application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Agricultural Risk Intelligence Platform API",
    docs_url="/docs",
    redoc_url="/redoc",
)

# High-Performance GZip Compression (compresses responses > 500 bytes by up to 80%)
app.add_middleware(GZipMiddleware, minimum_size=500)

# Configure CORS Middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"^https://.*\.onrender\.com$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.perf_counter()
    response = await call_next(request)
    process_time = (time.perf_counter() - start_time) * 1000
    response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}"
    return response

# Ensure uploads directory exists and mount static serving for image previews
uploads_path = Path(settings.UPLOAD_DIR)
uploads_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


@app.get(
    "/",
    summary="Root Welcome Endpoint",
    description="Returns API service identity and operational health status.",
    tags=["General"],
)
async def root():
    return {
        "message": "Welcome to AgriRisk API",
        "status": "running",
        "version": settings.APP_VERSION,
    }


@app.on_event("startup")
async def startup_warmup():
    """
    Asynchronously pre-warm core services in threadpool to guarantee instant (< 2ms) responses
    on initial frontend page load.
    """
    import asyncio
    from app.services.region_service import region_service
    from app.services.insights_service import insights_service

    loop = asyncio.get_event_loop()
    loop.run_in_executor(None, region_service.get_all_regions)
    loop.run_in_executor(None, insights_service.get_insights, "30d")


# Mount API routers
app.include_router(health_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(risk_router, prefix="/api")
app.include_router(disease_router, prefix="/api")
app.include_router(regions_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(insights_router, prefix="/api")
app.include_router(recommendations_router, prefix="/api")
app.include_router(weather_router, prefix="/api")
app.include_router(satellite_router, prefix="/api")
app.include_router(predict_router)
app.include_router(decision_support_router)
