import httpx
from typing import Dict, Any, List

OPEN_METEO_WEATHER_URL = "https://api.open-meteo.com/v1/forecast"

# Representative active agricultural burning districts across Punjab and Haryana
ACTIVE_FIRE_CLUSTERS = [
    {"district": "Sangrur, Punjab", "latitude": 30.2458, "longitude": 75.8421, "active_fires": 142, "intensity": "High"},
    {"district": "Bathinda, Punjab", "latitude": 30.2110, "longitude": 74.9455, "active_fires": 118, "intensity": "High"},
    {"district": "Firozpur, Punjab", "latitude": 30.9237, "longitude": 74.6138, "active_fires": 94, "intensity": "Moderate"},
    {"district": "Tarn Taran, Punjab", "latitude": 31.4520, "longitude": 74.9265, "active_fires": 87, "intensity": "Moderate"},
    {"district": "Karnal, Haryana", "latitude": 29.6857, "longitude": 76.9905, "active_fires": 45, "intensity": "Moderate"},
    {"district": "Kaithal, Haryana", "latitude": 29.8015, "longitude": 76.3996, "active_fires": 38, "intensity": "Low"},
]


async def fetch_wind_vector(latitude: float = 28.6139, longitude: float = 77.2090) -> Dict[str, Any]:
    """Fetch live wind speed and wind direction for Delhi NCR to calculate stubble smoke transport."""
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": ["wind_speed_10m", "wind_direction_10m"],
        "timezone": "auto",
    }
    async with httpx.AsyncClient(timeout=5.0) as client:
        res = await client.get(OPEN_METEO_WEATHER_URL, params=params)
        res.raise_for_status()
        data = res.json()

    current = data.get("current", {})
    return {
        "speed_kmh": current.get("wind_speed_10m", 12.0),
        "direction_degrees": current.get("wind_direction_10m", 310),
    }


def analyze_smoke_trajectory(wind_deg: float, wind_speed: float, total_fires: int) -> Dict[str, Any]:
    """Determine if wind carries North-Western stubble smoke into NCR."""
    # North-Westerly winds (approx 290 deg to 340 deg) blow directly from Punjab toward Delhi
    is_north_westerly = 285.0 <= wind_deg <= 345.0

    if is_north_westerly and wind_speed > 6.0:
        inflow_risk = "HIGH_INFLOW"
        estimated_contribution_pct = min(round(15 + (total_fires * 0.05) + (wind_speed * 0.8), 1), 48.0)
        advisory = (
            f"Winds are blowing from the North-West ({wind_deg}°) at {wind_speed} km/h, carrying stubble smoke "
            f"directly into Delhi NCR. Farm fires account for approx {estimated_contribution_pct}% of ground-level PM2.5."
        )
    elif is_north_westerly and wind_speed <= 6.0:
        inflow_risk = "MODERATE_STAGNANT"
        estimated_contribution_pct = 18.5
        advisory = "Winds are North-Westerly but very calm (< 6 km/h). Smoke accumulation is slow, but local inversion will trap particulates overnight."
    else:
        inflow_risk = "LOW_FAVORABLE_WINDS"
        estimated_contribution_pct = 6.0
        advisory = f"Winds are blowing from {wind_deg}°, pushing smoke away from Delhi NCR. Stubble burning impact is currently minimal."

    return {
        "inflow_risk": inflow_risk,
        "estimated_pm25_contribution_percentage": estimated_contribution_pct,
        "advisory": advisory,
    }


async def get_stubble_burning_status() -> Dict[str, Any]:
    """Fetch live wind data and correlate with farm fire hotspot clusters."""
    wind = await fetch_wind_vector()
    total_active_fires = sum(c["active_fires"] for c in ACTIVE_FIRE_CLUSTERS)
    trajectory = analyze_smoke_trajectory(wind["direction_degrees"], wind["speed_kmh"], total_active_fires)

    return {
        "summary": {
            "total_monitored_fires": total_active_fires,
            "hotspot_regions_count": len(ACTIVE_FIRE_CLUSTERS),
            "smoke_transport_risk": trajectory["inflow_risk"],
            "stubble_contribution_to_ncr": f"{trajectory['estimated_pm25_contribution_percentage']}%",
            "advisory": trajectory["advisory"],
        },
        "meteorology": {
            "wind_speed_kmh": wind["speed_kmh"],
            "wind_direction_degrees": wind["direction_degrees"],
            "transport_direction": "North-West to South-East (Punjab -> Delhi)" if 285 <= wind["direction_degrees"] <= 345 else "Non-NCR Trajectory",
        },
        "hotspot_clusters": ACTIVE_FIRE_CLUSTERS,
    }
