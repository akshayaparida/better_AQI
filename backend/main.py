from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

app = FastAPI(title="better_AQI API", version="1.0.0")

# Allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"service": "better_AQI API", "status": "online"}


# Cloud health check
@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "better_AQI"}


# AWS Lambda adapter
handler = Mangum(app)
