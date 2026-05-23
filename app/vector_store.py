import faiss
import numpy as np


class VectorStore:
    def __init__(self, dim: int):
        self.index = faiss.IndexFlatIP(dim)
        self.chunks = []

    def add(self, embedding, chunk):
        embedding = np.array([embedding]).astype("float32")

        self.index.add(embedding)
        self.chunks.append(chunk)

    def search(self, embedding, top_k=5):
        embedding = np.array([embedding]).astype("float32")

        scores, indices = self.index.search(embedding, top_k)

        results = []

        for idx in indices[0]:
            results.append(self.chunks[idx])

        return results