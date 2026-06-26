from __future__ import annotations

import json
from typing import Any

from app.repositories.brew_bar_repository import BrewBarRepository
from app.repositories.batch_brew_repository import BatchBrewRepository
from app.repositories.signature_ttk_repository import SignatureTtkRepository
from app.schemas.brew_bar import BrewBarCreate, BrewBarUpdate
from app.schemas.batch_brew import BatchBrewCreate, BatchBrewUpdate
from app.schemas.signature_ttk import SignatureTtkCreate, SignatureTtkUpdate


def _brew_bar_to_response(row: Any) -> dict[str, Any]:
    return {
        "id": row.id,
        "type": "brew_bar",
        "lotName": row.lot_name,
        "roaster": row.roaster,
        "origin": row.origin,
        "processing": row.processing,
        "method": row.method,
        "grinder": row.grinder,
        "grindClicks": row.grind_clicks,
        "coffeeWeightG": row.coffee_weight_g,
        "waterVolumeMl": row.water_volume_ml,
        "temperature": row.temperature,
        "waterPpm": row.water_ppm,
        "steps": json.loads(row.steps) if row.steps else [],
        "notes": row.notes,
        "createdAt": row.created_at,
        "updatedAt": row.updated_at,
    }


def _batch_brew_to_response(row: Any) -> dict[str, Any]:
    return {
        "id": row.id,
        "type": "batch_brew",
        "lotName": row.lot_name,
        "roaster": row.roaster,
        "brewerProgram": row.brewer_program,
        "coffeeDoseG": row.coffee_dose_g,
        "grindClicks": row.grind_clicks,
        "waterVolumeMl": row.water_volume_ml,
        "notes": row.notes,
        "createdAt": row.created_at,
        "updatedAt": row.updated_at,
    }


def _signature_ttk_to_response(row: Any) -> dict[str, Any]:
    return {
        "id": row.id,
        "type": "signature_ttk",
        "drinkName": row.drink_name,
        "category": row.category,
        "servingVolumeMl": row.serving_volume_ml,
        "vessel": row.vessel,
        "imageUrl": row.image_url,
        "ingredients": json.loads(row.ingredients) if row.ingredients else [],
        "serviceSteps": json.loads(row.service_steps) if row.service_steps else [],
        "allergensAndComposition": row.allergens_and_composition,
        "storageConditions": row.storage_conditions,
        "notes": row.notes,
        "createdAt": row.created_at,
        "updatedAt": row.updated_at,
    }


class RecipeService:
    def __init__(
        self,
        brew_bar_repo: BrewBarRepository,
        batch_brew_repo: BatchBrewRepository,
        signature_ttk_repo: SignatureTtkRepository,
    ):
        self.brew_bar_repo = brew_bar_repo
        self.batch_brew_repo = batch_brew_repo
        self.signature_ttk_repo = signature_ttk_repo

    async def list_by_type(self, recipe_type: str | None = None) -> list[dict[str, Any]] | dict[str, list[dict[str, Any]]]:
        if recipe_type == "brew_bar":
            return [self._brew_bar_to_response(r) for r in await self.brew_bar_repo.list()]
        if recipe_type == "batch_brew":
            return [self._batch_brew_to_response(r) for r in await self.batch_brew_repo.list()]
        if recipe_type == "signature_ttk":
            return [self._signature_ttk_to_response(r) for r in await self.signature_ttk_repo.list()]
        return {
            "brewBar": [self._brew_bar_to_response(r) for r in await self.brew_bar_repo.list()],
            "batchBrew": [self._batch_brew_to_response(r) for r in await self.batch_brew_repo.list()],
            "signatureTtk": [self._signature_ttk_to_response(r) for r in await self.signature_ttk_repo.list()],
        }

    # Brew Bar
    async def list_brew_bar(self, method: str | None = None) -> list[dict[str, Any]]:
        return [_brew_bar_to_response(r) for r in await self.brew_bar_repo.list(method)]

    async def get_brew_bar(self, recipe_id: str) -> dict[str, Any] | None:
        recipe = await self.brew_bar_repo.get(recipe_id)
        return _brew_bar_to_response(recipe) if recipe else None

    async def create_brew_bar(self, payload: BrewBarCreate) -> dict[str, Any]:
        recipe = await self.brew_bar_repo.create(payload.model_dump(mode="json"))
        return _brew_bar_to_response(recipe)

    async def replace_brew_bar(self, recipe_id: str, payload: BrewBarCreate) -> dict[str, Any] | None:
        recipe = await self.brew_bar_repo.replace(recipe_id, payload.model_dump(mode="json"))
        return _brew_bar_to_response(recipe) if recipe else None

    async def update_brew_bar(self, recipe_id: str, payload: BrewBarUpdate) -> dict[str, Any] | None:
        recipe = await self.brew_bar_repo.update(recipe_id, payload.model_dump(exclude_none=True, mode="json"))
        return _brew_bar_to_response(recipe) if recipe else None

    async def delete_brew_bar(self, recipe_id: str) -> bool:
        return await self.brew_bar_repo.delete(recipe_id)

    # Batch Brew
    async def list_batch_brew(self) -> list[dict[str, Any]]:
        return [_batch_brew_to_response(r) for r in await self.batch_brew_repo.list()]

    async def get_batch_brew(self, recipe_id: str) -> dict[str, Any] | None:
        recipe = await self.batch_brew_repo.get(recipe_id)
        return _batch_brew_to_response(recipe) if recipe else None

    async def create_batch_brew(self, payload: BatchBrewCreate) -> dict[str, Any]:
        recipe = await self.batch_brew_repo.create(payload.model_dump(mode="json"))
        return _batch_brew_to_response(recipe)

    async def replace_batch_brew(self, recipe_id: str, payload: BatchBrewCreate) -> dict[str, Any] | None:
        recipe = await self.batch_brew_repo.replace(recipe_id, payload.model_dump(mode="json"))
        return _batch_brew_to_response(recipe) if recipe else None

    async def update_batch_brew(self, recipe_id: str, payload: BatchBrewUpdate) -> dict[str, Any] | None:
        recipe = await self.batch_brew_repo.update(recipe_id, payload.model_dump(exclude_none=True, mode="json"))
        return _batch_brew_to_response(recipe) if recipe else None

    async def delete_batch_brew(self, recipe_id: str) -> bool:
        return await self.batch_brew_repo.delete(recipe_id)

    # Signature TTK
    async def list_signature_ttk(self, category: str | None = None) -> list[dict[str, Any]]:
        return [_signature_ttk_to_response(r) for r in await self.signature_ttk_repo.list(category)]

    async def get_signature_ttk(self, ttk_id: str) -> dict[str, Any] | None:
        ttk = await self.signature_ttk_repo.get(ttk_id)
        return _signature_ttk_to_response(ttk) if ttk else None

    async def create_signature_ttk(self, payload: SignatureTtkCreate) -> dict[str, Any]:
        ttk = await self.signature_ttk_repo.create(payload.model_dump(mode="json"))
        return _signature_ttk_to_response(ttk)

    async def replace_signature_ttk(self, ttk_id: str, payload: SignatureTtkCreate) -> dict[str, Any] | None:
        ttk = await self.signature_ttk_repo.replace(ttk_id, payload.model_dump(mode="json"))
        return _signature_ttk_to_response(ttk) if ttk else None

    async def update_signature_ttk(self, ttk_id: str, payload: SignatureTtkUpdate) -> dict[str, Any] | None:
        ttk = await self.signature_ttk_repo.update(ttk_id, payload.model_dump(exclude_none=True, mode="json"))
        return _signature_ttk_to_response(ttk) if ttk else None

    async def delete_signature_ttk(self, ttk_id: str) -> bool:
        return await self.signature_ttk_repo.delete(ttk_id)