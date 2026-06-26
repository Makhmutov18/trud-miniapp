from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.repositories.item_repository import ItemRepository
from app.schemas.item import ItemCreate, ItemUpdate
from app.services.item_service import ItemService

router = APIRouter(prefix="/api/items", tags=["items"])


async def get_item_service(db: AsyncSession = Depends(get_db)) -> ItemService:
    return ItemService(ItemRepository(db))


@router.get("")
async def list_items(
    category: str | None = None,
    service: ItemService = Depends(get_item_service),
):
    return await service.list_items(category)


@router.get("/{item_id}")
async def get_item(
    item_id: str,
    service: ItemService = Depends(get_item_service),
):
    item = await service.get_item(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.post("", status_code=201)
async def create_item(
    payload: ItemCreate,
    service: ItemService = Depends(get_item_service),
):
    return await service.create_item(payload)


@router.patch("/{item_id}")
async def update_item(
    item_id: str,
    payload: ItemUpdate,
    service: ItemService = Depends(get_item_service),
):
    item = await service.update_item(item_id, payload)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.delete("/{item_id}")
async def delete_item(
    item_id: str,
    service: ItemService = Depends(get_item_service),
):
    if not await service.delete_item(item_id):
        raise HTTPException(status_code=404, detail="Item not found")
    return {"ok": True}