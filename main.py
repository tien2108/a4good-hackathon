from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.pipeline import run_pipeline

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or specify ["https://yourfrontend.com"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze/")
async def analyze_pdf(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(400, "Only PDF files are accepted.")

    file_bytes = await file.read()

    if not file_bytes:
        raise HTTPException(400, "Uploaded file is empty.")

    try:
        result = run_pipeline(file_bytes)
    except Exception as e:
        raise HTTPException(500, f"Pipeline failed: {str(e)}")

    return result