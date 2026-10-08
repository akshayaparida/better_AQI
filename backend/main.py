from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from services.aqi_service import fetch_live_aqi
from services.advisory_service import get_school_advisory
from services.route_service import (
    RouteComparisonRequest,
    compare_routes_exposure,
    plan_smart_commute,
)
from services.alert_service import (
    AlertSubscription,
    register_subscriber,
    check_and_dispatch_alerts,
    list_subscribers,
)
from services.stubble_service import get_stubble_burning_status
from services.indoor_service import IndoorAirRequest, evaluate_indoor_air

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


# 1. AQI - Live telemetry endpoint
@app.get("/api/aqi/live")
async def get_live_aqi(
    lat: float = Query(28.6139, description="Latitude"),
    lon: float = Query(77.2090, description="Longitude"),
):
    return await fetch_live_aqi(latitude=lat, longitude=lon)


# 2. School Safety on Bad Days - Operational Advisory endpoint
@app.get("/api/advisory/school")
async def get_school_safety_advisory(
    lat: float = Query(28.6139, description="Latitude"),
    lon: float = Query(77.2090, description="Longitude"),
    school_name: str = Query("Delhi Public School", description="School or campus name"),
):
    return await get_school_advisory(latitude=lat, longitude=lon, school_name=school_name)


# 3. Pollution Exposure - Cleanest Commute Smart Planner
@app.get("/api/exposure/commute")
async def get_smart_commute(
    start_lat: float = Query(28.6304, description="Origin Latitude (e.g. Connaught Place)"),
    start_lon: float = Query(77.2177, description="Origin Longitude"),
    end_lat: float = Query(28.7499, description="Destination Latitude (e.g. DTU Delhi)"),
    end_lon: float = Query(77.1170, description="Destination Longitude"),
    transit_mode: str = Query("two_wheeler", description="Mode: walking, cycling, two_wheeler, car_ac, bus"),
):
    return await plan_smart_commute(
        start_lat=start_lat,
        start_lon=start_lon,
        end_lat=end_lat,
        end_lon=end_lon,
        transit_mode=transit_mode,
    )


# 3b. Pollution Exposure - Manual Route Comparison
@app.post("/api/exposure/route")
async def compare_route_exposure(payload: RouteComparisonRequest):
    return compare_routes_exposure(payload.routes)


# 4. Stubble Burning - Active Fire Clusters & Smoke Trajectory Tracker
@app.get("/api/stubble/hotspots")
async def get_stubble_hotspots():
    return await get_stubble_burning_status()


# 5. Indoor Air - Infiltration Modeling & HEPA Purifier Runtime Calculator
@app.post("/api/indoor/estimate")
async def estimate_indoor_air(payload: IndoorAirRequest):
    return await evaluate_indoor_air(payload)


# Alerts - Subscribe for automated spike notifications
@app.post("/api/alerts/subscribe")
async def subscribe_to_alerts(payload: AlertSubscription):
    return register_subscriber(payload)


# Alerts - List current registered subscribers
@app.get("/api/alerts/subscriptions")
async def get_active_subscriptions():
    return list_subscribers()


# Alerts - Evaluate and trigger notifications (AWS EventBridge cron target)
@app.get("/api/alerts/check")
async def trigger_alerts_evaluation(
    lat: float = Query(28.6139, description="Latitude to check"),
    lon: float = Query(77.2090, description="Longitude to check"),
):
    return await check_and_dispatch_alerts(latitude=lat, longitude=lon)


# AWS Lambda adapter
handler = Mangum(app)
