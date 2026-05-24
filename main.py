from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.pipeline import run_pipeline
from typing import List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or specify ["https://yourfrontend.com"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".pptx"}

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/octet-stream",  # curl fallback
}

@app.post("/analyze/")
async def analyze_pdf(files: List[UploadFile] = File(...)):
    if not files:
        raise HTTPException(400, "No files uploaded.")

    file_data = []
    for file in files:
        if not any(file.filename.lower().endswith(ext) for ext in ALLOWED_EXTENSIONS):
            raise HTTPException(400, f"Unsupported file type for '{file.filename}'. Only PDF, DOCX, and PPTX accepted.")
        if file.content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(400, f"Unsupported type for '{file.filename}'. Only PDF and DOCX accepted.")

        file_bytes = await file.read()
        if not file_bytes:
            raise HTTPException(400, f"File '{file.filename}' is empty.")

        file_data.append((file_bytes, file.filename))

    try:
        result = run_pipeline(file_data)
        return result
    except Exception as e:
        raise HTTPException(500, f"Pipeline error: {str(e)}")