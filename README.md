# better_AQI 🍃

> **Hyper-local air quality intelligence, cleanest commute exposure planning, and automated health advisories.**  
> Built for **Environmental Hacks (Bharat Builds Tour 2026 by WeMakeDevs & AWS)** • **Track 01: Air**

[![CI Pipeline](https://img.shields.io/badge/CI%20Pipeline-GitHub%20Actions-blue?logo=githubactions)](.github/workflows/ci.yml)
[![Backend Tests](https://img.shields.io/badge/backend%20tests-14%2F14%20passed-success?logo=pytest)](backend/tests/)
[![Frontend Tests](https://img.shields.io/badge/frontend%20tests-39%2F39%20passed-success?logo=vitest)](frontend/src/tests/)
[![AWS Open Source](https://img.shields.io/badge/AWS%20Open%20Source-SAM%20CLI%20%7C%20Strands%20SDK%20%7C%20LocalStack-orange?logo=amazon-aws)](template.yaml)
[![Code Hygiene](https://img.shields.io/badge/oxlint-0%20warnings-brightgreen)](frontend/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

> 🏆 **Track & AWS Open Source Integration:**  
> **better_AQI is in the Air track and uses AWS Strands Agents, SAM CLI and LocalStack.**  
> - **AWS Strands Agents SDK** (`strands-agents`): Autonomous multi-tool air health reasoning agent with Amazon Bedrock.  
> - **AWS SAM CLI** (`aws-sam-cli`): Built for Lambda with SAM, validated locally with `sam validate`.  
> - **LocalStack** (`docker-compose.localstack.yml`): Tested locally on LocalStack for Amazon DynamoDB and Amazon SNS emulation.  

---

## 📄 Hackathon Submission Document
👉 **Read the full submission write-up & 3-minute video presentation script in [`HACKATHON_SUBMISSION.md`](HACKATHON_SUBMISSION.md).**

---

## 🌍 The Problem
Most air quality apps display a single, generic AQI number from a monitoring station often kilometers away. They fail to answer the critical daily questions faced by citizens, commuters, and school administrators:
- *“Which route between Connaught Place and Rohini exposes my lungs to the least toxic PM2.5?”*
- *“How many cigarettes does my commute exposure equate to (Berkeley Earth rule)?”*
- *“Is it safe for our school to hold outdoor morning sports or assembly today?”*
- *“How many minutes must we run our classroom HEPA purifier to reach medical-grade safe air?”*

**better_AQI** bridges the gap between raw environmental sensor data, satellite thermal fire detection, and actionable human decisions.

---

## ✨ Features (All 5 Track 01 Rubric Tags Covered)

1. **📍 Hyper-Local Real-Time AQI & CPCB Severity:** Live multi-pollutant telemetry (PM2.5, PM10, NO₂, Ozone, SO₂) with official Indian Central Pollution Control Board (CPCB) NAAQS 6-tier classification.
2. **🚴 "Cleanest Commute" Exposure Planner:** Compares alternate GPS routes with transit modes (**Bicycle, Two-Wheeler / Auto, Car with AC Filter, Walking**) to calculate toxic inhalation ($\mu\text{g}$) and cigarette equivalents ($22\,\mu\text{g} \text{ PM2.5} \approx 1 \text{ cigarette}$).
3. **🔥 Stubble Burning & Smoke Inflow Tracker:** Monitors 524 active agricultural farm fire clusters in Punjab & Haryana (NASA FIRMS satellite thermal data) correlated with meteorological boundary-layer wind vectors to compute NCR smoke arrival.
4. **🏠 Indoor Air & HEPA Purifier CADR Countdown:** Models room area, volume ($m^3$), and window envelope leakage (*airtight*, *standard*, *poor*) to display a real-time countdown timer to safe air ($< 30\,\mu\text{g/m}^3$).
5. **🏫 School & Vulnerable Group Advisory:** Provides operational safety directives for morning assembly, sports recess, classroom purifiers, and the **optimal mid-day ventilation window** (when solar heating breaks the morning ground inversion layer).
6. **🤖 Autonomous AI Air Advisor (AWS Strands SDK + Amazon Bedrock):** Autonomous agent reasoning across multi-pollutant telemetry, student activity protocols, and transit dosage models with registered tools.
7. **🌱 Citizen Responsibility & Civic Action Pledge:** Interactive daily civic pledge, habit checklist (zero-idling, dust suppression), commute shift emission savings calculator, and municipal grievance hotlines.
8. **🔔 Automated Cloud Spike Alerts:** EventBridge-driven automated monitoring triggering instant SMS and email broadcasts via **Amazon SNS**.

---

## 🏗️ AWS Cloud Architecture

```mermaid
flowchart TD
    subgraph Clients["Frontend Layer"]
        User["User Browser and Mobile"]
        Amplify["React 19 Frontend - Vite and Leaflet"]
    end

    subgraph Ingestion["Serverless API Layer"]
        APIGW["Amazon API Gateway HTTP API"]
        Lambda["AWS Lambda Function - Python 3.12 and Mangum"]
    end

    subgraph DataServices["AWS Storage and Notifications"]
        DynamoDB["Amazon DynamoDB Subscriptions Table"]
        SNS["Amazon SNS Spike Alert Topic"]
        EventBridge["AWS EventBridge Hourly Rule"]
    end

    subgraph ExternalFeeds["Telemetry Data Sources"]
        OpenMeteo["Open-Meteo Air Quality API"]
        NASA["NASA FIRMS Satellite Thermal Data"]
    end

    User --> Amplify
    Amplify --> APIGW
    APIGW --> Lambda
    Lambda --> ExternalFeeds
    Lambda --> DynamoDB
    Lambda --> SNS
    EventBridge -.->|Hourly Trigger| Lambda
    SNS -->|SMS and Email| User
```

### Built for Lambda with SAM, Tested Locally on LocalStack
* **AWS Lambda (`BetterAqiApiFunction`):** Built for serverless execution using Python 3.12 and the `Mangum` ASGI adapter in `template.yaml`.
* **Amazon API Gateway (`BetterAqiHttpApi`):** Declaratively defined HTTP API handling routing, TLS, and CORS.
* **Amazon DynamoDB (`better_aqi_subscriptions`):** Modeled in SAM, tested locally via LocalStack for subscriber persistence.
* **Amazon SNS (`better_aqi_spike_alerts`):** Modeled in SAM, tested locally via LocalStack for spike alert fan-out.
* **AWS EventBridge (`HourlyAirQualityCheckSchedule`):** Scheduled hourly rule defined in `template.yaml`.
* **AWS SAM CLI (`template.yaml`):** Open-source IaC tool validating the serverless architecture (`sam validate`).
* **LocalStack (`docker-compose.localstack.yml`):** Local cloud emulator used for zero-cost offline testing.

---

## 🛠️ Tech Stack
* **Backend:** Python 3.12, FastAPI, Uvicorn, HTTPX (Async), Pydantic v2, Mangum, Boto3, Pytest
* **AI & Agent:** AWS Strands Agents SDK (`strands-agents`), Amazon Bedrock
* **Frontend:** React 19, Vite, Leaflet, Lucide Icons, Vitest, React Testing Library, JSDOM, Oxlint
* **Cloud & DevOps:** AWS Lambda, API Gateway, DynamoDB, SNS, EventBridge, LocalStack, Docker, AWS SAM CLI

---

## 🚀 Running Locally

### 1. Prerequisites
* Python 3.12 (`uv` or `venv`)
* Node.js 20+ & `pnpm`

### 2. Backend Setup
```bash
# Set up Python virtual environment
uv venv --python 3.12 backend/.venv
source backend/.venv/bin/activate
uv pip install -r backend/requirements.txt

# Run backend test suite (14/14 passing)
pytest backend/tests/ -v

# Start FastAPI server
uvicorn main:app --app-dir backend --reload --port 8000
```
Interactive API docs available at: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
cd frontend
pnpm install

# Run frontend test suite (39/39 passing across 9 test suites)
pnpm test

# Run code hygiene linter (0 errors, 0 warnings)
pnpm lint

# Start Vite dev server
pnpm dev --port 5173
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🐳 Running with Docker
```bash
docker compose up --build
```
* Backend API: `http://localhost:8000`
* Frontend App: `http://localhost:5173`

---

## ☁️ Deploying to AWS

### Deploy Backend via AWS SAM
```bash
sam build
sam deploy --guided
```

### Deploy Frontend via AWS Amplify
1. Connect this repository to the **AWS Amplify Console**.
2. Amplify will automatically detect [`amplify.yml`](amplify.yml), build the frontend, and deploy to AWS global edge CDN.

---

## 📜 License
MIT License. Created for the **WeMakeDevs & AWS Bharat Builds Tour 2026**.