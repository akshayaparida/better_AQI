import httpx
from typing import Dict, Any

OPEN_METEO_AIR_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"


def get_cpcb_category(pm25: float) -> Dict[str, str]:
    """Determine Indian CPCB / NAAQS category and health color from PM2.5 (ug/m3)."""
    if pm25 <= 30:
        return {"category": "Good", "color": "#10B981", "risk": "Minimal"}
    elif pm25 <= 60:
        return {"category": "Satisfactory", "color": "#84CC16", "risk": "Minor breathing discomfort for sensitive people"}
    elif pm25 <= 90:
        return {"category": "Moderate", "color": "#FBBF24", "risk": "Discomfort to people with asthma and heart diseases"}
    elif pm25 <= 120:
        return {"category": "Poor", "color": "#F97316", "risk": "Breathing discomfort to most people on prolonged exposure"}
    elif pm25 <= 250:
        return {"category": "Very Poor", "color": "#EF4444", "risk": "Respiratory illness to the people on prolonged exposure"}
    else:
        return {"category": "Severe / Hazardous", "color": "#7F1D1D", "risk": "Affects healthy people and seriously impacts those with existing diseases"}


async def fetch_live_aqi(latitude: float = 28.6139, longitude: float = 77.2090) -> Dict[str, Any]:
    """Fetch live multi-pollutant telemetry and 48-hour forecast from Open-Meteo."""
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": [
            "pm10",
            "pm2_5",
            "carbon_monoxide",
            "nitrogen_dioxide",
            "sulphur_dioxide",
            "ozone",
            "us_aqi",
        ],
        "hourly": [
            "pm2_5",
            "pm10",
            "us_aqi",
        ],
        "forecast_days": 2,
        "timezone": "auto",
    }

    async with httpx.AsyncClient(timeout=5.0) as client:
        response = await client.get(OPEN_METEO_AIR_URL, params=params)
        response.raise_for_status()
        data = response.json()

    current = data.get("current", {})
    pm25 = current.get("pm2_5", 0.0)
    cpcb = get_cpcb_category(pm25)

    return {
        "location": {"latitude": latitude, "longitude": longitude},
        "current": {
            "pm2_5": pm25,
            "pm10": current.get("pm10"),
            "no2": current.get("nitrogen_dioxide"),
            "so2": current.get("sulphur_dioxide"),
            "o3": current.get("ozone"),
            "co": current.get("carbon_monoxide"),
            "us_aqi": current.get("us_aqi"),
            "cpcb_category": cpcb["category"],
            "color": cpcb["color"],
            "health_risk": cpcb["risk"],
            "timestamp": current.get("time"),
        },
        "forecast": {
            "hourly_times": data.get("hourly", {}).get("time", [])[:24],
            "hourly_pm25": data.get("hourly", {}).get("pm2_5", [])[:24],
            "hourly_aqi": data.get("hourly", {}).get("us_aqi", [])[:24],
        },
    }
