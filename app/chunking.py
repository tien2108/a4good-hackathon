from typing import List


MAX_CHARS = 4000
OVERLAP = 300


def chunk_pages(pages: List[dict]):
    chunks = []

    for page in pages:
        text = page["text"]

        start = 0

        while start < len(text):
            end = start + MAX_CHARS

            chunk_text = text[start:end]

            chunks.append({
                "page": page["page"],
                "text": chunk_text
            })

            start += MAX_CHARS - OVERLAP

    return chunks