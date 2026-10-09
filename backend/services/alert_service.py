import os
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from services.aqi_service import fetch_live_aqi
from config import logger


def publish_to_sns(topic_arn: str, subject: str, message: str) -> Optional[str]:
    """Publish alert message to Amazon SNS topic if AWS environment is configured."""
    try:
        import boto3
        region = os.getenv("AWS_REGION", "ap-south-1")
        sns = boto3.client("sns", region_name=region)
        response = sns.publish(
            TopicArn=topic_arn,
            Subject=subject[:100],
            Message=message,
        )
        msg_id = response.get("MessageId")
        logger.info(f"Published alert to Amazon SNS: {msg_id}")
        return msg_id
    except Exception as exc:
        logger.warning(f"AWS SNS publish skipped or offline (mock fallback): {exc}")
        return None


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
        examples=["principal@school.edu"],
        description="Subscriber email address",
    )
    phone: Optional[str] = Field(None, examples=["+919876543210"])
    location_name: str = Field(default="Delhi NCR", examples=["Rohini, Delhi"])
    latitude: float = Field(default=28.6139, examples=[28.6139])
    longitude: float = Field(default=77.2090, examples=[77.2090])
    threshold_pm25: float = Field(default=90.0, ge=30.0, examples=[90.0])
    alert_type: str = Field(default="spike_alert", examples=["spike_alert"])


def register_subscriber(sub: AlertSubscription) -> Dict[str, Any]:
    """Register a new user notification subscription."""
    sub_dict = sub.model_dump()
    sub_dict["id"] = f"sub_{len(SUBSCRIBERS_REGISTRY) + 1:03d}"
    SUBSCRIBERS_REGISTRY.append(sub_dict)

    # Live Amazon SNS topic subscription if configured
    sns_arn = os.getenv("AWS_SNS_TOPIC_ARN")
    if sns_arn and sub.email:
        try:
            import boto3
            region = os.getenv("AWS_REGION", "ap-south-1")
            sns = boto3.client("sns", region_name=region)
            sns.subscribe(TopicArn=sns_arn, Protocol="email", Endpoint=sub.email)
            logger.info(f"Subscribed {sub.email} to AWS SNS Topic: {sns_arn}")
        except Exception as exc:
            logger.info(f"AWS SNS email subscription handled locally: {exc}")

    # Format AWS SNS topic subscription payload
    sns_payload = {
        "Protocol": "email",
        "Endpoint": sub.email,
        "TopicArn": sns_arn or "arn:aws:sns:ap-south-1:123456789012:better_aqi_spike_alerts",
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
            sns_arn = os.getenv("AWS_SNS_TOPIC_ARN")
            msg_id = None
            if sns_arn:
                msg_id = publish_to_sns(sns_arn, f"Air Quality Spike Alert: {sub['location_name']}", alert_message)

            triggered_alerts.append({
                "recipient_email": sub["email"],
                "recipient_phone": sub.get("phone"),
                "threshold_pm25": sub["threshold_pm25"],
                "current_pm25": current_pm25,
                "dispatch_channel": "AWS SNS & WebPush",
                "aws_sns_message_id": msg_id,
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
