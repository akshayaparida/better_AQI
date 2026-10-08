import os
import logging
from typing import Optional


class Settings:
    APP_NAME: str = os.getenv("APP_NAME", "better_AQI API")
    APP_VERSION: str = os.getenv("APP_VERSION", "1.0.0")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # External Data Sources
    OPEN_METEO_AIR_URL: str = "https://air-quality-api.open-meteo.com/v1/air-quality"
    OPEN_METEO_WEATHER_URL: str = "https://api.open-meteo.com/v1/forecast"
    
    # Default Geographical Focus (Delhi NCR)
    DEFAULT_LATITUDE: float = float(os.getenv("DEFAULT_LATITUDE", "28.6139"))
    DEFAULT_LONGITUDE: float = float(os.getenv("DEFAULT_LONGITUDE", "77.2090"))
    
    # Resiliency & Timeout
    REQUEST_TIMEOUT_SECONDS: float = float(os.getenv("REQUEST_TIMEOUT_SECONDS", "5.0"))


settings = Settings()

# Structured Logger setup for local & AWS CloudWatch
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("better_aqi")
