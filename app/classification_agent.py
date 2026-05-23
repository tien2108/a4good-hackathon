# classification_agent.py

from openai import OpenAI
from app.risk_classifier import DECISION_TREE, RISK_OUTCOMES
import json
import re
import os
import dotenv

dotenv.load_dotenv()

client = OpenAI(
    base_url=os.getenv("VERDA_BASE_LLAMA_URL"),
    api_key=os.getenv("VERDA_API_KEY")
)

MODEL_NAME = "meta-llama/Llama-3.1-8B-Instruct"

REQUIRED_FIELDS_FOR_CLASSIFICATION = {
    "step_1": ["sector", "deployment context"],
    "step_2": ["users", "affected persons"],
    "step_2a": ["purpose", "sector", "outputs"],
    "step_3": ["purpose", "sector", "outputs"],
    "step_4": ["purpose", "sector", "outputs", "users"],
    "step_5": ["deployment context", "sector"],
    "step_5a": ["users"],
    "step_5b": ["users"],
    "step_5c": ["users"],
    "step_5d": ["users"],
    "step_5e": ["users"],
    "step_6": ["outputs", "use of AI-generated content"],
    "step_7": ["use of GPAI"],
    "step_8": ["use of GPAI"],
}

ARTICLE_CONTEXT = {
    "step_1": """
Article 2 — Scope:
The AI Act applies to:
- Providers placing AI systems on the EU market
- Deployers of AI systems located in the EU
- Providers/deployers outside the EU when output is used in the EU
- Importers and distributors of AI systems
Exceptions (out of scope): AI for military, national security, personal non-professional use, pure R&D.
""",
    "step_2": """
Article 25.1 — Change of role (deployer becomes provider):
A deployer is considered a provider when they:
- Place the AI system under their own name or trademark
- Make a substantial modification to a high-risk AI system
- Change the intended purpose of a system to make it high-risk
""",
    "step_2a": """
Article 5 — Prohibited AI Practices:
The following AI systems are prohibited:
- Subliminal, manipulative, or deceptive techniques that distort behavior
- Exploitation of vulnerabilities of specific groups (age, disability, social situation)
- Biometric categorisation inferring sensitive attributes (race, political opinions, religion, etc.)
- Real-time remote biometric identification in public spaces for law enforcement
- Social scoring by public authorities
- AI that assesses risk of criminal offence based on profiling
- Emotion recognition in workplace or educational institutions
- Untargeted scraping of facial images from internet/CCTV
""",
    "step_3": """
Article 5 — Prohibited AI Practices:
The following AI systems are prohibited:
- Subliminal, manipulative, or deceptive techniques that distort behavior
- Exploitation of vulnerabilities of specific groups (age, disability, social situation)
- Biometric categorisation inferring sensitive attributes (race, political opinions, religion, etc.)
- Real-time remote biometric identification in public spaces for law enforcement
- Social scoring by public authorities
- AI that assesses risk of criminal offence based on profiling
- Emotion recognition in workplace or educational institutions
- Untargeted scraping of facial images from internet/CCTV
""",
    "step_4": """
Article 6.1 — High-Risk AI Systems (Annex III categories):
A system is high-risk if used in:
1. Biometric identification and categorisation
2. Management of critical infrastructure (water, gas, electricity, transport)
3. Education and vocational training (access, assessment)
4. Employment and workers management (recruitment, task allocation, monitoring)
5. Access to essential private/public services (credit scoring, insurance, social benefits)
6. Law enforcement (risk assessment, polygraphs, evidence evaluation)
7. Migration, asylum, border control
8. Administration of justice and democratic processes
""",
    "step_5": """
Article 6.3 — Exemption from High-Risk Classification:
A system is NOT high-risk if:
- It does not pose significant risk of harm to health, safety, or fundamental rights
- It only performs a narrow procedural task
- It improves the result of a previously completed human activity
- It detects patterns/anomalies and is not used to make decisions about people
""",
    "step_5a": """
Article 16-22, Article 72, Article 99.4a/b — Provider/Provider's Representative obligations:
A user is a provider or provider's representative if they:
- Developed or placed the AI system on the market under their name
- Are the authorised representative of a non-EU provider
""",
    "step_5b": """
Article 23, Article 99.4c — Importer obligations:
A user is an importer if they:
- Are established in the EU and place a third-country provider's AI system on the EU market
""",
    "step_5c": """
Article 24, Article 99.4d — Distributor obligations:
A user is a distributor if they:
- Make an AI system available on the EU market without being the provider or importer
""",
    "step_5d": """
Article 26, Article 99.4e — Deployer obligations:
A user is a deployer if they:
- Use an AI system under their authority in a professional context
- Are not the provider, importer, or distributor of the system
""",
    "step_5e": """
Article 27 — Public body or company providing public services:
This applies if the deployer is:
- A public authority or body
- A private company mandated to provide public services (utilities, transport, healthcare)
""",
    "step_6": """
Article 50 — Transparency obligations:
A system falls under Article 50 if it is:
- A chatbot or conversational AI interacting with humans
- A system generating synthetic audio, image, video, or text (deepfakes)
- An emotion recognition system
- A biometric categorisation system
These systems must disclose their AI nature to users. Fine details in Article 99.4g.
""",
    "step_7": """
Article 51 — GPAI Model Classification:
A model is GPAI (General Purpose AI) if it:
- Is trained on broad data at scale
- Can perform a wide range of distinct tasks
- Is made available to third parties via API, open source, or product integration
""",
    "step_8": """
Article 51 — GPAI Systemic Risk:
A GPAI model has systemic risk if it:
- Has high-impact capabilities posing serious risk to health, safety, or fundamental rights
- Has cumulative training compute above 10^25 FLOPs
If systemic risk is present, additional obligations in Article 54 apply.
"""
}

CLASSIFIER_SYSTEM_PROMPT = """You are a legal compliance analyst evaluating an AI system against the EU AI Act.

You will be given:
1. The relevant law article text
2. Facts extracted from a document describing an AI system
3. A yes/no question based on that article

Your task:
- Answer yes or no based strictly on the facts and the article text provided
- Do not use any external knowledge about the AI Act
- Cite the specific part of the article that supports your answer
- Rate your confidence based on how clearly the facts match the article criteria:
    - 1.0 = facts explicitly match or not the article criteria
    - 0.7 = facts strongly imply a match or opposition but are not fully explicit
    - 0.4 = facts are vague or partially match the article criteria
    - 0.1 = facts are insufficient to determine, guessing

Return only JSON, no markdown, no explanation:
{"answer": "yes", "confidence": 0.7, "justification": "Based on Article X: ..."}"""


def _parse_decision_response(text: str) -> dict:
    if not text or not text.strip():
        return {"answer": "no", "confidence": 0.1, "justification": "No response from model."}

    text = re.sub(r"```(?:json)?\s*", "", text).strip().replace("```", "")

    try:
        parsed = json.loads(text)
        answer = "yes" if "yes" in str(parsed.get("answer", "")).lower() else "no"
        confidence = float(parsed.get("confidence", 0.1))
        confidence = max(0.0, min(1.0, confidence))
        justification = parsed.get("justification", "No justification provided.")
        return {"answer": answer, "confidence": confidence, "justification": justification}
    except (json.JSONDecodeError, ValueError):
        pass

    # Fallback
    answer = "yes" if "yes" in text.lower() else "no"
    match = re.search(r"0\.\d+", text)
    confidence = float(match.group()) if match else 0.1
    return {"answer": answer, "confidence": confidence, "justification": text[:200]}


def ask_decision(question: str, facts: dict, step: str) -> dict:
    facts_text = "\n".join([
        f"- {k}: {v.get('value', 'unknown')} (confidence: {v.get('confidence', 0.0):.1f})"
        for k, v in facts.items()
        if v.get("confidence", 0) >= 0.4
    ])

    low_confidence_facts = "\n".join([
        f"- {k}: uncertain or not found"
        for k, v in facts.items()
        if v.get("confidence", 0) < 0.4
    ])

    article_text = ARTICLE_CONTEXT.get(step, "No specific article context available.")

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": CLASSIFIER_SYSTEM_PROMPT},
            {"role": "user", "content": f"""Relevant law:
{article_text}

Facts about the AI system:
{facts_text}

Low confidence or missing fa cts (treat as unknown):
{low_confidence_facts}

Question: {question}

Return only JSON: {{"answer": "yes", "confidence": 0.7, "justification": "Based on Article X: ..."}}"""}
        ],
        temperature=0,
        max_tokens=150
    )

    raw = response.choices[0].message.content
    return _parse_decision_response(raw)


CONFIDENCE_THRESHOLDS = {
    "high":   0.7,
    "medium": 0.4,
}


def _confidence_label(score: float) -> str:
    if score >= CONFIDENCE_THRESHOLDS["high"]:
        return "HIGH"
    elif score >= CONFIDENCE_THRESHOLDS["medium"]:
        return "MEDIUM"
    else:
        return "LOW"


def _compute_classification_certainty(reasoning_trace: list) -> dict:
    if not reasoning_trace:
        return {"score": 0.0, "label": "VERY LOW", "explanation": "No decisions were made."}

    scores = [step["confidence"] for step in reasoning_trace]
    n = len(scores)

    avg_confidence = sum(scores) / n
    chain_penalty = min(0.15, (n - 1) * 0.02)
    near_guess_steps = [s for s in scores if s < 0.5]
    near_guess_penalty = len(near_guess_steps) * 0.1

    certainty = round(max(0.0, min(1.0, avg_confidence - chain_penalty - near_guess_penalty)), 2)

    if certainty >= 0.75:
        label = "HIGH"
        explanation = "Classification is well-supported by the document."
    elif certainty >= 0.5:
        label = "MEDIUM"
        explanation = "Classification is plausible but some steps had limited evidence."
    elif certainty >= 0.25:
        label = "LOW"
        explanation = "Classification is uncertain. Key decision steps lacked clear evidence."
    else:
        label = "VERY LOW"
        explanation = "Classification should not be trusted. Too many steps were near-guesses."

    weak_steps = [step for step in reasoning_trace if step["confidence"] < 0.5]

    return {
        "score": certainty,
        "label": label,
        "explanation": explanation,
        "penalities_applied": {
            "chain_length": round(chain_penalty, 2),
            "near_guess": round(near_guess_penalty, 2)
        },
        "weak_steps": [
            {
                "step": s["step"],
                "question": s["question"],
                "answer": s["answer"],
                "confidence": s["confidence"],
                "justification": s.get("justification", "")
            }
            for s in weak_steps
        ]
    }


def classify_risk(facts: dict) -> dict:
    current_step = "step_1"
    reasoning_trace = []
    confidence_scores = []

    while current_step in DECISION_TREE:
        node = DECISION_TREE[current_step]
        question = node["question"]

        decision = ask_decision(question, facts, step=current_step)
        answer = decision["answer"]
        confidence = decision["confidence"]
        confidence_scores.append(confidence)

        reasoning_trace.append({
            "step": current_step,
            "question": question,
            "answer": answer,
            "confidence": confidence,
            "confidence_label": _confidence_label(confidence),
            "justification": decision["justification"]
        })

        current_step = node[answer]

    outcome = RISK_OUTCOMES.get(current_step, {
        "level": "UNKNOWN",
        "articles": [],
        "description": "Could not determine risk level."
    })

    overall_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0.0
    weakest_confidence = min(confidence_scores) if confidence_scores else 0.0
    certainty = _compute_classification_certainty(reasoning_trace)

    return {
        "risk_level": outcome["level"],
        "articles": outcome["articles"],
        "description": outcome["description"],
        "overall_confidence": round(overall_confidence, 2),
        "weakest_link_confidence": round(weakest_confidence, 2),
        "overall_confidence_label": _confidence_label(overall_confidence),
        "classification_certainty": certainty,
        "needs_human_review": certainty["score"] < 0.5 or weakest_confidence < 0.4,
        "reasoning_trace": reasoning_trace,
    }


def validate_facts_for_classification(facts: dict) -> dict:
    missing_fields = [
        field for field in [
            "purpose", "users", "affected persons", "sector", "input data", "outputs",
            "automation level", "human oversight", "deployment context",
            "use of AI-generated content", "use of GPAI", "possible impact on people"
        ]
        if field not in facts
    ]

    low_confidence_fields = [
        {"field": k, "confidence": v.get("confidence", 0.0), "value": v.get("value")}
        for k, v in facts.items()
        if v.get("confidence", 0.0) < 0.4
    ]

    steps_at_risk = {}
    for step, required in REQUIRED_FIELDS_FOR_CLASSIFICATION.items():
        weak = [
            f for f in required
            if f not in facts or facts.get(f, {}).get("confidence", 0.0) < 0.4
        ]
        if weak:
            steps_at_risk[step] = weak

    confidence_values = [v.get("confidence", 0.0) for v in facts.values()]
    avg_extraction_confidence = round(
        sum(confidence_values) / len(confidence_values), 2
    ) if confidence_values else 0.0

    can_classify = len(missing_fields) < 5 and avg_extraction_confidence >= 0.4

    return {
        "can_classify": can_classify,
        "avg_extraction_confidence": avg_extraction_confidence,
        "missing_fields": missing_fields,
        "low_confidence_fields": low_confidence_fields,
        "steps_at_risk": steps_at_risk,
        "warning": (
            "Classification may be unreliable due to missing or low-confidence fields."
            if steps_at_risk else None
        )
    }