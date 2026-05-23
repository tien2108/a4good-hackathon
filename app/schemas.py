from pydantic import BaseModel
from typing import List


class FactExtraction(BaseModel):
    value: str
    evidence: str
    confidence: float


class SystemFacts(BaseModel):
    system_purpose: FactExtraction
    users: FactExtraction
    input_data: FactExtraction
    outputs: FactExtraction
    automation: FactExtraction