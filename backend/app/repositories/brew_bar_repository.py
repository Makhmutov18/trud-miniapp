from __future__ import annotations

import json
from typing import Any

from sqlalchemy import select, delete, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.brew_bar_recipe import BrewBarRecipe


def encode(value: Any) -> str:
    return json.dumps(value or [], ensure_ascii=False)


def decode(value: str | None, fallback: Any) -> Any:
    if not value:
        return fallback
    try:
        return json.loads(value)
    except (json.JSONDecodeError, TypeError):
        return fallback


class BrewBarRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list(self, method: str | None = None) -> list[BrewBarRecipe]:
        query = select(BrewBarRecipe)
        if method:
            query = query.where(BrewBarRecipe.method == method)
        query = query.order_by(BrewBarRecipe.lot_name)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get(self, recipe_id: str) -> BrewBarRecipe | None:
        result = await self.session.execute(
            select(BrewBarRecipe).where(BrewBarRecipe.id == recipe_id)
        )
        return result.scalar_one_or_none()

    async def create(self, data: dict[str, Any]) -> BrewBarRecipe:
        recipe = BrewBarRecipe(
            lot_name=data.get("lotName") or data.get("lot_name") or "",
            roaster=data.get("roaster", ""),
            method=data.get("method", "v60"),
            grind_clicks=data.get("grindClicks") or data.get("grind_clicks") or "",
            coffee_weight_g=data.get("coffeeWeightG") or data.get("coffee_weight_g") or 0,
            water_volume_ml=data.get("waterVolumeMl") or data.get("water_volume_ml") or 0,
            steps=encode(data.get("steps", [])),
            notes=data.get("notes", ""),
        )
        self.session.add(recipe)
        await self.session.commit()
        await self.session.refresh(recipe)
        return recipe

    async def update(self, recipe_id: str, data: dict[str, Any]) -> BrewBarRecipe | None:
        existing = await self.get(recipe_id)
        if not existing:
            return None

        update_data = {}
        if "lotName" in data:
            update_data["lot_name"] = data["lotName"]
        if "roaster" in data:
            update_data["roaster"] = data["roaster"]
        if "method" in data:
            update_data["method"] = data["method"]
        if "grindClicks" in data:
            update_data["grind_clicks"] = data["grindClicks"]
        if "coffeeWeightG" in data:
            update_data["coffee_weight_g"] = data["coffeeWeightG"]
        if "waterVolumeMl" in data:
            update_data["water_volume_ml"] = data["waterVolumeMl"]
        if "steps" in data:
            update_data["steps"] = encode(data["steps"])
        if "notes" in data:
            update_data["notes"] = data["notes"]

        if not update_data:
            return existing

        from app.models.brew_bar_recipe import now_iso
        update_data["updated_at"] = now_iso()

        await self.session.execute(
            update(BrewBarRecipe).where(BrewBarRecipe.id == recipe_id).values(**update_data)
        )
        await self.session.commit()
        return await self.get(recipe_id)

    async def delete(self, recipe_id: str) -> bool:
        result = await self.session.execute(
            delete(BrewBarRecipe).where(BrewBarRecipe.id == recipe_id)
        )
        await self.session.commit()
        return result.rowcount > 0