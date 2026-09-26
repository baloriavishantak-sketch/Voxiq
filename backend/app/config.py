"""VOXIQ System Configuration.

Centralizes environment variables, analytical constants, and privacy settings.
"""

from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Project Information
    PROJECT_NAME: str = "VOXIQ"
    PROJECT_FULL_NAME: str = "Real-Time Multimodal Communication Intelligence Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./voxiq.db"
    DATABASE_ECHO: bool = False

    # Storage & Privacy
    DATA_DIR: Path = Path("./data")
    AUDIO_UPLOAD_DIR: Path = Path("./data/audio")
    TEMP_DIR: Path = Path("./data/temp")
    AUDIO_RETENTION_MINUTES: int = 60  # Auto-purge raw audio window
    STORE_RAW_AUDIO: bool = True  # Can be disabled for zero-retention mode

    # Analytical Thresholds (Layer 1 Deterministic)
    CALCULATION_VERSION: str = "1.0.0"
    DEFAULT_PAUSE_THRESHOLD_SEC: float = 0.5
    LONG_PAUSE_THRESHOLD_SEC: float = 1.2
    TEMPORAL_WINDOW_SEC: float = 10.0
    TEMPORAL_WINDOW_STEP_SEC: float = 10.0

    # Configurable Filler Dictionary
    FILLER_WORDS: List[str] = [
        "um", "uh", "er", "ah", "like", "you know", "sort of", 
        "kind of", "actually", "basically", "so yeah", "i mean", 
        "right", "you see", "honestly"
    ]

    # Layer 2 NLP / ML Configuration
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"
    COHERENCE_WINDOW_SIZE: int = 2
    TOPIC_DRIFT_THRESHOLD: float = 0.45

    # Layer 3 LLM Reasoning Provider
    LLM_PROVIDER: str = "none"  # "gemini", "openai", or "none"
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    LLM_MODEL: str = "gemini-1.5-flash"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]


settings = Settings()

# Ensure required local directories exist
settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
settings.AUDIO_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
settings.TEMP_DIR.mkdir(parents=True, exist_ok=True)
