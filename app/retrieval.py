from embeddings import embed_text


FACT_QUERIES = {
    "system_purpose": "What is the intended purpose of the AI system?",
    "users": "Who uses the AI system?",
    "input_data": "What data does the AI system process?",
    "outputs": "What outputs or decisions does the AI system generate?",
    "automation": "What tasks or decisions are automated?"
}



def retrieve_chunks(vector_store, field_name, top_k=5):
    query = FACT_QUERIES[field_name]

    query_embedding = embed_text(query)

    return vector_store.search(query_embedding, top_k=top_k)