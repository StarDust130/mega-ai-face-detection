import mediapipe as mp
import numpy as np

# 🧠 Initialize MediaPipe Face Detection properly
mp_face_detection = mp.solutions.face_detection
face_detection = mp_face_detection.FaceDetection(
    model_selection=0, min_detection_confidence=0.5)


def detect_face(image):
    """🕵️ Safely detect a single face in the image using MediaPipe"""
    try:
        # Convert PIL Image to numpy array (RGB) safely
        image_np = np.array(image)

        # Check if the array has invalid shape or data
        if image_np is None or image_np.size == 0:
            return None

        results = face_detection.process(image_np)

        if not getattr(results, "detections", None):
            return None

        # Assume 1 face as requested
        bboxC = results.detections[0].location_data.relative_bounding_box

        ih, iw, _ = image_np.shape

        x = int(bboxC.xmin * iw)
        y = int(bboxC.ymin * ih)
        w = int(bboxC.width * iw)
        h = int(bboxC.height * ih)

        # Ensure coordinates are safely within borders
        x, y = max(0, x), max(0, y)

        return (x, y, w, h)
    except Exception as e:
        print(f"Face detection error: {e}")
        return None
