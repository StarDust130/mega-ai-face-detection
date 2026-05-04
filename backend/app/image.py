import base64
import io
from PIL import Image, ImageDraw


def decode_base64_to_image(base64_str: str) -> Image.Image:
    """🖼️ Safely decode base64 string to PIL Image"""
    if "," in base64_str:
        base64_str = base64_str.split(",")[1]

    # Pad base64 string if necessary
    missing_padding = len(base64_str) % 4
    if missing_padding:
        base64_str += '=' * (4 - missing_padding)

    image_data = base64.b64decode(base64_str)
    return Image.open(io.BytesIO(image_data)).convert("RGB")


def draw_bounding_box(image: Image.Image, roi: tuple) -> Image.Image:
    """🖍️ Draw bounding box on the image"""
    x, y, w, h = roi
    draw = ImageDraw.Draw(image)
    draw.rectangle([x, y, x + w, y + h], outline="#3b82f6", width=4)
    return image


def encode_image_to_base64(image: Image.Image) -> str:
    """🚀 Encode PIL Image back to base64 string"""
    buffered = io.BytesIO()
    image.save(buffered, format="JPEG", quality=75)
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return f"data:image/jpeg;base64,{img_str}"
