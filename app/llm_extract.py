from openai import OpenAI
import json
import re
import dotenv
import os

dotenv.load_dotenv()

client = OpenAI(
    base_url=os.getenv("VERDA_BASE_LLAMA_URL"),
    api_key=os.getenv("VERDA_API_KEY")
)

MODEL_NAME = "meta-llama/Llama-3.1-8B-Instruct"

SYSTEM_PROMPT = """You extract structured facts from AI system documents.

Rules:
- Extract only explicitly supported facts
- Do not infer unsupported claims
- Return valid JSON only, no markdown, no code fences, no explanation
- confidence is a float from 0.0 to 1.0 that YOU must assess:
    - 1.0 = the document explicitly and clearly states this fact
    - 0.7 = the fact is strongly implied or partially stated
    - 0.4 = the fact is vaguely mentioned or must be inferred
    - 0.0 = the fact is not mentioned at all in the document

Your response must be exactly this JSON structure and nothing else:
{"value": "...", "evidence": "...", "confidence": 0.0}"""


def _parse_json_response(text: str) -> dict:
    """Extract JSON from model output, handling common LLM formatting issues."""
    if not text or not text.strip():
        raise ValueError("Model returned empty response")

    # Strip markdown code fences if present
    text = re.sub(r"```(?:json)?\s*", "", text).strip()
    text = text.replace("```", "").strip()

    # Try direct parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Try to find a JSON object anywhere in the text
    match = re.search(r"\{.*?\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    # Fallback: return a structured error so pipeline continues
    print(f"[WARN] Could not parse JSON from response:\n{text[:300]}")
    return {
        "value": None,
        "evidence": None,
        "confidence": 0.0,
        "parse_error": text[:300]
    }


def extract_fact(field_name: str, chunks: list) -> dict:
    joined_text = "\n\n".join([
        f"[Page {c['page']}]\n{c['text']}"
        for c in chunks
    ])

    user_prompt = f"""Field to extract: {field_name}

Document text:
{joined_text}

Extract the field and assess your own confidence based on how explicitly the document supports it.
- If the document clearly states it: confidence close to 1.0
- If implied: around 0.7
- If vague: around 0.4  
- If not found: value should be null and confidence should be 0.0

Respond with only JSON, no other text:
{{"value": "...", "evidence": "...", "confidence": 0.7}}"""

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0,
        max_tokens=512
    )

    raw = response.choices[0].message.content
    return _parse_json_response(raw)