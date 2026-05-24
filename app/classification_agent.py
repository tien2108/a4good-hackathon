# classification_agent.py

from openai import OpenAI
from app.risk_classifier import DECISION_TREE, RISK_OUTCOMES
import json
import re
import os
import dotenv
from app.llm_extract import FIELDS  # ✅ single source of truth


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

    # ── Article 5 checks — one prohibition per step ──────────────────────────

    "step_2a": """
Article 5(1)(c) — Social Scoring Prohibition:
An AI system is PROHIBITED if ALL of these are true:
1. The deployer is a public authority or acts on behalf of one (government, municipality, public body)
2. The system evaluates or scores individual citizens based on their behavior, transactions, or personal characteristics
3. The score produces a "Citizen Reliability Index", trust score, risk score, or similar ranking per person
4. The score affects how citizens are treated (priority, access to services, verification requirements)

If the system generates a per-citizen score used by public authorities to differentiate treatment -> answer YES.
""",

    "step_2b": """
Article 5(1)(a) — Subliminal Manipulation Prohibition:
An AI system is PROHIBITED if:
- It deploys techniques that operate below conscious awareness (subliminal)
- OR it uses purposefully manipulative or deceptive techniques
- AND these techniques materially distort a person's behavior
- AND this distortion causes or is likely to cause significant harm
""",

    "step_2c": """
Article 5(1)(b) — Exploitation of Vulnerabilities Prohibition:
An AI system is PROHIBITED if:
- It exploits vulnerabilities of a specific group of persons
- Vulnerability is due to age, disability, or specific social or economic situation
- The exploitation distorts behavior in a way that causes or is likely to cause harm
""",

    "step_2d": """
Article 5(1)(d) — Real-Time Biometric Identification Prohibition:
An AI system is PROHIBITED if ALL of these are true:
1. It performs remote biometric identification (e.g. facial recognition, gait, fingerprint)
2. It operates in real-time (not post-hoc)
3. It is used in publicly accessible spaces
4. It is used for law enforcement purposes

Note: behavioral scoring and transaction analysis are NOT biometric identification.
""",

    # ── High-risk and downstream checks ──────────────────────────────────────

    "step_3": """
Article 6.1 + Annex III — High-Risk AI Systems:
A system is high-risk if it falls under one of these Annex III categories:
1. Biometric identification and categorisation of natural persons
2. Management and operation of critical infrastructure (water, gas, electricity, transport)
3. Education and vocational training (access decisions, assessment of students)
4. Employment and workers management (recruitment, promotion, task allocation, monitoring)
5. Access to essential private or public services and benefits
   (credit scoring, insurance risk assessment, social benefits eligibility, emergency services)
6. Law enforcement (risk assessment of individuals, polygraphs, evidence evaluation, crime prediction)
7. Migration, asylum, and border control management
8. Administration of justice and democratic processes

Note: A system scoring citizens for public service eligibility or welfare access falls under category 5.
""",

    "step_4": """
Article 6.3 — Exemption from High-Risk Classification:
A system listed under Annex III is NOT high-risk if it meets one of these conditions:
- It does not pose a significant risk of harm to health, safety, or fundamental rights of persons
- It only performs a narrow procedural task (e.g. converting formats, sorting documents)
- It improves the result of a previously completed human activity (e.g. spell-check after human writing)
- It detects patterns or anomalies and is not used to make or influence decisions about natural persons

A system fails this exemption (i.e. remains high-risk) if it:
- Profiles individuals
- Influences decisions about access to services or benefits
- Operates autonomously on decisions affecting people
""",

    "step_5": """
Article 16-22, Article 72, Article 99.4a/b — Provider obligations:
A party is a PROVIDER if they:
- Developed the AI system and placed it on the EU market under their own name or trademark
- Are the authorised representative of a non-EU provider

Provider obligations include:
- Conformity assessment
- CE marking
- Technical documentation
- Registration in EU database
- Post-market monitoring
""",

    "step_5a": """
Article 23, Article 99.4c — Importer obligations:
A party is an IMPORTER if they:
- Are established in the EU
- Place a high-risk AI system from a third-country provider on the EU market

Importer obligations include:
- Verify the provider has conducted conformity assessment
- Verify CE marking and technical documentation exist
- Ensure storage/transport does not affect conformity
""",

    "step_5b": """
Article 24, Article 99.4d — Distributor obligations:
A party is a DISTRIBUTOR if they:
- Make a high-risk AI system available on the EU market
- Are not the provider or importer

Distributor obligations include:
- Verify CE marking is present
- Verify declaration of conformity accompanies the system
- Do not make available systems known to be non-compliant
""",

    "step_5c": """
Article 26, Article 99.4e — Deployer obligations:
A party is a DEPLOYER if they:
- Use a high-risk AI system under their authority in a professional context
- Are not the provider, importer, or distributor

Deployer obligations include:
- Use system according to instructions of use
- Assign human oversight to competent persons
- Monitor operation for risks
- Log and retain records of use
- Inform affected persons where required
""",

    "step_5d": """
Article 27 — Fundamental rights impact assessment:
This obligation applies if the deployer is:
- A public authority or body
- A private company mandated to provide public services (utilities, transport, healthcare, education)

These deployers must conduct a fundamental rights impact assessment before deploying a high-risk AI system.
The assessment must cover:
- The nature of the rights at risk
- The categories of persons affected
- The geographic and temporal scope of deployment
- Whether human oversight is adequate
""",

    "step_6": """
Article 50 — Transparency obligations:
A system falls under Article 50 transparency requirements if it is any of:
- A conversational AI or chatbot that interacts with humans in natural language
- A system that generates synthetic audio, image, video, or text intended to appear real (deepfakes)
- An emotion recognition system
- A biometric categorisation system

These systems must:
- Disclose to users that they are interacting with or viewing AI-generated content
- Label synthetic media as artificially generated or manipulated

Note: This applies even to systems that are not high-risk.
""",

    "step_7": """
Article 51 — GPAI Model Classification:
A model qualifies as General Purpose AI (GPAI) if it:
- Is trained on broad data at large scale
- Exhibits significant generality (can perform a wide range of distinct tasks)
- Is made available to third parties via API, open-source release, or product integration

GPAI models are subject to transparency and documentation obligations under Article 53.
A domain-specific model trained only for one task (e.g. fraud detection, image classification) is NOT GPAI.
""",

    "step_8": """
Article 51 — GPAI Systemic Risk Classification:
A GPAI model has systemic risk if it meets either condition:
- It has been designated by the Commission as having high-impact capabilities posing serious risk
  to public health, safety, security, or fundamental rights at scale
- Its cumulative training compute exceeds 10^25 floating point operations (FLOPs)

If systemic risk is present, the model provider has additional obligations under Article 54:
- Adversarial testing and red-teaming
- Incident reporting to the Commission
- Cybersecurity measures
- Energy efficiency reporting
""",
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
        facts_text = parsed.get("facts_text", "")  # <-- add this
        return {"answer": answer, "confidence": confidence, "justification": justification, "facts_text": facts_text}
    except (json.JSONDecodeError, ValueError):
        pass

    # Fallback
    answer = "yes" if "yes" in text.lower() else "no"
    match = re.search(r"0\.\d+", text)
    confidence = float(match.group()) if match else 0.1
    justification = "Could not parse model response as JSON. Fallback to regex parsing."
    return {"answer": answer, "confidence": confidence, "justification": justification}


def ask_decision(question: str, facts: dict, step: str) -> dict:
    required = REQUIRED_FIELDS_FOR_CLASSIFICATION.get(step, [])

    # Rename to avoid conflict with model's returned "relevant_facts" keys
    candidate_facts = {
        k: v for k, v in facts.items()
        if k in required and v.get("confidence", 0) >= 0.7
    }

    other_facts = {
        k: v for k, v in facts.items()
        if k not in candidate_facts
    }

    facts_text = "\n".join([
        f"- {k}: {v.get('value', 'unknown')} (confidence: {v.get('confidence', 0.0):.1f})"
        for k, v in candidate_facts.items()
    ])

    low_confidence_facts = "\n".join([
        f"- {k}: uncertain or not found"
        for k, v in other_facts.items()
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

Low confidence or missing facts (treat as unknown):
{low_confidence_facts}

Question: {question}
Return only JSON: {{"answer": "yes", "confidence": 0.7, "justification": "Based on Article X: ..."}}"""}
        ],
        temperature=0,
        max_tokens=150
    )

    raw = response.choices[0].message.content
    result = _parse_decision_response(raw)
    print(f"[DEBUG] model relevant_facts={result.get('relevant_facts', [])}")

    return result


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
        
        fields = REQUIRED_FIELDS_FOR_CLASSIFICATION.get(current_step, [])
        fact_texts = [{field: facts.get(field, {}).get("evidence")} for field in fields]

        reasoning_trace.append({
            "step": current_step,
            "question": question,
            "answer": answer,
            "confidence": confidence,
            "confidence_label": _confidence_label(confidence),
            "justification": decision["justification"],
            "fact_texts": fact_texts,
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

# classification_agent.py

def validate_facts_for_classification(facts: dict) -> dict:
    missing_fields = [
        field for field in FIELDS  # ✅ always in sync with extraction
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
def is_ai_related(facts: dict) -> bool:
    facts_text = "\n".join([
        f"- {k}: {v.get('value', 'unknown')}"
        for k, v in facts.items()
        if v.get("confidence", 0) >= 0.4
    ])

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": "You are a classifier. Return only JSON, no markdown."},
            {"role": "user", "content": f"""Based on these extracted facts, is this document describing an AI system or AI-powered product?

Facts:
{facts_text}

Return only JSON: {{"is_ai": true, "reason": "..."}}"""}
        ],
        temperature=0,
        max_tokens=100
    )

    raw = response.choices[0].message.content
    raw = re.sub(r"```(?:json)?\s*", "", raw).strip().replace("```", "")
    try:
        parsed = json.loads(raw)
        return bool(parsed.get("is_ai", False))
    except (json.JSONDecodeError, ValueError):
        return False