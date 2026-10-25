from pydantic import BaseModel
from typing import Optional, List


class DiseaseDetection(BaseModel):
    disease_name: str
    confidence: float
    severity: str  # "low" | "medium" | "high"
    bounding_box: Optional[List[float]] = None


class QualityAssessmentResponse(BaseModel):
    is_mock: bool
    model_name: str
    crop_type: Optional[str]
    overall_health: str  # "healthy" | "diseased" | "unknown"
    confidence: float
    detections: List[DiseaseDetection]
    recommendations: List[str]
    processing_time_ms: float


class HealthResponse(BaseModel):
    status: str
    environment: str
    mock_mode: bool
    version: str = "1.0.0"
