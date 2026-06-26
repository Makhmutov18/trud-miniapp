from __future__ import annotations

from typing import Any

from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.brew_history import BrewHistory


class BrewHistoryRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list(self, limit: int = 100) -> list[BrewHistory]:
        result = await self.session.execute(
            select(BrewHistory).order_by(desc(BrewHistory.created_at)).limit(limit)
        )
        return list(result.scalars().all())

    async def create(self, data: dict[str, Any]) -> BrewHistory:
        extraction = data.get("extraction")
        status = "within_spec"
        if extraction is not None:
            try:
                value = float(extraction)
                if value < 18 or value > 22:
                    status = "out_of_limits"
            except (TypeError, ValueError):
                pass

        record = BrewHistory(
            item_id=data.get("itemId") or data.get("item_id"),
            coffee_beans=data.get("coffeeBeans") or data.get("coffee_beans") or "",
            brew_method=data.get("brewMethod") or data.get("brew_method") or "",
            weight_in=float(data.get("weightIn") or data.get("weight_in") or 0),
            weight_out=float(data.get("weightOut") or data.get("weight_out") or 0),
            brew_time=int(data.get("brewTime") or data.get("brew_time") or 0),
            temperature=data.get("temperature"),
            tds=data.get("tds"),
            extraction=extraction,
            status=status,
        )
        self.session.add(record)
        await self.session.commit()
        await self.session.refresh(record)
        return record