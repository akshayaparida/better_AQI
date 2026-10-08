from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from services.aqi_service import fetch_live_aqi
from services.advisory_service import get_school_advisory
from services.route_service import RouteComparisonRequest, compare_routes_exposure

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


# School & Student Safety Advisory endpoint
@app.get("/api/advisory/school")
async def get_school_safety_advisory(
    lat: float = Query(28.6139, description="Latitude"),
    lon: float = Query(77.2090, description="Longitude"),
    school_name: str = Query("Delhi Public School", description="School or campus name"),
):
    return await get_school_advisory(latitude=lat, longitude=lon, school_name=school_name)


# Cleanest Commute Route Inhalation Comparison endpoint
@app.post("/api/exposure/route")
async def compare_route_exposure(payload: RouteComparisonRequest):
    return compare_routes_exposure(payload.routes)


# AWS Lambda adapter
handler = Mangum(app)
