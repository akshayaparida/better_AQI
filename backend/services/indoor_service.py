from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from services.aqi_service import fetch_live_aqi


class IndoorAirRequest(BaseModel):
    latitude: float = Field(default=28.6139, example=28.6139)
    longitude: float = Field(default=77.2090, example=77.2090)
    room_area_sqft: float = Field(default=200.0, gt=20.0, example=250.0)
    ceiling_height_ft: float = Field(default=10.0, gt=6.0, example=10.0)
    window_sealing: str = Field(default="standard", example="standard", description="poor, standard, or airtight")
    has_air_purifier: bool = Field(default=True, example=True)
    purifier_cadr_m3h: float = Field(default=300.0, gt=50.0, example=300.0, description="Clean Air Delivery Rate in m3/hour")


def calculate_indoor_air_quality(outdoor_pm25: float, req: IndoorAirRequest) -> Dict[str, Any]:
    # Infiltration ratios based on architectural sealing quality
    infiltration_map = {
        "airtight": 0.25,
        "standard": 0.55,
        "poor": 0.85,
    }
    infil_factor = infiltration_map.get(req.window_sealing.lower(), 0.55)

    # Room volume in cubic meters
    area_m2 = req.room_area_sqft * 0.092903
    height_m = req.ceiling_height_ft * 0.3048
    volume_m3 = round(area_m2 * height_m, 1)

    # Baseline indoor PM2.5 without filtration
    unfiltered_indoor_pm25 = round(outdoor_pm25 * infil_factor, 1)

    if not req.has_air_purifier:
        return {
            "room_volume_m3": volume_m3,
            "outdoor_pm25": outdoor_pm25,
            "estimated_indoor_pm25": unfiltered_indoor_pm25,
            "air_quality_status": "POOR" if unfiltered_indoor_pm25 > 60 else "MODERATE",
            "purifier_active": False,
            "recommendation": "Install a HEPA air purifier or seal door/window gaps to prevent outdoor toxic ingress.",
        }

    # Air Changes per Hour (ACH) by purifier
    ach = round(req.purifier_cadr_m3h / volume_m3, 2)

    # Equilibrium PM2.5 with purifier operating continuously
    # Standard indoor aerosol decay model: C_eq = C_unfiltered / (1 + ACH/infiltration)
    effective_indoor_pm25 = round(unfiltered_indoor_pm25 / (1.0 + (ach * 0.75)), 1)

    # Time in minutes to clean room down to safe WHO/CPCB level (<= 30 ug/m3)
    minutes_to_clean = 0
    if unfiltered_indoor_pm25 > 30:
        # Exponential particulate clearance rate: t = (ln(C0 / C_target) / ACH) * 60
        target = 30.0
        decay_constant = max(ach, 1.0)
        import math
        minutes_to_clean = round((math.log(unfiltered_indoor_pm25 / target) / decay_constant) * 60, 0)
        minutes_to_clean = max(int(minutes_to_clean), 8)

    ach_rating = "Excellent (> 5 ACH)" if ach >= 5.0 else ("Adequate (3 - 5 ACH)" if ach >= 3.0 else "Undersized (< 3 ACH)")

    return {
        "room_specs": {
            "area_sqft": req.room_area_sqft,
            "volume_m3": volume_m3,
            "window_sealing": req.window_sealing,
        },
        "air_metrics": {
            "outdoor_pm25": outdoor_pm25,
            "indoor_pm25_without_purifier": unfiltered_indoor_pm25,
            "indoor_pm25_with_purifier": effective_indoor_pm25,
            "reduction_percentage": round(((unfiltered_indoor_pm25 - effective_indoor_pm25) / unfiltered_indoor_pm25) * 100, 1),
        },
        "purifier_performance": {
            "cadr_rating": req.purifier_cadr_m3h,
            "air_changes_per_hour": ach,
            "coverage_rating": ach_rating,
            "minutes_to_reach_safe_air": minutes_to_clean,
        },
        "action_advisory": (
            f"Run your purifier on Turbo for {minutes_to_clean} minutes to drop PM2.5 from {unfiltered_indoor_pm25} to < 30 µg/m³. "
            f"Once achieved, switch to Low/Eco mode with windows firmly shut."
            if minutes_to_clean > 0
            else "Indoor air is currently within the safe green threshold."
        ),
    }


async def evaluate_indoor_air(req: IndoorAirRequest) -> Dict[str, Any]:
    """Fetch live outdoor AQI and evaluate indoor air quality and purifier runtime."""
    live = await fetch_live_aqi(req.latitude, req.longitude)
    outdoor_pm25 = live["current"]["pm2_5"]
    return calculate_indoor_air_quality(outdoor_pm25, req)
