from typing import Dict, Any
from services.aqi_service import fetch_live_aqi


def compute_school_safety(pm25: float, hourly_times: list, hourly_pm25: list) -> Dict[str, Any]:
    """Calculate operational safety guidelines for schools based on PM2.5 thresholds."""
    if pm25 <= 60:
        assembly = {"status": "ALLOWED", "recommendation": "Morning assembly can be conducted outdoors.", "severity": "low"}
        sports = {"status": "NORMAL", "recommendation": "Outdoor sports and recess activities permitted.", "severity": "low"}
        purifier = {"mode": "STANDBY", "guidance": "Standard ventilation. Purifiers optional.", "severity": "low"}
    elif pm25 <= 120:
        assembly = {"status": "CAUTION", "recommendation": "Keep outdoor assembly brief (under 15 minutes).", "severity": "medium"}
        sports = {"status": "RESTRICTED", "recommendation": "Limit intense aerobic drills; provide frequent water breaks.", "severity": "medium"}
        purifier = {"mode": "MEDIUM", "guidance": "Run classroom air purifiers at medium speed.", "severity": "medium"}
    else:
        assembly = {"status": "SUSPENDED", "recommendation": "Conduct morning assembly inside classrooms or auditoriums.", "severity": "high"}
        sports = {"status": "INDOORS_ONLY", "recommendation": "All outdoor sports and physical training strictly suspended.", "severity": "high"}
        purifier = {"mode": "MAX_TURBO", "guidance": "Seal windows and doors. Run HEPA filtration on Turbo mode.", "severity": "high"}

    # Find cleanest 2-hour window from daytime forecast (between 10 AM and 4 PM)
    cleanest_time = "1:00 PM - 3:00 PM"
    if hourly_times and hourly_pm25 and len(hourly_times) == len(hourly_pm25):
        daytime_readings = []
        for t, val in zip(hourly_times, hourly_pm25):
            hour = int(t.split("T")[-1].split(":")[0]) if "T" in t else 12
            if 10 <= hour <= 16:
                daytime_readings.append((val, t))
        if daytime_readings:
            best = min(daytime_readings, key=lambda x: x[0])
            best_hour = int(best[1].split("T")[-1].split(":")[0])
            cleanest_time = f"{best_hour:02d}:00 - {best_hour + 2:02d}:00"

    return {
        "assembly": assembly,
        "sports_and_recess": sports,
        "classroom_purifiers": purifier,
        "optimal_air_exchange_window": {
            "window": cleanest_time,
            "reason": "Mid-day solar heating breaks the morning ground inversion layer.",
        },
        "vulnerable_students_alert": "Students with asthma or respiratory conditions must wear N95/FFP2 masks outdoors." if pm25 > 90 else "Standard precautions.",
    }


async def get_school_advisory(latitude: float = 28.6139, longitude: float = 77.2090, school_name: str = "Campus") -> Dict[str, Any]:
    """Fetch live data and generate an actionable operational safety briefing for a school."""
    aqi_data = await fetch_live_aqi(latitude, longitude)
    pm25 = aqi_data["current"]["pm2_5"]
    hourly_times = aqi_data["forecast"]["hourly_times"]
    hourly_pm25 = aqi_data["forecast"]["hourly_pm25"]

    safety = compute_school_safety(pm25, hourly_times, hourly_pm25)

    return {
        "school_name": school_name,
        "location": aqi_data["location"],
        "current_air": aqi_data["current"],
        "advisory": safety,
    }
