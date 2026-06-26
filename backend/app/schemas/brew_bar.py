from __future__ import annotations

from pydantic import BaseModel, Field


class BrewBarStep(BaseModel):
    startTime: str = Field(examples=["0:00"])
    stageName: str = Field(min_length=1, examples=["Bloom"])
    pourVolumeMl: float = Field(ge=0)
    targetWeightG: float = Field(ge=0)


class BrewBarCreate(BaseModel):
    lotName: str = Field(min_length=1, max_length=120)
    roaster: str = ""
    method: str = Field(default="v60", pattern="^(v60|switch|orea)$")
    grindClicks: str = ""
    coffeeWeightG: float = Field(gt=0)
    waterVolumeMl: float = Field(gt=0)
    steps: list[BrewBarStep] = Field(default_factory=list)
    notes: str = ""


class BrewBarUpdate(BaseModel):
    lotName: str | None = Field(default=None, min_length=1, max_length=120)
    roaster: str | None = None
    method: str | None = Field(default=None, pattern="^(v60|switch|orea)$")
    grindClicks: str | None = None
    coffeeWeightG: float | None = Field(default=None, gt=0)
    waterVolumeMl: float | None = Field(default=None, gt=0)
    steps: list[BrewBarStep] | None = None
    notes: str | None = None


class BrewBarResponse(BaseModel):
    id: str
    type: str = "brew_bar"
    lotName: str
    roaster: str
    method: str
    grindClicks: str
    coffeeWeightG: float
    waterVolumeMl: float
    steps: list[BrewBarStep]
    notes: str
    createdAt: str
    updatedAt: str

    model_config = {"from_attributes": True}