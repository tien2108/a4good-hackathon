from app.extract_pdf import extract_pdf_text
from app.chunking import chunk_pages
from app.embeddings import embed_text
from app.vector_store import VectorStore
from app.retrieval import retrieve_chunks
from app.llm_extract import extract_fact
from app.classification_agent import classify_risk, validate_facts_for_classification
import tempfile
import os

FIELDS = [
    "purpose", "users", "affected persons", "sector", "input data",
    "outputs", "automation level", "human oversight", "deployment context",
    "use of AI-generated content", "use of GPAI", "possible impact on people"
]

def run_pipeline(file_bytes: bytes) -> dict:
    # Step 1: Save bytes to a temp file (extract_pdf_text expects a path)
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    try:
        # Step 2: Extract
        pages = extract_pdf_text(tmp_path)

        # Step 3: Chunk
        chunks = chunk_pages(pages)
        if not chunks:
            return {"error": "No content could be extracted from the PDF."}

        # Step 4: Embed + build vector store
        first_embedding = embed_text(chunks[0]["text"])
        dim = len(first_embedding)
        vector_store = VectorStore(dim)

        for chunk in chunks:
            embedding = embed_text(chunk["text"])
            vector_store.add(embedding, chunk)

        # Step 5: Retrieve + extract fields
        results = {}
        for field in FIELDS:
            relevant_chunks = retrieve_chunks(vector_store, field)
            results[field] = extract_fact(field, relevant_chunks)

        # Step 6: Validate
        validation = validate_facts_for_classification(results)

        if not validation["can_classify"]:
            return {
                "status": "aborted",
                "reason": "Insufficient evidence for classification.",
                "validation": validation,
                "extracted_fields": results,
            }

        # Step 7: Classify
        classification = classify_risk(results)

        return {
            "status": "success",
            "validation": validation,
            "extracted_fields": results,
            "classification": classification,
        }

    finally:
        os.remove(tmp_path)  # always clean up temp file