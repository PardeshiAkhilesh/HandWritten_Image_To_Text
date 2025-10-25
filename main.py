from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
# Import the utility functions
from ocr_utils import extract_text
from medicine_utils import find_best_medicine_match

app = FastAPI(title="Prescription OCR + Medicine Matching")

# Configure CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (for development)
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/")
def home():
    """Simple status check endpoint."""
    return {"message": "Doctor Prescription OCR API is running"}


@app.post("/analyze-prescription")
async def analyze_prescription(file: UploadFile = File(...)):
    """
    Accepts an image file, extracts text via OCR, and matches text to the medicine database.
    """
    try:
        # Read the uploaded file bytes
        file_bytes = await file.read()

        # Check if file_bytes is empty
        if not file_bytes:
            raise ValueError("Uploaded file is empty.")

        # 1. Extract text using the OCR utility
        extracted_text = extract_text(file_bytes)

        # 2. Find medicine matches using the fuzzy matching utility
        matches = find_best_medicine_match(extracted_text)

        # 3. Return the results
        return {
            "extracted_text": extracted_text,
            "matches": matches
        }

    except ValueError as ve:
        # Handle specific validation errors
        raise HTTPException(status_code=400, detail=f"Bad Request: {str(ve)}")

    except Exception as e:
        # Handle general errors (e.g., the OpenCV dimension error, model loading error)
        print(f"An error occurred during prescription analysis: {e}")
        # Return a 500 status with the error detail
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")