from __future__ import annotations

from typing import Any

from app.repositories.item_repository import ItemRepository
from app.schemas.item import ItemCreate, ItemUpdate, ItemResponse


def _row_to_response(row: Any) -> dict[str, Any]:
    """Convert ORM model to API response dict."""
    import json
    return {
        "id": row.id,
        "category": row.category,
        "subcategory": row.subcategory,
        "title": row.title,
        "subtitle": row.subtitle,
        "description": row.description,
        "price": row.price,
        "imageUrl": row.image_url,
        "specs": json.loads(row.specs) if row.specs else [],
        "steps": json.loads(row.steps) if row.steps else [],
        "tags": json.loads(row.tags) if row.tags else [],
        "isFavorite": bool(row.is_favorite),
        "createdAt": row.created_at,
        "updatedAt": row.updated_at,
    }


class ItemService:
    def __init__(self, repo: ItemRepository):
        self.repo = repo

    async def list_items(self, category: str | None = None) -> list[dict[str, Any]]:
        items = await self.repo.list(category)
        return [_row_to_response(item) for item in items]

    async def get_item(self, item_id: str) -> dict[str, Any] | None:
        item = await self.repo.get(item_id)
        return _row_to_response(item) if item else None

    async def create_item(self, payload: ItemCreate) -> dict[str, Any]:
        item = await self.repo.create(payload.model_dump())
        return _row_to_response(item)

    async def update_item(self, item_id: str, payload: ItemUpdate) -> dict[str, Any] | None:
        item = await self.repo.update(item_id, payload.model_dump(exclude_none=True))
        return _row_to_response(item) if item else None

    async def delete_item(self, item_id: str) -> bool:
        return await self.repo.delete(item_id)