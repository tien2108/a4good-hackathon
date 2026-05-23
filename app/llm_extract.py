from openai import OpenAI
import json
import dotenv
import os

dotenv.load_dotenv()

client = OpenAI(
    base_url=os.getenv("VERDA_BASE_LLAMA_URL"),
    api_key=os.getenv("VERDA_API_KEY")
)


MODEL_NAME = "meta-llama-3-1-8b"


SYSTEM_PROMPT = """
You extract structured facts from AI system documents.

Rules:
- Extract only explicitly supported facts
- Do not infer unsupported claims
- Return valid JSON only
- Include direct evidence quotes
"""



def extract_fact(field_name: str, chunks: list):
    joined_text = "\n\n".join([
        f"[Page {c['page']}]\n{c['text']}"
        for c in chunks
    ])

    user_prompt = f"""
Field to extract:
{field_name}

Document text:
{joined_text}

Return JSON:
{{
  "value": "...",
  "evidence": "...",
  "confidence": 0.0
}}
"""

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0
    )

    return json.loads(response.choices[0].message.content)

extract_fact("system_purpose", [
    {"page": 1, "text": "The AI system is designed to assist users in managing their schedules and setting reminders."},
    {"page": 2, "text": "Users can interact with the system through a mobile app or web interface."}
])