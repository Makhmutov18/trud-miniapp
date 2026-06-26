from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.repositories.brew_history_repository import BrewHistoryRepository
from app.schemas.brew_history import BrewHistoryCreate
from app.services.brew_history_service import BrewHistoryService

router = APIRouter(prefix="/api/brew-history", tags=["brew_history"])


async def get_history_service(db: AsyncSession = Depends(get_db)) -> BrewHistoryService:
    return BrewHistoryService(BrewHistoryRepository(db))


@router.get("")
async def list_brew_history(
    limit: int = Query(default=100, ge=1, le=1000),
    service: BrewHistoryService = Depends(get_history_service),
):
    return await service.list_history(limit)


@router.post("", status_code=201)
async def save_brew_history(
    payload: BrewHistoryCreate,
    service: BrewHistoryService = Depends(get_history_service),
):
    return await service.save_history(payload)