from __future__ import annotations

import json
from typing import Any

from sqlalchemy import select, delete, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.item import Item


def encode(value: Any) -> str:
    return json.dumps(value or [], ensure_ascii=False)


def decode(value: str | None, fallback: Any) -> Any:
    if not value:
        return fallback
    try:
        return json.loads(value)
    except (json.JSONDecodeError, TypeError):
        return fallback


class ItemRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list(self, category: str | None = None) -> list[Item]:
        query = select(Item)
        if category:
            query = query.where(Item.category == category)
        query = query.order_by(Item.category, Item.subcategory, Item.title)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get(self, item_id: str) -> Item | None:
        result = await self.session.execute(select(Item).where(Item.id == item_id))
        return result.scalar_one_or_none()

    async def create(self, data: dict[str, Any]) -> Item:
        item = Item(
            category=data.get("category", "coffee"),
            subcategory=data.get("subcategory", ""),
            title=data.get("title", "").strip(),
            subtitle=data.get("subtitle", "").strip(),
            description=data.get("description", "").strip(),
            composition=(data.get("composition") or "").strip(),
            shelf_life=(data.get("shelfLife") or data.get("shelf_life") or "").strip(),
            price=data.get("price"),
            image_url=data.get("imageUrl") or data.get("image_url") or "",
            specs=encode(data.get("specs", [])),
            steps=encode(data.get("steps", [])),
            tags=encode(data.get("tags", [])),
            is_favorite=1 if data.get("isFavorite") else 0,
        )
        self.session.add(item)
        await self.session.commit()
        await self.session.refresh(item)
        return item

    async def update(self, item_id: str, data: dict[str, Any]) -> Item | None:
        existing = await self.get(item_id)
        if not existing:
            return None

        update_data = {}
        if "category" in data:
            update_data["category"] = data["category"]
        if "subcategory" in data:
            update_data["subcategory"] = data["subcategory"]
        if "title" in data:
            update_data["title"] = data["title"].strip()
        if "subtitle" in data:
            update_data["subtitle"] = data["subtitle"].strip()
        if "description" in data:
            update_data["description"] = data["description"].strip()
        if "composition" in data:
            update_data["composition"] = data["composition"].strip()
        if "shelfLife" in data or "shelf_life" in data:
            update_data["shelf_life"] = (data.get("shelfLife") or data.get("shelf_life") or "").strip()
        if "price" in data:
            update_data["price"] = data["price"]
        if "imageUrl" in data or "image_url" in data:
            update_data["image_url"] = data.get("imageUrl") or data.get("image_url") or ""
        if "specs" in data:
            update_data["specs"] = encode(data["specs"])
        if "steps" in data:
            update_data["steps"] = encode(data["steps"])
        if "tags" in data:
            update_data["tags"] = encode(data["tags"])
        if "isFavorite" in data:
            update_data["is_favorite"] = 1 if data["isFavorite"] else 0

        if not update_data:
            return existing

        from app.models.item import now_iso
        update_data["updated_at"] = now_iso()

        await self.session.execute(
            update(Item).where(Item.id == item_id).values(**update_data)
        )
        await self.session.commit()
        return await self.get(item_id)

    async def delete(self, item_id: str) -> bool:
        result = await self.session.execute(
            delete(Item).where(Item.id == item_id)
        )
        await self.session.commit()
        return result.rowcount > 0
