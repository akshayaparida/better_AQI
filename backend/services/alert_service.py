import os
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from services.aqi_service import fetch_live_aqi

# In-memory registry for subscribers (persists to Amazon DynamoDB in cloud deployment)
SUBSCRIBERS_REGISTRY: List[Dict[str, Any]] = [
    {
        "id": "sub_demo_01",
        "email": "demo_school_admin@delhischool.edu",
        "phone": "+919876543210",
        "location_name": "Delhi Public School, Rohini",
        "latitude": 28.7041,
        "longitude": 77.1025,
        "threshold_pm25": 80.0,
        "alert_type": "spike_alert",
    }
]


class AlertSubscription(BaseModel):
    email: str = Field(
        ...,
        pattern=r"^[\w\.-]+@[\w\.-]+\.\w+$",
        example="principal@school.edu",
        description="Subscriber email address",
    )
    phone: Optional[str] = Field(None, example="+919876543210")
    location_name: str = Field(default="Delhi NCR", example="Rohini, Delhi")
    latitude: float = Field(default=28.6139, example=28.6139)
    longitude: float = Field(default=77.2090, example=77.2090)
    threshold_pm25: float = Field(default=90.0, ge=30.0, example=90.0)
    alert_type: str = Field(default="spike_alert", example="spike_alert")


def register_subscriber(sub: AlertSubscription) -> Dict[str, Any]:
    """Register a new user notification subscription."""
    sub_dict = sub.model_dump()
    sub_dict["id"] = f"sub_{len(SUBSCRIBERS_REGISTRY) + 1:03d}"
    SUBSCRIBERS_REGISTRY.append(sub_dict)

    # Format AWS SNS topic subscription payload
    sns_payload = {
        "Protocol": "email",
        "Endpoint": sub.email,
        "Attributes": {
            "FilterPolicy": f'{{"threshold_pm25": [{{"numeric": [">=", {sub.threshold_pm25}]}}]}}'
        },
    }

    return {
        "status": "subscribed",
        "subscription_id": sub_dict["id"],
        "message": f"Successfully registered for alerts when PM2.5 exceeds {sub.threshold_pm25} µg/m³ in {sub.location_name}.",
        "aws_sns_integration": sns_payload,
    }


def list_subscribers() -> List[Dict[str, Any]]:
    return SUBSCRIBERS_REGISTRY


async def check_and_dispatch_alerts(latitude: float = 28.6139, longitude: float = 77.2090) -> Dict[str, Any]:
    """Check live AQI against all registered subscriptions and trigger alerts if thresholds are breached."""
    live_data = await fetch_live_aqi(latitude, longitude)
    current_pm25 = live_data["current"]["pm2_5"]
    cpcb = live_data["current"]["cpcb_category"]
    triggered_alerts = []

    for sub in SUBSCRIBERS_REGISTRY:
        if current_pm25 >= sub["threshold_pm25"]:
            alert_message = (
                f"🚨 better_AQI ALERT: PM2.5 in {sub['location_name']} is currently {current_pm25} µg/m³ "
                f"({cpcb} category), breaching your safety threshold of {sub['threshold_pm25']} µg/m³. "
                f"Recommended Action: Postpone outdoor activities, close windows, and turn on HEPA air purifiers."
            )
            triggered_alerts.append({
                "recipient_email": sub["email"],
                "recipient_phone": sub.get("phone"),
                "threshold_pm25": sub["threshold_pm25"],
                "current_pm25": current_pm25,
                "dispatch_channel": "AWS SNS & WebPush",
                "message": alert_message,
            })

    return {
        "current_reading": {
            "latitude": latitude,
            "longitude": longitude,
            "current_pm2_5": current_pm25,
            "cpcb_category": cpcb,
        },
        "total_active_subscriptions": len(SUBSCRIBERS_REGISTRY),
        "alerts_triggered_count": len(triggered_alerts),
        "dispatches": triggered_alerts,
    }
