import cv2
import numpy as np
from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def encoded_image() -> bytes:
    success, buffer = cv2.imencode(".png", np.zeros((12, 20, 3), dtype=np.uint8))
    assert success
    return buffer.tobytes()


def test_health_reports_opencv() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["opencv_version"] == cv2.__version__


def test_inspect_image_returns_dimensions_and_digest() -> None:
    image = encoded_image()
    response = client.post(
        "/api/v1/images/inspect",
        files={"image": ("page.png", image, "image/png")},
    )
    assert response.status_code == 200
    assert response.json()["width"] == 20
    assert response.json()["height"] == 12
    assert response.json()["channels"] == 3
    assert response.json()["byte_length"] == len(image)
    assert len(response.json()["sha256"]) == 64


def test_inspect_image_rejects_non_image_upload() -> None:
    response = client.post(
        "/api/v1/images/inspect",
        files={"image": ("page.txt", b"not an image", "text/plain")},
    )
    assert response.status_code == 422


def test_inspect_image_rejects_oversized_upload(monkeypatch) -> None:
    from backend import main

    monkeypatch.setattr(main, "MAX_UPLOAD_BYTES", 4)
    response = client.post(
        "/api/v1/images/inspect",
        files={"image": ("large.png", b"12345", "image/png")},
    )
    assert response.status_code == 413
