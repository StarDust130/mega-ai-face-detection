import traceback
import logging
import json
import base64
import binascii
import asyncio

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.image import decode_base64_to_image, draw_bounding_box, encode_image_to_base64
from app.face import detect_face
from app.db import insert_roi

# 📝 Setup minimal logger with friendly format
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
console_handler = logging.StreamHandler()
console_handler.setFormatter(logging.Formatter(
    "%(asctime)s %(levelname)s: %(message)s"))
logger.addHandler(console_handler)

router = APIRouter()


def _is_base64_image(s: str) -> bool:
    if not isinstance(s, str) or not s.strip():
        return False
    try:
        b64 = s.split(",", 1)[1] if "," in s else s
        padding = (-len(b64)) % 4
        if padding:
            b64 += "=" * padding
        base64.b64decode(b64, validate=True)
        return True
    except (binascii.Error, IndexError, ValueError):
        return False


@router.websocket("/ws/video")
async def video_websocket(websocket: WebSocket):
    """WebSocket for real-time frames — robust per-frame processing with detailed logs."""
    await websocket.accept()
    logger.info("✅ Client connected to WebSocket: /ws/video 🌐🔌")

    try:
        while True:
            try:
                base64_frame = await websocket.receive_text()
            except WebSocketDisconnect:
                logger.info("❌ Client disconnected from /ws/video 🔌🚪")
                break
            except Exception:
                logger.error("❌ Error receiving frame:\n" +
                             traceback.format_exc())
                continue

            # Removed per-frame logging to eliminate latency bottlenecks
            if not _is_base64_image(base64_frame):
                try:
                    await websocket.send_text(json.dumps({"image": "", "roi": None}))
                except Exception:
                    logger.warning(
                        "⚠️ Failed to send skip response:\n" + traceback.format_exc())
                continue

            processed_base64 = ""
            response_roi = None
            try:
                try:
                    image = decode_base64_to_image(base64_frame)
                except Exception:
                    logger.error("❌ Failed to decode image:\n" +
                                 traceback.format_exc())
                    processed_base64 = base64_frame
                    response_roi = None
                    try:
                        await websocket.send_text(json.dumps({"image": processed_base64, "roi": response_roi}))
                        logger.info(
                            "⬅️ Sent original frame after decode failure")
                    except Exception:
                        logger.warning(
                            "⚠️ Failed to send after decode failure:\n" + traceback.format_exc())
                    continue

                try:
                    roi = detect_face(image)
                except Exception:
                    logger.error("❌ Face detection error:\n" +
                                 traceback.format_exc())
                    roi = None

                if roi:
                    x, y, w, h = roi
                    try:
                        image = draw_bounding_box(image, roi)
                    except Exception:
                        logger.error("❌ Failed to draw bbox:\n" +
                                     traceback.format_exc())
                    try:
                        # Background the DB insert so it doesn't block the video stream!
                        asyncio.create_task(insert_roi(x, y, w, h))
                    except Exception:
                        logger.error("❌ DB insert error:\n" +
                                     traceback.format_exc())
                    response_roi = {"x": x, "y": y, "w": w, "h": h}

                try:
                    processed_base64 = encode_image_to_base64(image)
                except Exception:
                    logger.error("❌ Failed to encode image:\n" +
                                 traceback.format_exc())
                    processed_base64 = base64_frame

            except Exception:
                logger.error("❌ Unexpected processing error:\n" +
                             traceback.format_exc())
                processed_base64 = base64_frame
                response_roi = None

            try:
                payload = {"image": processed_base64, "roi": response_roi}
                await websocket.send_text(json.dumps(payload))
            except WebSocketDisconnect:
                logger.info("❌ Client disconnected during send")
                break
            except Exception:
                logger.warning(
                    "⚠️ Failed to send response (connection may be closing):\n" + traceback.format_exc())

    except Exception:
        logger.error("💀 WebSocket fatal error:\n" + traceback.format_exc())
