from __future__ import annotations

from pydantic import BaseModel, Field


class BrewBarStep(BaseModel):
    startTime: str = Field(examples=["0:00"])
    stageName: str = Field(min_length=1, examples=["Блум"])
    pourVolumeMl: float = Field(ge=0)
    targetWeightG: float = Field(ge=0)
    comment: str = ""


class BrewBarCreate(BaseModel):
    lotName: str = Field(min_length=1, max_length=120)
    roaster: str = ""
    origin: str = ""
    processing: str = ""
    method: str = Field(default="v60", pattern="^(v60|switch|orea)$")
    grinder: str = ""
    grindClicks: str = ""
    coffeeWeightG: float = Field(gt=0)
    waterVolumeMl: float = Field(gt=0)
    temperature: float | None = None
    waterPpm: int | None = None
    steps: list[BrewBarStep] = Field(default_factory=list)
    notes: str = ""


class BrewBarUpdate(BaseModel):
    lotName: str | None = Field(default=None, min_length=1, max_length=120)
    roaster: str | None = None
    origin: str | None = None
    processing: str | None = None
    method: str | None = Field(default=None, pattern="^(v60|switch|orea)$")
    grinder: str | None = None
    grindClicks: str | None = None
    coffeeWeightG: float | None = Field(default=None, gt=0)
    waterVolumeMl: float | None = Field(default=None, gt=0)
    temperature: float | None = None
    waterPpm: int | None = None
    steps: list[BrewBarStep] | None = None
    notes: str | None = None


class BrewBarResponse(BaseModel):
    id: str
    type: str = "brew_bar"
    lotName: str
    roaster: str
    origin: str
    processing: str
    method: str
    grinder: str
    grindClicks: str
    coffeeWeightG: float
    waterVolumeMl: float
    temperature: float | None = None
    waterPpm: int | None = None
    steps: list[BrewBarStep]
    notes: str
    createdAt: str
    updatedAt: str

    model_config = {"from_attributes": True}