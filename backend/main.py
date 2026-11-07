import hashlib
import os
from pathlib import Path

import cv2
import numpy as np
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

MAX_UPLOAD_BYTES = int(os.getenv("KAGEFLOW_MAX_UPLOAD_BYTES", "20971520"))
MAX_IMAGE_PIXELS = int(os.getenv("KAGEFLOW_MAX_IMAGE_PIXELS", "80000000"))
if MAX_UPLOAD_BYTES < 1 or MAX_IMAGE_PIXELS < 1:
    raise ValueError("Image size limits must be positive integers.")

app = FastAPI(
    title="KageFlow AI API",
    description="Local image inspection services for the KageFlow creator app.",
    version="0.1.0",
)

allowed_origins = [
    origin.strip()
    for origin in os.getenv("KAGEFLOW_CORS_ORIGINS", "").split(",")
    if origin.strip()
]
if allowed_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "opencv_version": cv2.__version__}


@app.post("/api/v1/images/inspect")
async def inspect_image(image: UploadFile = File(...)) -> dict[str, object]:
    chunks: list[bytes] = []
    byte_count = 0
    try:
        while chunk := await image.read(1024 * 1024):
            byte_count += len(chunk)
            if byte_count > MAX_UPLOAD_BYTES:
                raise HTTPException(
                    status_code=413,
                    detail=f"Image exceeds the {MAX_UPLOAD_BYTES}-byte upload limit.",
                )
            chunks.append(chunk)
    finally:
        await image.close()

    if byte_count == 0:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    image_bytes = b"".join(chunks)
    encoded = np.frombuffer(image_bytes, dtype=np.uint8)
    try:
        decoded = cv2.imdecode(encoded, cv2.IMREAD_UNCHANGED)
    except cv2.error as error:
        raise HTTPException(status_code=422, detail="The uploaded file is not a readable image.") from error

    if decoded is None:
        raise HTTPException(status_code=422, detail="The uploaded file is not a readable image.")

    height, width = decoded.shape[:2]
    if width * height > MAX_IMAGE_PIXELS:
        raise HTTPException(
            status_code=413,
            detail=f"Image exceeds the {MAX_IMAGE_PIXELS}-pixel processing limit.",
        )

    return {
        "width": width,
        "height": height,
        "channels": 1 if decoded.ndim == 2 else decoded.shape[2],
        "byte_length": byte_count,
        "sha256": hashlib.sha256(image_bytes).hexdigest(),
    }
