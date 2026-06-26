from __future__ import annotations

from pydantic import BaseModel, Field


class Ingredient(BaseModel):
    ingredientName: str = Field(min_length=1, examples=["Двойной эспрессо"])
    exactAmount: str = Field(min_length=1, examples=["34 г"])


class SignatureTtkCreate(BaseModel):
    folderId: str | None = None
    drinkName: str = Field(min_length=1, max_length=120)
    category: str = Field(default="hot", pattern="^(hot|cold)$")
    servingVolumeMl: int = Field(gt=0)
    vessel: str = ""
    imageUrl: str = ""
    ingredients: list[Ingredient] = Field(default_factory=list)
    serviceSteps: list[str] = Field(default_factory=list)
    allergensAndComposition: str = ""
    storageConditions: str = ""
    notes: str = ""


class SignatureTtkUpdate(BaseModel):
    folderId: str | None = None
    drinkName: str | None = Field(default=None, min_length=1, max_length=120)
    category: str | None = Field(default=None, pattern="^(hot|cold)$")
    servingVolumeMl: int | None = Field(default=None, gt=0)
    vessel: str | None = None
    imageUrl: str | None = None
    ingredients: list[Ingredient] | None = None
    serviceSteps: list[str] | None = None
    allergensAndComposition: str | None = None
    storageConditions: str | None = None
    notes: str | None = None


class SignatureTtkResponse(BaseModel):
    id: str
    type: str = "signature_ttk"
    folderId: str | None = None
    drinkName: str
    category: str
    servingVolumeMl: int
    vessel: str
    imageUrl: str
    ingredients: list[Ingredient]
    serviceSteps: list[str]
    allergensAndComposition: str
    storageConditions: str
    notes: str
    createdAt: str
    updatedAt: str

    model_config = {"from_attributes": True}
