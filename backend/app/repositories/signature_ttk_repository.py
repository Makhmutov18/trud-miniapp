from __future__ import annotations

import json
from typing import Any

from sqlalchemy import select, delete, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.signature_ttk import SignatureTtk


def encode(value: Any) -> str:
    return json.dumps(value or [], ensure_ascii=False)


class SignatureTtkRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list(self, category: str | None = None) -> list[SignatureTtk]:
        query = select(SignatureTtk)
        if category:
            query = query.where(SignatureTtk.category == category)
        query = query.order_by(SignatureTtk.drink_name)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get(self, ttk_id: str) -> SignatureTtk | None:
        result = await self.session.execute(
            select(SignatureTtk).where(SignatureTtk.id == ttk_id)
        )
        return result.scalar_one_or_none()

    async def create(self, data: dict[str, Any]) -> SignatureTtk:
        ttk = SignatureTtk(
            drink_name=data.get("drinkName") or data.get("drink_name") or "",
            category=data.get("category", "hot"),
            serving_volume_ml=data.get("servingVolumeMl") or data.get("serving_volume_ml") or 0,
            vessel=data.get("vessel", ""),
            image_url=data.get("imageUrl") or data.get("image_url") or "",
            ingredients=encode(data.get("ingredients", [])),
            service_steps=encode(data.get("serviceSteps") or data.get("service_steps") or []),
            allergens_and_composition=data.get("allergensAndComposition") or data.get("allergens_and_composition") or "",
            storage_conditions=data.get("storageConditions") or data.get("storage_conditions") or "",
            notes=data.get("notes", ""),
        )
        self.session.add(ttk)
        await self.session.commit()
        await self.session.refresh(ttk)
        return ttk

    async def replace(self, ttk_id: str, data: dict[str, Any]) -> SignatureTtk | None:
        """Full replacement (PUT) — delete and recreate."""
        existing = await self.get(ttk_id)
        if not existing:
            return None
        await self.session.execute(
            delete(SignatureTtk).where(SignatureTtk.id == ttk_id)
        )
        await self.session.flush()
        return await self.create({**data, "id": ttk_id})

    async def update(self, ttk_id: str, data: dict[str, Any]) -> SignatureTtk | None:
        existing = await self.get(ttk_id)
        if not existing:
            return None

        update_data = {}
        if "drinkName" in data:
            update_data["drink_name"] = data["drinkName"]
        if "category" in data:
            update_data["category"] = data["category"]
        if "servingVolumeMl" in data:
            update_data["serving_volume_ml"] = data["servingVolumeMl"]
        if "vessel" in data:
            update_data["vessel"] = data["vessel"]
        if "imageUrl" in data:
            update_data["image_url"] = data["imageUrl"]
        if "ingredients" in data:
            update_data["ingredients"] = encode(data["ingredients"])
        if "serviceSteps" in data:
            update_data["service_steps"] = encode(data["serviceSteps"])
        if "allergensAndComposition" in data:
            update_data["allergens_and_composition"] = data["allergensAndComposition"]
        if "storageConditions" in data:
            update_data["storage_conditions"] = data["storageConditions"]
        if "notes" in data:
            update_data["notes"] = data["notes"]

        if not update_data:
            return existing

        from app.models.signature_ttk import now_iso
        update_data["updated_at"] = now_iso()

        await self.session.execute(
            update(SignatureTtk).where(SignatureTtk.id == ttk_id).values(**update_data)
        )
        await self.session.commit()
        return await self.get(ttk_id)

    async def delete(self, ttk_id: str) -> bool:
        result = await self.session.execute(
            delete(SignatureTtk).where(SignatureTtk.id == ttk_id)
        )
        await self.session.commit()
        return result.rowcount > 0