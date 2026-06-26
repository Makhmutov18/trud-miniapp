from __future__ import annotations

from typing import Any

from app.repositories.brew_history_repository import BrewHistoryRepository
from app.schemas.brew_history import BrewHistoryCreate


class BrewHistoryService:
    def __init__(self, repo: BrewHistoryRepository):
        self.repo = repo

    async def list_history(self, limit: int = 100) -> list[dict[str, Any]]:
        records = await self.repo.list(limit)
        return [
            {
                "id": r.id,
                "itemId": r.item_id,
                "coffeeBeans": r.coffee_beans,
                "brewMethod": r.brew_method,
                "weightIn": r.weight_in,
                "weightOut": r.weight_out,
                "brewTime": r.brew_time,
                "temperature": r.temperature,
                "tds": r.tds,
                "extraction": r.extraction,
                "status": r.status,
                "createdAt": r.created_at,
            }
            for r in records
        ]

    async def save_history(self, payload: BrewHistoryCreate) -> dict[str, Any]:
        record = await self.repo.create(payload.model_dump())
        return {
            "id": record.id,
            "itemId": record.item_id,
            "coffeeBeans": record.coffee_beans,
            "brewMethod": record.brew_method,
            "weightIn": record.weight_in,
            "weightOut": record.weight_out,
            "brewTime": record.brew_time,
            "temperature": record.temperature,
            "tds": record.tds,
            "extraction": record.extraction,
            "status": record.status,
            "createdAt": record.created_at,
        }