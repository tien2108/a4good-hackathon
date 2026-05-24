import fitz
import tempfile, os
from docx import Document  # pip install python-docx

def extract_pdf_text(pdf_path: str):
    doc = fitz.open(pdf_path)

    pages = []

    for page_num, page in enumerate(doc):
        text = page.get_text()

        pages.append({
            "page": page_num + 1,
            "text": text
        })

    return pages

def extract_docx_text(path: str) -> list[dict]:
    doc = Document(path)
    return [
        {"page": i + 1, "text": p.text.strip()}
        for i, p in enumerate(doc.paragraphs)
        if p.text.strip()
    ]

def extract_file_text(file_bytes: bytes, filename: str) -> list[str]:
    suffix = ".pdf" if filename.endswith(".pdf") else ".docx"
    
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name  # ✅ this is the actual path, e.g. /tmp/tmpXXXXXX.pdf

    try:
        if suffix == ".pdf":
            return extract_pdf_text(tmp_path)   # ✅ pass tmp_path, NOT filename
        elif suffix == ".docx":
            return extract_docx_text(tmp_path)  # ✅ same here
    finally:
        os.unlink(tmp_path)