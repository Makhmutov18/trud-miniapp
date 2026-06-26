from __future__ import annotations

from pydantic import BaseModel, Field


class BatchBrewCreate(BaseModel):
    folderId: str | None = None
    lotName: str = Field(min_length=1, max_length=120)
    roaster: str = ""
    thermosVolumeMl: int = Field(default=0, ge=0)
    ratio: str = ""
    brewerProgram: str = ""
    coffeeDoseG: float = Field(gt=0)
    grindClicks: str = ""
    waterVolumeMl: float = Field(gt=0)
    notes: str = ""


class BatchBrewUpdate(BaseModel):
    folderId: str | None = None
    lotName: str | None = Field(default=None, min_length=1, max_length=120)
    roaster: str | None = None
    thermosVolumeMl: int | None = Field(default=None, ge=0)
    ratio: str | None = None
    brewerProgram: str | None = None
    coffeeDoseG: float | None = Field(default=None, gt=0)
    grindClicks: str | None = None
    waterVolumeMl: float | None = Field(default=None, gt=0)
    notes: str | None = None


class BatchBrewResponse(BaseModel):
    id: str
    type: str = "batch_brew"
    folderId: str | None = None
    lotName: str
    roaster: str
    thermosVolumeMl: int = 0
    ratio: str = ""
    brewerProgram: str
    coffeeDoseG: float
    grindClicks: str
    waterVolumeMl: float
    notes: str
    createdAt: str
    updatedAt: str

    model_config = {"from_attributes": True}
