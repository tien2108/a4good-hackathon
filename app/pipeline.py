from extract_pdf import extract_pdf_text
from chunking import chunk_pages
from embeddings import embed_text
from vector_store import VectorStore
from retrieval import retrieve_chunks
from llm_extract import extract_fact
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

FIELDS = [
    "system_purpose",
    "users",
    "input_data",
    "outputs",
    "automation"
]

pdf_path = os.path.join(BASE_DIR, "data/pdfs/example.pdf")


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


print(results)