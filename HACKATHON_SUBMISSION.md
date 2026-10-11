# 🍃 better_AQI — Hackathon Submission

> **Event:** Environmental Hacks (Event 02 — Bharat Builds Tour by WeMakeDevs & AWS)  
> **Track:** Track 01: Air (Pollution, Exposure & Hazardous Days)  
> **Team:** Individual / University Builders  
> **Repository:** [https://github.com/akshayaparida/better_AQI](https://github.com/akshayaparida/better_AQI)  
> **Video Demo (3-Minute Walkthrough):** *[YouTube Link]*  

---

## 📌 Executive Summary
In Indian metropolitan hubs like Delhi NCR, citizens and schools are inundated with a single, abstract Air Quality Index (AQI) number recorded at a distant monitoring tower often kilometers away. This metric fails to answer everyday life-or-death decisions:
- *"Which commute route exposes my lungs to the least toxic particulate matter?"*
- *"Should our school conduct outdoor morning assembly or cancel sports recess today?"*
- *"When will the winter stubble smoke inversion plume reach our neighborhood?"*
- *"How many minutes must we run our classroom HEPA purifier to reach medical-grade safe air?"*

**`better_AQI` is in the Air track and uses AWS Strands Agents, SAM CLI and LocalStack.** It is built for Lambda with SAM, and tested locally on LocalStack. It bridges the gap between raw environmental sensors, NASA satellite thermal telemetry, and actionable human safety protocols.

---

## 🎯 Track 01 (Air) — Official Rubric Mapping

`better_AQI` addresses all 5 core rubric tags under **Track 01: Air**:

| Rubric Tag | Problem Solved | Engineering Implementation & Scientific Model |
|---|---|---|
| **1. AQI** | Generic numbers lack multi-pollutant context and actionable severity. | Integrates real-time Open-Meteo multi-pollutant telemetry (PM2.5, PM10, NO₂, O₃, SO₂, CO) calibrated to **Indian Central Pollution Control Board (CPCB) NAAQS 6-tier breakpoints** (Good, Satisfactory, Moderate, Poor, Very Poor, Severe). Includes a regional circuit-breaker fallback for high reliability. |
| **2. Pollution Exposure** | Commuters breathe heavily along traffic corridors without knowing the cumulative toxic dosage. | **Cleanest Commute Engine:** Compares alternate GPS routes (e.g., *Ridge Green Belt* vs. *Arterial Highway*). Ingests transit modes (**Bicycle, Two-Wheeler, Car with AC Cabin Filter, Walking**) with mode-specific minute respiration rates ($L/\text{min}$) and vehicle filtration efficiencies to calculate exact inhaled PM2.5 ($\mu\text{g}$) and **cigarette equivalents** based on the Berkeley Earth standard ($22\,\mu\text{g} \text{ PM2.5} \approx 1 \text{ cigarette}$). |
| **3. Stubble Burning** | Seasonal post-monsoon farm fires trigger hazardous smog emergencies across North India. | **Active Farm Fire Tracking:** Visualizes active agricultural fire hotspots across Punjab & Haryana (NASA satellite thermal data from NASA FIRMS). Correlates fire clusters with real-time boundary-layer wind vectors (speed, direction, cardinal heading) to model downwind smoke transport and NCR contribution ($28\% - 36\%$). |
| **4. Indoor Air** | People run air purifiers blindly without knowing if their room is actually safe. | **Indoor Infiltration & CADR Countdown Calculator:** Models room volume ($m^3$) and building envelope air leakage (*airtight*, *standard*, *poor*). Calculates effective Air Changes per Hour (ACH) and computes a precise **minutes-to-clean countdown timer** to reach the WHO/CPCB safe baseline ($< 30\,\mu\text{g/m}^3$). |
| **5. School Safety on Bad Days** | School administrators lack clear operational guidance for assemblies and sports recess. | **School & Student Air Advisory Protocol:** Translates live chemical levels into 4 actionable operational directives: (1) Morning Assembly (Allowed / Caution / Suspended), (2) Outdoor Sports Recess (Normal / Restricted / Indoors), (3) Classroom Purifier Fan Speed (Standby / Medium / Turbo), and (4) **Optimal Mid-Day Ventilation Window** (identifying solar heating inversion break periods). |
| **6. Citizen Responsibility & Good AQI Maintenance** | Citizens feel powerless about air pollution and lack actionable community habits. | **Citizen Action & Clean Air Stewardship Dashboard:** Interactive daily civic pledge, habit checklist (zero-idling, zero open burning, moist dust control, energy conservation), personal commute shift savings calculator (estimating PM2.5 & CO₂ prevented), 5 community pillars, and direct municipal grievance reporting hotlines. |

---

## ☁️ Cloud Architecture & AWS Services Used

The application is architected from the ground up on **AWS Serverless Cloud Best Practices**:

```mermaid
flowchart TD
    subgraph Clients["Frontend Layer"]
        User["User Browser / Mobile"]
        Amplify["AWS Amplify Hosting<br/>(React 19 + Leaflet + Vite)"]
    end

    subgraph Ingestion["Serverless API Layer"]
        APIGW["Amazon API Gateway<br/>(HTTP API + CORS)"]
        Lambda["AWS Lambda Function<br/>(Python 3.12 + FastAPI + Mangum)"]
    end

    subgraph DataServices["AWS Storage & Notifications"]
        DynamoDB[("Amazon DynamoDB<br/>Subscriptions Registry")]
        SNS["Amazon SNS<br/>Spike Alert Topic"]
        EventBridge["AWS EventBridge<br/>Hourly Schedule Rule"]
    end

    subgraph ExternalFeeds["Telemetry Data Sources"]
        OpenMeteo["Open-Meteo Air Quality API"]
        NASA["NASA FIRMS Thermal Fire Clusters"]
    end

    User --> Amplify
    Amplify --> APIGW
    APIGW --> Lambda
    Lambda --> ExternalFeeds
    Lambda --> DynamoDB
    Lambda --> SNS
    EventBridge -.->|Hourly Trigger| Lambda
    SNS -->|SMS / Email| User
```

### Built for Lambda with SAM, Tested Locally on LocalStack
1. **AWS Lambda (`BetterAqiApiFunction`):**
   * Built for serverless execution using Python 3.12 and the `Mangum` ASGI adapter in `template.yaml`.
   * Scales instantly from 0 to thousands of requests with zero idle server cost on the AWS Free Tier.
2. **Amazon API Gateway (`BetterAqiHttpApi`):**
   * Low-latency HTTP API handling global CORS, TLS termination, and traffic routing defined in `template.yaml`.
3. **Amazon DynamoDB (`better_aqi_subscriptions`):**
   * Modeled in SAM, tested locally via LocalStack for subscriber preferences, GPS coordinates, and threshold persistence.
4. **Amazon SNS (`better_aqi_spike_alerts`):**
   * Modeled in SAM, tested locally via LocalStack for instant SMS and email spike alert fan-out.
5. **AWS EventBridge (`HourlyAirQualityCheckSchedule`):**
   * Scheduled event rule defined in `template.yaml` triggering Lambda once every hour to evaluate live telemetry against subscriber alert thresholds.
6. **AWS SAM CLI (`template.yaml`):**
   * Official **AWS Open Source Tool** (Apache 2.0 licensed, `aws/aws-sam-cli`).
   * Provides declarative Infrastructure as Code (IaC) enabling 1-command reproducible cloud deployments and local validation via `sam validate`.
7. **LocalStack Cloud Emulation (`docker-compose.localstack.yml`):**
   * Official open-source AWS emulator listed under Serverless tooling.
   * Enables local emulation of Amazon DynamoDB and Amazon SNS with zero cloud costs.
8. **AWS Strands Agents SDK (`backend/services/strands_agent_service.py`):**
   * Official AWS Open-Source AI Agent framework (`strands-agents`).
   * Powered by Amazon Bedrock; orchestrates multi-tool reasoning (`check_live_air_quality`, `evaluate_school_safety`, `calculate_commute_inhalation`) to produce synthesized health and route advisories.
9. **AWS Boto3 SDK (`backend/services/alert_service.py`):**
   * Official open-source AWS SDK for Python used for Amazon SNS alert dispatch and DynamoDB subscription persistence.

---

## 🧪 Product-Grade Testing & Quality Assurance

To meet the engineering standards of top product organizations, `better_AQI` includes automated testing across the entire stack:

* **Backend Test Suite (Pytest):** **14/14 Passing** (`test_api.py` covering healthcheck, telemetry ingestion, CPCB classification, smart commute route comparisons, stubble tracker, indoor CADR calculator, alert subscriptions, OWASP security headers, worldwide geocoding, and **AWS Strands Agent capabilities & consultation**).
* **Frontend Test Suite (Vitest + React Testing Library):** **39/39 Passing across 9 test suites** (`AiAirAdvisorCard.test.jsx`, `CommuteWidget.test.jsx`, `SchoolAdvisoryCard.test.jsx`, `IndoorPurifierCard.test.jsx`, `StubblePanel.test.jsx`, `AlertModal.test.jsx`, `CitizenResponsibilityCard.test.jsx`, `Navbar.test.jsx`, `GlobalCitySearch.test.jsx`).
* **Static Code Analysis (`oxlint`):** **0 errors, 0 warnings** across all 26 files.
* **Production Build (`vite build`):** Compiled in **651ms** with optimal bundle chunking.
* **Infrastructure as Code Validation (`sam validate --lint`):** Validated cleanly with zero errors.
* **CI/CD Automation (GitHub Actions):** Continuous Integration pipeline ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) automatically verifies tests, linting, and compilation on every git push.
* **End-to-End Browser Verification:** Fully verified using automated Chromium subagent across all tabs and modals; recorded session video preserved in project artifacts.

---

## 🎬 3-Minute Video Pitch & Presentation Script

This script is structured specifically for the YouTube demo video requirement (under 3 minutes):

| Timestamp | Visual Display | Spoken Script / Voiceover |
|---|---|---|
| **0:00 - 0:35** | Title slide, real-world Delhi smog footage / app header | *"Hello! Welcome to better_AQI. In Indian cities, checking the AQI usually gives you a single number from a station often kilometers away. But when you step outside, it doesn’t tell you which route protects your lungs, whether your child's school should cancel outdoor assembly, or how to operate your indoor purifier. We built better_AQI to turn complex chemical data into actionable human decisions."* |
| **0:35 - 1:15** | Live Demo: Map & Cleanest Commute Planner | *"Here is our interactive dashboard. In our Cleanest Commute Planner, we compare alternate routes with worldwide geocoding. You can select your transit mode—Bicycle, Two-Wheeler, Car with AC filter, or Walking. Taking the clean air corridor reduces toxic fine dust exposure (matching our live route savings percentage, e.g., 31%), sparing your lungs the equivalent of cigarettes based on the Berkeley Earth standard (~22 µg PM2.5 per cigarette), with one-click live turn-by-turn navigation in Google Maps."* |
| **1:15 - 1:55** | Live Demo: School Advisory, Stubble Fires, Purifier & Citizen Action | *"For schools, our advisory card automatically translates air levels into clear operational directives: brief assemblies, restricted sports, and optimal mid-day ventilation windows. We also track active stubble burning farm fires in Punjab and Haryana using NASA satellite thermal data with wind vectors, and model indoor air purifiers with countdown timers to clean air. In our AI tab, our AWS Strands Agent powered by Amazon Bedrock reasons across these live tools."* |
| **1:55 - 2:35** | SAM template on screen & LocalStack / Architecture | *"Behind the scenes, better_AQI is in the Air track and uses AWS Strands Agents, SAM CLI and LocalStack. It is built for Lambda with SAM, and tested locally on LocalStack. Here on screen is our SAM template—defining the FastAPI Lambda function with the Mangum ASGI adapter, DynamoDB subscription table, and SNS topic. We test our entire serverless pipeline locally with LocalStack with zero cloud bill."* |
| **2:35 - 3:00** | Code repo, test suite, and closing | *"Our codebase is 100% open-source with 14/14 backend pytest tests, 39/39 frontend Vitest tests across 9 test suites, and automated AWS SAM Infrastructure as Code. Thank you, WeMakeDevs and AWS, for Environmental Hacks 2026!"* |

---

## 🚀 How to Run Locally

### 1. Backend (Python 3.12)
```bash
# Clone the repository
git clone https://github.com/akshayaparida/better_AQI.git
cd better_AQI

# Set up virtual environment
uv venv --python 3.12 backend/.venv
source backend/.venv/bin/activate
uv pip install -r backend/requirements.txt

# Run tests
pytest backend/tests/ -v

# Start FastAPI dev server
uvicorn main:app --app-dir backend --port 8000
```

### 2. Frontend (React 19 + Vite)
```bash
cd frontend
pnpm install

# Run automated tests & linter
pnpm test
pnpm lint

# Start Vite dev server
pnpm dev --port 5173
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ☁️ Deploying to AWS

### Deploy Backend with AWS SAM
```bash
sam build
sam deploy --guided
```

### Deploy Frontend with AWS Amplify
1. Connect your GitHub repository (`better_AQI`) to **AWS Amplify Console**.
2. Amplify automatically reads [`amplify.yml`](amplify.yml) and deploys the production build to a global CDN.

---

## 📜 License
MIT License. Built for the **WeMakeDevs & AWS Bharat Builds Tour 2026**.
