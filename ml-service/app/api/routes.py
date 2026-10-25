import time
from fastapi import APIRouter, File, UploadFile, HTTPException, Header
from typing import Optional

from app.config import settings
from app.schemas.models import QualityAssessmentResponse, HealthResponse
from app.inference.mock_adapter import MockInferenceAdapter

router = APIRouter()
adapter = MockInferenceAdapter()

ALLOWED_TYPES = settings.ALLOWED_IMAGE_TYPES.split(",")
MAX_BYTES = settings.MAX_IMAGE_SIZE_MB * 1024 * 1024


@router.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    return HealthResponse(
        status="ok",
        environment=settings.ENVIRONMENT,
        mock_mode=settings.USE_MOCK_INFERENCE,
    )


@router.post("/assess", response_model=QualityAssessmentResponse, tags=["Inference"])
async def assess_crop(
    file: UploadFile = File(...),
    crop_type: Optional[str] = "tomato",
    x_api_key: Optional[str] = Header(None),
):
    # API key check (skip in dev/mock mode)
    if settings.ENVIRONMENT != "development":
        if x_api_key != settings.SERVICE_API_KEY:
            raise HTTPException(status_code=401, detail="Invalid API key")

    # Validate content type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{file.content_type}'. Allowed: {ALLOWED_TYPES}",
        )

    # Read and validate size
    image_bytes = await file.read()
    if len(image_bytes) > MAX_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"Image too large. Max size: {settings.MAX_IMAGE_SIZE_MB}MB",
        )

    return adapter.predict(image_bytes, crop_type=crop_type)
