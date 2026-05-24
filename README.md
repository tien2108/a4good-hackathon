# Norrin Ipsum

**AI Use Case Compliance Analysis for the EU AI Act**

Norrin Ipsum is a document intelligence pipeline that analyzes AI system use cases for compliance with the EU AI Act. Given one or more documents describing an AI system, it produces a structured compliance report covering risk classification, governance recommendations, and confidence assessment.

---

## What It Does

1. Accepts uploaded documents (PDF, DOCX, PPTX) describing an AI use case
2. Extracts structured facts from the documents using embeddings and LLM
3. Classifies the system's risk level under the EU AI Act via a decision tree
4. Generates practical governance and risk management recommendations
5. Audits its own reasoning for assumptions and missing information
6. Produces a confidence-adjusted, human-readable compliance report

---

## Pipeline Architecture

Norrin Ipsum is composed of seven AI agents that run sequentially. Each agent consumes the output of the previous stage.

```
Documents (PDF / DOCX / PPTX)
        │
        ▼
┌───────────────────┐
│  1. Input Parser  │  Embedding + LLM
└────────┬──────────┘
         │ Extracted facts (JSON)
         ▼
┌───────────────────┐
│  2. Classifier    │  LLM + Decision Tree
└────────┬──────────┘
         │ Risk level + reasoning trace (JSON)
         ▼
┌───────────────────┐
│  3. Governance    │  LLM
└────────┬──────────┘
         │ Governance recommendations (JSON)
         ▼
┌──────────────────────────┐      ┌──────────────────────────┐
│  4. Assumption Checker   │      │  5. Missing Info Checker │
│  LLM                     │      │  LLM                     │
└────────────┬─────────────┘      └─────────────┬────────────┘
             │ Assumptions list                  │ Missing fields list
             └──────────────┬────────────────────┘
                            ▼
             ┌──────────────────────────────┐
             │  6. Prevention of Confidence │  Semantic analysis
             └──────────────┬───────────────┘
                            │ Confidence block (JSON)
                            ▼
             ┌──────────────────────────────┐
             │  7. Humanizer / UI Display   │  Aggregation
             └──────────────────────────────┘
                            │
                            ▼
                  Compliance Report (JSON → Frontend)
```

---

## Agents

### 1. Input Parser
Accepts raw document bytes (PDF, DOCX, PPTX) and extracts a structured JSON of facts required for compliance analysis.

- Chunks document pages using a sliding window strategy
- Embeds chunks and builds an in-memory vector store
- Retrieves the most relevant chunks per field using semantic search
- Uses an LLM to extract each field with a value, evidence quote, and confidence score

**Output fields include:** purpose, users, affected persons, sector, input data, outputs, scoring or ranking of individuals, differential treatment based on score, automation level, human oversight, deployment context, use of AI-generated content, use of GPAI, possible impact on people, risks or harms to affected persons.

---

### 2. Classifier
Walks a decision tree grounded in EU AI Act articles to determine the system's risk level.

- Each node poses a binary yes/no question to an LLM
- The LLM is given the relevant article text and extracted facts for that step
- Produces a full reasoning trace with per-step confidence scores
- Final output includes risk level, applicable articles, overall confidence, and weakest-link identification

**Risk levels:** `PROHIBITED` · `HIGH RISK` · `LIMITED RISK` · `GPAI` · `GPAI — SYSTEMIC RISK` · `MINIMAL RISK` · `OUT OF SCOPE`

**Articles covered:** Art. 2, Art. 5(1)(a/b/c/d), Art. 6, Art. 6.3, Art. 16–27, Art. 50, Art. 51, Art. 53, Art. 54

---

### 3. Governance Agent
Generates practical compliance guidance based on the classified risk level and extracted facts.

- Tailors recommendations to the specific deployment context, sector, and affected persons
- Covers: conformity assessment obligations, human oversight requirements, transparency disclosures, fundamental rights impact assessments, logging and monitoring, and incident reporting
- Flags prohibited practices with immediate remediation steps

---

### 4. Assumption Checker
Audits the full pipeline for implicit assumptions made during extraction and classification.

- Lists every assumption made where the document was ambiguous or silent
- Tags each assumption with the field and pipeline step it affects
- Surfaces cases where the LLM inferred facts not explicitly stated in the source documents

---

### 5. Missing Info Checker
Identifies gaps in the extracted facts that could affect the reliability of the governance recommendations.

- Lists fields that were null, low-confidence, or extracted from weak evidence
- Maps missing fields to the governance obligations they affect
- Indicates which decision tree steps were at risk due to insufficient evidence

---

### 6. Prevention of Confidence
Combines the outputs of the Assumption Checker and Missing Info Checker into a single concise confidence block using semantic analysis.

- Deduplicates and clusters overlapping concerns from both checkers
- Produces an overall reliability label: `HIGH` · `MEDIUM` · `LOW` · `VERY LOW`
- Highlights the specific issues most likely to affect the validity of the final classification

---

### 7. Humanizer / UI Display
Aggregates all pipeline outputs into a single structured JSON payload ready for frontend rendering.

- Normalizes field formats and confidence labels across all agents
- Structures the report into logical sections: summary, classification, governance, and confidence audit
- Ensures all fields required by the frontend are present with fallback values where needed

---

## Supported Input Formats

| Format | Extension | Notes |
|--------|-----------|-------|
| PDF | `.pdf` | Text-based PDFs; scanned PDFs require OCR pre-processing |
| Word Document | `.docx` | Paragraphs and tables extracted |
| PowerPoint | `.pptx` | Slide titles, body text, and speaker notes extracted |

Multiple files can be uploaded in a single request. All documents are combined into a single fact extraction pass.

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| API framework | FastAPI |
| PDF extraction | PyMuPDF (fitz) |
| DOCX extraction | python-docx |
| PPTX extraction | python-pptx |
| Embeddings + chunking | Embedding model via Verda API |
| Vector store | In-memory FAISS-style index |
| LLM | Meta Llama 3.1 8B Instruct via Verda API |
| LLM client | OpenAI-compatible Python client |

---

## API

### `POST /analyze/`

Accepts one or more files and returns a full compliance report.

**Request**
```bash
curl -X POST http://localhost:8000/analyze/ \
  -F "files=@use_case.pdf;type=application/pdf" \
  -F "files=@technical_spec.docx;type=application/vnd.openxmlformats-officedocument.wordprocessingml.document"
```

**Response structure**
```json
{
  "status": "success",
  "extracted_fields": { ... },
  "validation": { ... },
  "classification": {
    "risk_level": "PROHIBITED",
    "articles": ["Article 5(1)(c)"],
    "description": "...",
    "overall_confidence": 0.85,
    "reasoning_trace": [ ... ]
  },
  "governance": { ... },
  "confidence_audit": {
    "label": "MEDIUM",
    "assumptions": [ ... ],
    "missing_fields": [ ... ],
    "summary": "..."
  },
  "display": { ... }
}
```

**Status values**

| Status | Meaning |
|--------|---------|
| `success` | Full pipeline completed |
| `rejected` | Document does not describe an AI system |
| `aborted` | Insufficient facts for reliable classification |


---

## Environment Variables

```env
VERDA_BASE_LLAMA_URL=https://...
VERDA_API_KEY=your_api_key_here
```

---

## Disclaimer

Norrin Ipsum is a decision-support tool and does not constitute legal advice. Classification outputs should be reviewed by a qualified legal professional before being used for compliance decisions. The EU AI Act is subject to ongoing implementation guidance and delegated acts that may affect classification outcomes.