from __future__ import annotations

from typing import Any

from sqlalchemy import select, delete, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.batch_brew_recipe import BatchBrewRecipe


class BatchBrewRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list(self) -> list[BatchBrewRecipe]:
        result = await self.session.execute(
            select(BatchBrewRecipe).order_by(BatchBrewRecipe.lot_name)
        )
        return list(result.scalars().all())

    async def get(self, recipe_id: str) -> BatchBrewRecipe | None:
        result = await self.session.execute(
            select(BatchBrewRecipe).where(BatchBrewRecipe.id == recipe_id)
        )
        return result.scalar_one_or_none()

    async def create(self, data: dict[str, Any]) -> BatchBrewRecipe:
        recipe = BatchBrewRecipe(
            folder_id=data.get("folderId") or data.get("folder_id") or None,
            lot_name=data.get("lotName") or data.get("lot_name") or "",
            roaster=data.get("roaster", ""),
            thermos_volume_ml=data.get("thermosVolumeMl") or data.get("thermos_volume_ml") or 0,
            ratio=data.get("ratio", ""),
            brewer_program=data.get("brewerProgram") or data.get("brewer_program") or "",
            coffee_dose_g=data.get("coffeeDoseG") or data.get("coffee_dose_g") or 0,
            grind_clicks=data.get("grindClicks") or data.get("grind_clicks") or "",
            water_volume_ml=data.get("waterVolumeMl") or data.get("water_volume_ml") or 0,
            notes=data.get("notes", ""),
        )
        self.session.add(recipe)
        await self.session.commit()
        await self.session.refresh(recipe)
        return recipe

    async def replace(self, recipe_id: str, data: dict[str, Any]) -> BatchBrewRecipe | None:
        """Full replacement (PUT) without changing the record id."""
        existing = await self.get(recipe_id)
        if not existing:
            return None
        return await self.update(recipe_id, data)

    async def update(self, recipe_id: str, data: dict[str, Any]) -> BatchBrewRecipe | None:
        existing = await self.get(recipe_id)
        if not existing:
            return None

        update_data = {}
        if "folderId" in data:
            update_data["folder_id"] = data["folderId"] or None
        if "lotName" in data:
            update_data["lot_name"] = data["lotName"]
        if "roaster" in data:
            update_data["roaster"] = data["roaster"]
        if "thermosVolumeMl" in data:
            update_data["thermos_volume_ml"] = data["thermosVolumeMl"] or 0
        if "ratio" in data:
            update_data["ratio"] = data["ratio"]
        if "brewerProgram" in data:
            update_data["brewer_program"] = data["brewerProgram"]
        if "coffeeDoseG" in data:
            update_data["coffee_dose_g"] = data["coffeeDoseG"]
        if "grindClicks" in data:
            update_data["grind_clicks"] = data["grindClicks"]
        if "waterVolumeMl" in data:
            update_data["water_volume_ml"] = data["waterVolumeMl"]
        if "notes" in data:
            update_data["notes"] = data["notes"]

        if not update_data:
            return existing

        from app.models.batch_brew_recipe import now_iso
        update_data["updated_at"] = now_iso()

        await self.session.execute(
            update(BatchBrewRecipe).where(BatchBrewRecipe.id == recipe_id).values(**update_data)
        )
        await self.session.commit()
        return await self.get(recipe_id)

    async def delete(self, recipe_id: str) -> bool:
        result = await self.session.execute(
            delete(BatchBrewRecipe).where(BatchBrewRecipe.id == recipe_id)
        )
        await self.session.commit()
        return result.rowcount > 0
