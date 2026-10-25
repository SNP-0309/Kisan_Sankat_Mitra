import io
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "FasalRakshak ML Service"
    assert data["mock_mode"] is True


def test_health():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["mock_mode"] is True


def test_assess_crop_invalid_file_type():
    file_bytes = b"This is a text file, not an image"
    response = client.post(
        "/api/v1/assess",
        files={"file": ("test.txt", file_bytes, "text/plain")},
        data={"crop_type": "tomato"},
    )
    assert response.status_code == 415
    assert "Unsupported file type" in response.json()["detail"]


def test_assess_crop_valid_image():
    # Create an in-memory test image
    img = Image.new("RGB", (100, 100), color="red")
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format="JPEG")
    img_byte_arr.seek(0)

    response = client.post(
        "/api/v1/assess",
        files={"file": ("tomato.jpg", img_byte_arr.getvalue(), "image/jpeg")},
        data={"crop_type": "tomato"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_mock"] is True
    assert data["model_name"] == "MockInferenceAdapter"
    assert data["crop_type"] == "tomato"
    assert data["overall_health"] in ["healthy", "diseased"]
    assert 0.0 <= data["confidence"] <= 1.0
    assert isinstance(data["detections"], list)
    assert isinstance(data["recommendations"], list)
    assert len(data["recommendations"]) == 3
    assert data["processing_time_ms"] > 0
