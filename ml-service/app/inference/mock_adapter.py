import random
import time
from app.schemas.models import QualityAssessmentResponse, DiseaseDetection

MOCK_DISEASES = [
    DiseaseDetection(
        disease_name="Early Blight",
        confidence=0.87,
        severity="medium",
    ),
    DiseaseDetection(
        disease_name="Late Blight",
        confidence=0.92,
        severity="high",
    ),
    DiseaseDetection(
        disease_name="Leaf Mold",
        confidence=0.75,
        severity="low",
    ),
]

MOCK_RECOMMENDATIONS = [
    "Apply copper-based fungicide every 7-10 days",
    "Ensure proper spacing between plants for airflow",
    "Remove and destroy infected leaves immediately",
    "Avoid overhead irrigation to reduce humidity",
    "Monitor plants daily for new symptoms",
]


class MockInferenceAdapter:
    """
    Returns realistic-looking mock responses when no YOLO model is available.
    All responses are clearly labelled with is_mock=True.
    """

    def predict(self, image_bytes: bytes, crop_type: str = "tomato") -> QualityAssessmentResponse:
        start = time.time()

        # Simulate processing delay
        time.sleep(random.uniform(0.05, 0.15))

        num_detections = random.randint(0, 2)
        detections = random.sample(MOCK_DISEASES, k=min(num_detections, len(MOCK_DISEASES)))
        overall_health = "healthy" if not detections else "diseased"
        confidence = random.uniform(0.70, 0.95)

        elapsed_ms = (time.time() - start) * 1000

        return QualityAssessmentResponse(
            is_mock=True,
            model_name="MockInferenceAdapter",
            crop_type=crop_type,
            overall_health=overall_health,
            confidence=round(confidence, 3),
            detections=detections,
            recommendations=random.sample(MOCK_RECOMMENDATIONS, k=3),
            processing_time_ms=round(elapsed_ms, 2),
        )
