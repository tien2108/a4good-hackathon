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

FIELD_HINTS = {
    "outputs": (
        "What does the system produce per individual? Look for scores, indices, labels, rankings, decisions. "
        "Ignore business outcomes like 'faster response times' or 'improved revenue'."
    ),
    "possible impact on people": (
        "Look for differential treatment, denial of services, surveillance, scoring consequences. "
        "Ignore vendor benefit claims like 'increased trust' or 'improved efficiency'."
    ),
    "users": (
        "Who operates or deploys the system? (e.g. government agencies, municipalities, companies) "
        "Not who is affected by it."
    ),
    "scoring or ranking of individuals": (
        "Does the system assign scores, indices, ratings, or rankings to individual people? "
        "Look for terms like 'index', 'score', 'rating', 'reliability', 'risk level'."
    ),
    "differential treatment based on score": (
        "Does the system treat people differently based on their score? "
        "Look for priority queues, discounts, restrictions, tiered access, reduced verification."
    ),
    "risks or harms to affected persons": (
        "What negative effects could this system have on individuals? "
        "Look for denied access, profiling, surveillance, discrimination, loss of rights."
    ),
}

FIELDS = [
    "purpose", "users", "affected persons", "sector", "input data",
    "outputs",
    "automation level", "human oversight", "deployment context",
    "use of AI-generated content", "use of GPAI",
    "possible impact on people",
]

MODEL_NAME = "meta-llama/Llama-3.1-8B-Instruct"

SYSTEM_PROMPT = """You extract structured facts from AI system documents.

Rules:
- Extract only explicitly supported facts
- Do not infer unsupported claims
- Return valid JSON only, no markdown, no code fences, no explanation
- Use ONLY plain ASCII double quotes (") in JSON — never use curly/smart quotes like \u201c \u201d
- Do not report vendor marketing claims as facts — report what the system actually does
- confidence is a float from 0.0 to 1.0 that YOU must assess:
    - 1.0 = the document explicitly and clearly states this fact
    - 0.7 = the fact is strongly implied or partially stated
    - 0.4 = the fact is vaguely mentioned or must be inferred
    - 0.0 = the fact is not mentioned at all in the document

Your response must be exactly this JSON structure and nothing else:
{"value": "...", "evidence": "...", "confidence": 0.0}"""
def _parse_json_response(text: str) -> dict:
    if not text or not text.strip():
        raise ValueError("Model returned empty response")

    # ✅ Add this debug line temporarily
    print(f"[DEBUG] repr: {repr(text[:100])}")

    # Strip BOM and other invisible characters
    text = text.strip().lstrip("\ufeff").lstrip("\x00")
    
    # Strip markdown fences
    text = re.sub(r"```(?:json)?\s*", "", text).strip()
    text = text.replace("```", "").strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        print(f"[DEBUG] JSONDecodeError: {e}")  # ✅ tells you exact position
        pass

    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    print(f"[WARN] Could not parse JSON from response:\n{text[:300]}")
    return {"value": None, "evidence": None, "confidence": 0.0, "parse_error": text[:300]}




def extract_fact(field_name: str, chunks: list) -> dict:
    joined_text = "\n\n".join([
        f"[Page {c['page']}]\n{c['text']}"
        for c in chunks
    ])

    hint = FIELD_HINTS.get(field_name, "")
    hint_text = f"\nHint: {hint}\n" if hint else ""

    user_prompt = f"""Field to extract: {field_name}{hint_text}

Document text:
{joined_text}

Extract the field and assess your own confidence based on how explicitly the document supports it.
- If the document clearly states it: confidence close to 1.0
- If implied: around 0.7
- If vague: around 0.4
- If not found: value should be null and confidence should be 0.0

Important: For the "outputs" field, report what the system produces per individual (scores, decisions, labels),
not what business benefits the vendor claims.

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