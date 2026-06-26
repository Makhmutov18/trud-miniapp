from __future__ import annotations

from pydantic import BaseModel, Field


class Spec(BaseModel):
    label: str
    value: str


class ItemCreate(BaseModel):
    category: str = Field(default="coffee", pattern="^(coffee|pastry|checklist)$")
    subcategory: str = ""
    title: str = Field(min_length=1, max_length=100)
    subtitle: str = ""
    description: str = ""
    price: int | None = Field(default=None, ge=0)
    imageUrl: str = ""
    specs: list[Spec] = Field(default_factory=list)
    steps: list[str] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)
    isFavorite: bool = False


class ItemUpdate(BaseModel):
    category: str | None = Field(default=None, pattern="^(coffee|pastry|checklist)$")
    subcategory: str | None = None
    title: str | None = Field(default=None, min_length=1, max_length=100)
    subtitle: str | None = None
    description: str | None = None
    price: int | None = Field(default=None, ge=0)
    imageUrl: str | None = None
    specs: list[Spec] | None = None
    steps: list[str] | None = None
    tags: list[str] | None = None
    isFavorite: bool | None = None


class ItemResponse(BaseModel):
    id: str
    category: str
    subcategory: str
    title: str
    subtitle: str
    description: str
    price: int | None
    imageUrl: str
    specs: list[Spec]
    steps: list[str]
    tags: list[str]
    isFavorite: bool
    createdAt: str
    updatedAt: str

    model_config = {"from_attributes": True}