"""VOXIQ FastAPI Application.

Entry point for backend services, middleware, lifespan events, and API routers.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.database import init_db
from backend.app.api.v1.router import api_router
from backend.app.api.websocket import router as ws_router
from backend.app.utils.logger import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager for startup and shutdown."""
    logger.info("Initializing VOXIQ database tables...")
    await init_db()
    logger.info("VOXIQ backend started successfully.")
    yield
    logger.info("VOXIQ backend shutting down.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_FULL_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include v1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", status_code=status.HTTP_200_OK, tags=["System"])
async def health_check():
    """Health check endpoint providing service status and version."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "full_name": settings.PROJECT_FULL_NAME,
        "version": settings.VERSION,
        "calculation_version": settings.CALCULATION_VERSION
    }

app.include_router(ws_router)
