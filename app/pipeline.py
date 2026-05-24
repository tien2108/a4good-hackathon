from app.extract_file import extract_file_text
from app.chunking import chunk_pages
from app.embeddings import embed_text
from app.vector_store import VectorStore
from app.retrieval import retrieve_chunks
from app.llm_extract import extract_fact, FIELDS
from app.classification_agent import classify_risk, is_ai_related, validate_facts_for_classification

def run_pipeline(file_data: list[tuple[bytes, str]]) -> dict:
    
        all_pages = []

        for file_bytes, filename in file_data:
            pages = extract_file_text(file_bytes, filename)
            all_pages.extend(pages)   # merge all pages into one flat list

        # Step 3: Chunk
        chunks = chunk_pages(all_pages)
        if not chunks:
            return {"error": "No content could be extracted from the files."}

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
            
        # Step 5.5: Check if document is AI-related
        if not is_ai_related(results):
            return {
                "status": "rejected",
                "reason": "Document does not appear to describe an AI system.",
                "extracted_fields": results,
            }
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
