from __future__ import annotations

from pydantic import BaseModel, Field


class BrewHistoryCreate(BaseModel):
    itemId: str | None = None
    coffeeBeans: str = Field(min_length=1)
    brewMethod: str = Field(min_length=1)
    weightIn: float = Field(gt=0)
    weightOut: float = Field(gt=0)
    brewTime: int = Field(gt=0)
    temperature: float | None = None
    tds: float | None = Field(default=None, ge=0)
    extraction: float | None = None


class BrewHistoryResponse(BaseModel):
    id: str
    itemId: str | None
    coffeeBeans: str
    brewMethod: str
    weightIn: float
    weightOut: float
    brewTime: int
    temperature: float | None
    tds: float | None
    extraction: float | None
    status: str
    createdAt: str

    model_config = {"from_attributes": True}