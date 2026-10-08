# better_AQI 🍃

> **Hyper-local air quality intelligence, clean commute planning, and automated health advisories.**  
> Built for **Environmental Hacks (Event 02 — Bharat Builds Tour by WeMakeDevs & AWS)** • **Track 01: Air**

---

## 🌍 Problem Statement
Most air quality apps display a single, generic AQI number from a monitoring station 15 km away. They fail to answer the critical questions people face daily:
- *“Which commute route exposes my lungs to the least toxic particulate matter?”*
- *“When will the evening smog inversion spike in my neighborhood?”*
- *“Is it safe for our school to hold outdoor morning sports today?”*

**better_AQI** bridges the gap between raw environmental sensor data and real-world, actionable human decisions.

---

## ✨ Key Features
* **📍 Hyper-Local Real-Time AQI**: Live multi-pollutant telemetry (PM2.5, PM10, NO₂, Ozone, SO₂) with color-coded severity.
* **🚴 "Cleanest Commute" Exposure Planner**: Calculates cumulative toxic inhalation dosage across alternate routes, helping commuters pick the healthiest path.
* **🏫 School & Vulnerable Group Advisory**: Translates complex chemical metrics into clear operational directives (e.g., indoor assembly recommendations, HEPA filtration schedules).
* **📈 24–48h Predictive Spike Windows**: Forecasts diurnal pollution trends and farm-fire smoke arrival to help citizens plan outdoor windows.
* **🔔 Automated Alerts**: Cloud-triggered notifications when air crosses hazardous thresholds without needing to constantly check the app.

---

## 🏗️ Architecture & AWS Services

```
 [ Live Air Feeds ]        [ Satellite Stubble Data ]
(Open-Meteo / OpenAQ)          (NASA FIRMS Fire Data)
         \                              /
          \                            /
           ▼                          ▼
     ┌──────────────────────────────────────┐
     │        FastAPI on AWS Lambda         │ ◄── Hourly cron via
     │  - Aggregates multi-source feeds     │     AWS EventBridge
     │  - Calculates route inhalation score │
     │  - Generates health advisories       │
     └──────────────────┬───────────────────┘
                        │
          ┌─────────────┴─────────────┐
          ▼                           ▼
  [ Amazon S3 ]               [ Amazon DynamoDB ]
  Cached GeoJSON map layers,  User alert preferences &
  historical telemetry dumps  school safety thresholds
                                      │
                                      ▼
                              [ Amazon SNS ]
                        Instant SMS / Email Alerts
```

* **AWS Lambda + API Gateway**: Serverless, scalable API execution via `Mangum`.
* **Amazon DynamoDB**: Low-latency storage for user notification preferences and school safety profiles.
* **Amazon S3**: High-performance storage for cached spatial map layers and historical data.
* **AWS EventBridge + Amazon SNS**: Automated hourly pollution monitoring and instant spike dispatch.

---

## 🛠️ Tech Stack
* **Backend**: Python 3.12, FastAPI, Uvicorn, HTTPX (Async), Pydantic
* **Frontend**: React, MapLibre GL / Leaflet, Tailwind / CSS *(in progress)*
* **Cloud & DevOps**: AWS Lambda, Mangum, DynamoDB, S3, EventBridge, SNS

---

## 🚀 Getting Started (Backend)

### 1. Prerequisites
* Python 3.12
* `uv` or standard Python virtual environment

### 2. Setup & Installation
```bash
# Clone the repository
git clone https://github.com/akshayaparida/better_AQI.git
cd better_AQI

# Create and activate virtual environment
uv venv --python 3.12 backend/.venv
source backend/.venv/bin/activate

# Install dependencies
uv pip install -r backend/requirements.txt
```

### 3. Run Development Server
```bash
backend/.venv/bin/uvicorn main:app --app-dir backend --reload --port 8000
```
Open your browser at `http://localhost:8000/docs` to view interactive API documentation.

---

## 📜 License
MIT License. Created for the Bharat Builds Tour 2026.