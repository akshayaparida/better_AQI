import pytest
import sys
import os

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from httpx import AsyncClient, ASGITransport
from main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.mark.anyio
async def test_health_check():
    """Verify cloud health check endpoint."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["service"] == "better_AQI"


@pytest.mark.anyio
async def test_root_status():
    """Verify service status endpoint."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/")
        assert response.status_code == 200
        assert response.json()["status"] == "online"


@pytest.mark.anyio
async def test_live_aqi_telemetry():
    """Verify live multi-pollutant telemetry and CPCB classification."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/aqi/live?lat=28.6139&lon=77.2090")
        assert response.status_code == 200
        data = response.json()
        assert "current" in data
        assert "pm2_5" in data["current"]
        assert "cpcb_category" in data["current"]
        assert "color" in data["current"]


@pytest.mark.anyio
async def test_school_safety_advisory():
    """Verify school operational assembly, sports, and purifier directives."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/advisory/school?school_name=Delhi+Public+School")
        assert response.status_code == 200
        data = response.json()
        assert data["school_name"] == "Delhi Public School"
        assert "assembly" in data["advisory"]
        assert "sports_and_recess" in data["advisory"]
        assert "classroom_purifiers" in data["advisory"]
        assert "optimal_air_exchange_window" in data["advisory"]


@pytest.mark.anyio
async def test_smart_commute_planner():
    """Verify Cleanest Commute with cigarette equivalents and map polylines."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get(
            "/api/exposure/commute?start_lat=28.6304&start_lon=77.2177&end_lat=28.7499&end_lon=77.1170&transit_mode=two_wheeler"
        )
        assert response.status_code == 200
        data = response.json()
        assert "analysis" in data
        assert "recommended_route" in data["analysis"]
        assert "cigarettes_saved" in data["analysis"]
        assert len(data["analysis"]["routes"]) == 2
        for r in data["analysis"]["routes"]:
            assert "polyline" in r
            assert len(r["polyline"]) >= 2


@pytest.mark.anyio
async def test_stubble_burning_tracker():
    """Verify agricultural fire hotspots and wind smoke trajectory."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/stubble/hotspots")
        assert response.status_code == 200
        data = response.json()
        assert "summary" in data
        assert data["summary"]["total_monitored_fires"] > 0
        assert "smoke_transport_risk" in data["summary"]
        assert len(data["hotspot_clusters"]) >= 5


@pytest.mark.anyio
async def test_indoor_air_and_purifier():
    """Verify indoor air infiltration model and purifier runtime calculator."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/indoor/estimate",
            json={
                "room_area_sqft": 220.0,
                "ceiling_height_ft": 10.0,
                "window_sealing": "standard",
                "purifier_cadr_m3h": 300.0,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "air_metrics" in data
        assert "purifier_performance" in data
        assert data["purifier_performance"]["minutes_to_reach_safe_air"] >= 0


@pytest.mark.anyio
async def test_alert_subscriptions_and_check():
    """Verify alert registration and live spike evaluation."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Register subscription
        sub_resp = await client.post(
            "/api/alerts/subscribe",
            json={
                "email": "test_subscriber@domain.com",
                "location_name": "Noida Sector 62",
                "threshold_pm25": 60.0,
            },
        )
        assert sub_resp.status_code == 200
        assert sub_resp.json()["status"] == "subscribed"

        # 2. Check trigger
        check_resp = await client.get("/api/alerts/check")
        assert check_resp.status_code == 200
        assert "alerts_triggered_count" in check_resp.json()
