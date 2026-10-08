from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from services.aqi_service import fetch_live_aqi

app = FastAPI(title="better_AQI API", version="1.0.0")

# Allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"service": "better_AQI API", "status": "online"}


# Cloud health check
@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "better_AQI"}


# Live AQI telemetry endpoint
@app.get("/api/aqi/live")
async def get_live_aqi(
    lat: float = Query(28.6139, description="Latitude"),
    lon: float = Query(77.2090, description="Longitude"),
):
    return await fetch_live_aqi(latitude=lat, longitude=lon)


# AWS Lambda adapter
handler = Mangum(app)
