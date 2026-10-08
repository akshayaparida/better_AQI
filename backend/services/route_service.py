from typing import List, Dict, Any
from pydantic import BaseModel, Field

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


class RouteOption(BaseModel):
    name: str = Field(..., example="Route A (Ring Road)")
    distance_km: float = Field(..., gt=0, example=12.4)
    duration_minutes: float = Field(..., gt=0, example=28.0)
    avg_pm25: float = Field(..., ge=0, example=185.0)
    transit_mode: str = Field(default="two_wheeler", example="two_wheeler")


class RouteComparisonRequest(BaseModel):
    routes: List[RouteOption]


def calculate_inhalation(route: RouteOption) -> Dict[str, Any]:
    mode = route.transit_mode.lower()
    resp_rate = RESPIRATION_RATES.get(mode, 0.8)
    filter_factor = FILTRATION_FACTORS.get(mode, 1.0)
    duration_hours = route.duration_minutes / 60.0

    dosage_ug = round(route.avg_pm25 * duration_hours * resp_rate * filter_factor, 2)

    return {
        "name": route.name,
        "distance_km": route.distance_km,
        "duration_minutes": route.duration_minutes,
        "avg_pm25": route.avg_pm25,
        "transit_mode": mode,
        "inhaled_pm25_micrograms": dosage_ug,
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

    recommendation = (
        f"'{cleanest['name']}' is the healthiest choice, reducing your inhaled PM2.5 dosage by {percent_saved}%."
        if percent_saved > 0
        else f"'{cleanest['name']}' has the lowest exposure."
    )

    return {
        "recommended_route": cleanest["name"],
        "summary": recommendation,
        "percent_inhalation_reduction": percent_saved,
        "routes": scored_routes,
    }
