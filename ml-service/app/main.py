from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.routes import router

app = FastAPI(
    title="FasalRakshak AI — ML Quality Assessment Service",
    description="Crop disease detection and quality assessment API using YOLO inference (mock mode when no weights available).",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow backend service to call this
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")


@app.get("/", tags=["Root"])
async def root():
    return {
        "service": "FasalRakshak ML Service",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "mock_mode": settings.USE_MOCK_INFERENCE,
        "docs": "/docs",
    }
