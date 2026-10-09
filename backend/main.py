import time
from fastapi import FastAPI, Query, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
import httpx

from config import settings, logger
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

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Production-grade hyper-local AQI, cleanest commute planning, and school safety advisory engine",
)

# Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Structured Request Logging & OWASP Security Headers Middleware
@app.middleware("http")
async def security_and_logging_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration_ms = round((time.time() - start_time) * 1000, 2)
    logger.info(
        f"{request.method} {request.url.path} -> Status: {response.status_code} ({duration_ms}ms)"
    )

    # OWASP Defense-in-Depth Security Headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

    # Edge caching for idempotent telemetry feeds (2-minute TTL)
    if request.method == "GET" and request.url.path in [
        "/api/aqi/live",
        "/api/stubble/summary",
        "/api/stubble/hotspots",
    ]:
        response.headers["Cache-Control"] = "public, max-age=120"

    return response


# Global Exception Handlers
@app.exception_handler(httpx.HTTPError)
async def external_api_exception_handler(request: Request, exc: httpx.HTTPError):
    logger.error(f"External API Failure on {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=503,
        content={
            "error": "EXTERNAL_SERVICE_UNAVAILABLE",
            "message": "Environmental data provider is temporarily unreachable. Please retry shortly.",
            "path": request.url.path,
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected error occurred while processing the request.",
            "path": request.url.path,
        },
    )


# Root & Cloud Health Check
@app.get("/", tags=["General"])
async def root():
    return {"service": settings.APP_NAME, "version": settings.APP_VERSION, "status": "online"}


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "service": "better_AQI", "version": settings.APP_VERSION}


# 1. AQI - Live telemetry endpoint
@app.get("/api/aqi/live", tags=["Air Quality"])
async def get_live_aqi(
    lat: float = Query(settings.DEFAULT_LATITUDE, description="Latitude"),
    lon: float = Query(settings.DEFAULT_LONGITUDE, description="Longitude"),
):
    return await fetch_live_aqi(latitude=lat, longitude=lon)


# 2. School Safety on Bad Days - Operational Advisory endpoint
@app.get("/api/advisory/school", tags=["School Advisory"])
async def get_school_safety_advisory(
    lat: float = Query(settings.DEFAULT_LATITUDE, description="Latitude"),
    lon: float = Query(settings.DEFAULT_LONGITUDE, description="Longitude"),
    school_name: str = Query("Delhi Public School", description="School or campus name"),
):
    return await get_school_advisory(latitude=lat, longitude=lon, school_name=school_name)


# 3. Pollution Exposure - Cleanest Commute Smart Planner
@app.get("/api/exposure/commute", tags=["Commute Planning"])
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
@app.post("/api/exposure/route", tags=["Commute Planning"])
async def compare_route_exposure(payload: RouteComparisonRequest):
    return compare_routes_exposure(payload.routes)


# 4. Stubble Burning - Active Fire Clusters & Smoke Trajectory Tracker
@app.get("/api/stubble/hotspots", tags=["Stubble Burning"])
async def get_stubble_hotspots():
    return await get_stubble_burning_status()


# 5. Indoor Air - Infiltration Modeling & HEPA Purifier Runtime Calculator
@app.post("/api/indoor/estimate", tags=["Indoor Air"])
async def estimate_indoor_air(payload: IndoorAirRequest):
    return await evaluate_indoor_air(payload)


# 6. Alerts - Subscribe for automated spike notifications
@app.post("/api/alerts/subscribe", tags=["Alerts"])
async def subscribe_to_alerts(payload: AlertSubscription):
    return register_subscriber(payload)


# 6b. Alerts - List current registered subscribers
@app.get("/api/alerts/subscriptions", tags=["Alerts"])
async def get_active_subscriptions():
    return list_subscribers()


# 6c. Alerts - Evaluate and trigger notifications (AWS EventBridge cron target)
@app.get("/api/alerts/check", tags=["Alerts"])
async def trigger_alerts_evaluation(
    lat: float = Query(settings.DEFAULT_LATITUDE, description="Latitude to check"),
    lon: float = Query(settings.DEFAULT_LONGITUDE, description="Longitude to check"),
):
    return await check_and_dispatch_alerts(latitude=lat, longitude=lon)


# AWS Lambda adapter
handler = Mangum(app)
