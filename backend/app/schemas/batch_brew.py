from __future__ import annotations

from pydantic import BaseModel, Field


class BatchBrewCreate(BaseModel):
    lotName: str = Field(min_length=1, max_length=120)
    roaster: str = ""
    thermosVolumeMl: int = Field(gt=0)
    coffeeDoseG: float = Field(gt=0)
    ratio: str = ""
    waterVolumeMl: float = Field(gt=0)
    brewerProgram: str = ""
    notes: str = ""


class BatchBrewUpdate(BaseModel):
    lotName: str | None = Field(default=None, min_length=1, max_length=120)
    roaster: str | None = None
    thermosVolumeMl: int | None = Field(default=None, gt=0)
    coffeeDoseG: float | None = Field(default=None, gt=0)
    ratio: str | None = None
    waterVolumeMl: float | None = Field(default=None, gt=0)
    brewerProgram: str | None = None
    notes: str | None = None


class BatchBrewResponse(BaseModel):
    id: str
    type: str = "batch_brew"
    lotName: str
    roaster: str
    thermosVolumeMl: int
    coffeeDoseG: float
    ratio: str
    waterVolumeMl: float
    brewerProgram: str
    notes: str
    createdAt: str
    updatedAt: str

    model_config = {"from_attributes": True}