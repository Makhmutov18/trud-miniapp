from __future__ import annotations

from pydantic import BaseModel, Field


class CalculationRequest(BaseModel):
    beverageWeight: float = Field(gt=0)
    tds: float = Field(ge=0)
    dose: float = Field(gt=0)


class CalculationResponse(BaseModel):
    extraction: float
    status: str
    formula: str = "(вес напитка × TDS) / доза"