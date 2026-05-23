from extract_pdf import extract_pdf_text
from chunking import chunk_pages
from embeddings import embed_text
from vector_store import VectorStore
from retrieval import retrieve_chunks
from llm_extract import extract_fact
from classification_agent import classify_risk, validate_facts_for_classification
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

FIELDS = [
"purpose", "users", "affected persons", "sector", "input data", "outputs", "automation level", "human oversight", "deployment context", "use of AI-generated content", "use of GPAI", "possible impact on people"
]

pdf_path = os.path.join(BASE_DIR, "data/pdfs/Migration, Asylum, and Border Control Management Systems.pdf")

pages = extract_pdf_text(pdf_path)
chunks = chunk_pages(pages)

first_embedding = embed_text(chunks[0]["text"])
dim = len(first_embedding)

vector_store = VectorStore(dim)

for chunk in chunks:
    embedding = embed_text(chunk["text"])
    vector_store.add(embedding, chunk)

results = {}

for field in FIELDS:
    relevant_chunks = retrieve_chunks(vector_store, field)
    extraction = extract_fact(field, relevant_chunks)
    results[field] = extraction

# Validate before classifying
validation = validate_facts_for_classification(results)

print("=== Pre-classification Validation ===")
print(f"Can Classify             : {validation['can_classify']}")
print(f"Avg Extraction Confidence: {validation['avg_extraction_confidence']}")

if validation["missing_fields"]:
    print(f"Missing Fields           : {', '.join(validation['missing_fields'])}")

if validation["low_confidence_fields"]:
    print("Low Confidence Fields:")
    for f in validation["low_confidence_fields"]:
        print(f"  - {f['field']}: {f['confidence']} → '{f['value']}'")

if validation["steps_at_risk"]:
    print("Decision Steps at Risk:")
    for step, fields in validation["steps_at_risk"].items():
        print(f"  - {step} lacks evidence for: {', '.join(fields)}")

if not validation["can_classify"]:
    print("\nClassification aborted: insufficient evidence.")
else:
    if validation["warning"]:
        print(f"\n[WARN] {validation['warning']}")

    classification = classify_risk(results)
    certainty = classification["classification_certainty"]

    print("\n=== Risk Classification Result ===")
    print(classification)