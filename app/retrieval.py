from app.embeddings import embed_text


FACT_QUERIES = {
    "purpose": "What is the intended purpose of the AI system?",
    "users": "Who are the intended users of the AI system?",
    "affected persons": "Who are the people affected by the AI system?",
    "sector": "In which sector or industry is the AI system deployed?",
    "input data": "What input data does the AI system process?",
    "outputs": "What outputs or decisions does the AI system generate?",
    "automation level": "What is the level of automation in the AI system?",
    "human oversight": "What human oversight mechanisms exist for the AI system?",
    "deployment context": "In what context or environment is the AI system deployed?",
    "use of AI-generated content": "Does the system use or produce AI-generated content?",
    "use of GPAI": "Does the system use general-purpose AI models?",
    "possible impact on people": "What are the possible impacts of the AI system on people?"
}

def retrieve_chunks(vector_store, field_name, top_k=5):
    query = FACT_QUERIES[field_name]

    query_embedding = embed_text(query)

    return vector_store.search(query_embedding, top_k=top_k)