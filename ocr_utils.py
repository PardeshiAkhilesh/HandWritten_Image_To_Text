import io
# NOTE: We only import PIL and the necessary transformer libraries.
from PIL import Image, ImageFilter, ImageOps
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
import torch
import numpy as np  # Keep numpy import only if needed for internal dependencies

# Load model & processor once
processor = TrOCRProcessor.from_pretrained("microsoft/trocr-base-handwritten")
model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-base-handwritten")


def preprocess_image(file_bytes):
    """
    Minimalist preprocessing using only PIL methods to bypass all array/dimension conflicts.
    """

    # 1. Decode image bytes into a PIL Image object
    try:
        # Open the image from the bytes, convert to Grayscale (L mode) immediately
        image = Image.open(io.BytesIO(file_bytes)).convert("L")
    except Exception as e:
        # This will correctly catch the PDF error
        raise ValueError(f"Could not open image file. Reason: {str(e)}")

    # 2. Simple Thresholding/Binarization (Approximation of Otsu's)
    # This binarization (converting to pure black/white) is crucial for OCR.
    # We use Image.eval with a simple threshold based on the image mean.

    # Convert to NumPy temporarily to calculate the threshold mean
    img_np = np.array(image)
    thresh_value = np.mean(img_np)

    # Use Image.eval to apply the threshold to the PIL image
    image = image.point(lambda x: 0 if x < thresh_value else 255)

    # 3. Resize (Optional, but recommended for TrOCR)
    new_width = int(image.width * 1.5)
    new_height = int(image.height * 1.5)

    # Use Image.Resampling.LANCZOS for high quality resizing
    image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)

    # The image is now a PIL Grayscale object, ready for the TrOCR processor.
    return image


def extract_text(file_bytes):
    """Extract text from image using TrOCR"""
    image = preprocess_image(file_bytes)

    # The TrOCR processor is designed to take a PIL image directly,
    # which avoids the problematic manual array conversions.
    pixel_values = processor(images=image, return_tensors="pt").pixel_values

    with torch.no_grad():
        generated_ids = model.generate(pixel_values)

    generated_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]

    return generated_text.strip()