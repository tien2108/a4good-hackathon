from openai import OpenAI
import os
import dotenv

dotenv.load_dotenv()

client = OpenAI(
    api_key=os.getenv("VERDA_API_KEY"),
    base_url=os.getenv("VERDA_BASE_EMBEDDINGS_URL")
)


def embed_text(text: str):
    response = client.embeddings.create(
        model="BAAI/bge-m3",
        input=text
    )
    return response.data[0].embedding