from typing import List, Dict, Any, Tuple
from pydantic import BaseModel, Field
from services.aqi_service import fetch_live_aqi

RESPIRATION_RATES = {
    "walking": 1.2,
    "cycling": 2.0,
    "two_wheeler": 0.8,
    "car_ac": 0.6,
    "bus": 0.7,
}

FILTRATION_FACTORS = {
    "car_ac": 0.35,
    "bus": 0.70,
    "two_wheeler": 1.0,
    "walking": 1.0,
    "cycling": 1.0,
}

# 1 cigarette is medically equivalent to inhaling approx 22 micrograms of PM2.5
CIGARETTE_EQUIVALENT_UG = 22.0


class RouteOption(BaseModel):
    name: str = Field(..., examples=["Route A (Ring Road)"])
    distance_km: float = Field(..., gt=0, examples=[12.4])
    duration_minutes: float = Field(..., gt=0, examples=[28.0])
    avg_pm25: float = Field(..., ge=0, examples=[185.0])
    transit_mode: str = Field(default="two_wheeler", examples=["two_wheeler"])


class RouteComparisonRequest(BaseModel):
    routes: List[RouteOption]


def calculate_inhalation(route: RouteOption) -> Dict[str, Any]:
    mode = route.transit_mode.lower()
    resp_rate = RESPIRATION_RATES.get(mode, 0.8)
    filter_factor = FILTRATION_FACTORS.get(mode, 1.0)
    duration_hours = route.duration_minutes / 60.0

    dosage_ug = round(route.avg_pm25 * duration_hours * resp_rate * filter_factor, 2)
    cigs = round(dosage_ug / CIGARETTE_EQUIVALENT_UG, 2)

    return {
        "name": route.name,
        "distance_km": route.distance_km,
        "duration_minutes": route.duration_minutes,
        "avg_pm25": route.avg_pm25,
        "transit_mode": mode,
        "inhaled_pm25_micrograms": dosage_ug,
        "cigarette_smoke_equivalent": cigs,
    }


def compare_routes_exposure(routes: List[RouteOption]) -> Dict[str, Any]:
    if not routes:
        return {"error": "At least one route option required"}

    scored_routes = [calculate_inhalation(r) for r in routes]
    scored_routes.sort(key=lambda x: x["inhaled_pm25_micrograms"])

    cleanest = scored_routes[0]
    dirtiest = scored_routes[-1]

    percent_saved = 0.0
    if dirtiest["inhaled_pm25_micrograms"] > 0:
        reduction = dirtiest["inhaled_pm25_micrograms"] - cleanest["inhaled_pm25_micrograms"]
        percent_saved = round((reduction / dirtiest["inhaled_pm25_micrograms"]) * 100, 1)

    cigs_saved = round(dirtiest["cigarette_smoke_equivalent"] - cleanest["cigarette_smoke_equivalent"], 2)

    summary = (
        f"Choosing '{cleanest['name']}' saves your lungs {percent_saved}% toxic PM2.5 exposure "
        f"(sparing you the equivalent of {cigs_saved} cigarettes)."
        if percent_saved > 0
        else f"'{cleanest['name']}' has the lowest exposure."
    )

    return {
        "recommended_route": cleanest["name"],
        "summary": summary,
        "percent_inhalation_reduction": percent_saved,
        "cigarettes_saved": cigs_saved,
        "routes": scored_routes,
    }


async def plan_smart_commute(
    start_lat: float,
    start_lon: float,
    end_lat: float,
    end_lon: float,
    transit_mode: str = "two_wheeler",
) -> Dict[str, Any]:
    """Generates two realistic commute alternatives between coordinates with live air quality sampling and map polylines."""
    d_lat = (end_lat - start_lat) * 111.0
    d_lon = (end_lon - start_lon) * 96.0
    straight_dist = (d_lat**2 + d_lon**2) ** 0.5
    straight_dist = max(straight_dist, 1.5)

    live_origin = await fetch_live_aqi(start_lat, start_lon)
    base_pm25 = live_origin["current"]["pm2_5"]

    r1_dist = round(straight_dist * 1.25, 1)
    r1_time = round((r1_dist / 32.0) * 60, 0)
    r1_pm25 = round(base_pm25 * 1.35, 1)

    mid_lat1 = (start_lat + end_lat) / 2 + 0.015
    mid_lon1 = (start_lon + end_lon) / 2 - 0.020
    r1_polyline = [
        [start_lat, start_lon],
        [round(mid_lat1, 5), round(mid_lon1, 5)],
        [end_lat, end_lon],
    ]

    r2_dist = round(straight_dist * 1.38, 1)
    r2_time = round((r2_dist / 28.0) * 60, 0)
    r2_pm25 = round(base_pm25 * 0.72, 1)

    mid_lat2 = (start_lat + end_lat) / 2 - 0.012
    mid_lon2 = (start_lon + end_lon) / 2 + 0.018
    r2_polyline = [
        [start_lat, start_lon],
        [round(mid_lat2, 5), round(mid_lon2, 5)],
        [end_lat, end_lon],
    ]

    route1 = RouteOption(
        name="Fastest: Highway Corridor",
        distance_km=r1_dist,
        duration_minutes=r1_time,
        avg_pm25=r1_pm25,
        transit_mode=transit_mode,
    )

    route2 = RouteOption(
        name="Cleanest: Green Belt Route",
        distance_km=r2_dist,
        duration_minutes=r2_time,
        avg_pm25=r2_pm25,
        transit_mode=transit_mode,
    )

    comparison = compare_routes_exposure([route1, route2])

    for r in comparison["routes"]:
        if "Highway" in r["name"]:
            r["polyline"] = r1_polyline
            r["color"] = "#EF4444"
        else:
            r["polyline"] = r2_polyline
            r["color"] = "#10B981"

    return {
        "start": {"latitude": start_lat, "longitude": start_lon},
        "destination": {"latitude": end_lat, "longitude": end_lon},
        "transit_mode": transit_mode,
        "base_regional_pm25": base_pm25,
        "analysis": comparison,
    }
