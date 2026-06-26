from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.repositories.brew_bar_repository import BrewBarRepository
from app.repositories.batch_brew_repository import BatchBrewRepository
from app.repositories.signature_ttk_repository import SignatureTtkRepository
from app.schemas.brew_bar import BrewBarCreate, BrewBarUpdate
from app.schemas.batch_brew import BatchBrewCreate, BatchBrewUpdate
from app.schemas.signature_ttk import SignatureTtkCreate, SignatureTtkUpdate
from app.services.recipe_service import RecipeService

router = APIRouter(prefix="/api/recipes", tags=["recipes"])


async def get_recipe_service(db: AsyncSession = Depends(get_db)) -> RecipeService:
    return RecipeService(
        brew_bar_repo=BrewBarRepository(db),
        batch_brew_repo=BatchBrewRepository(db),
        signature_ttk_repo=SignatureTtkRepository(db),
    )


@router.get("")
async def list_recipes(
    type: str | None = Query(default=None, alias="type"),
    service: RecipeService = Depends(get_recipe_service),
):
    return await service.list_by_type(type)


# === Brew Bar ===

@router.get("/brew-bar")
async def list_brew_bar(
    method: str | None = Query(default=None, alias="method"),
    service: RecipeService = Depends(get_recipe_service),
):
    return await service.list_brew_bar(method)


@router.post("/brew-bar", status_code=201)
async def create_brew_bar(
    payload: BrewBarCreate,
    service: RecipeService = Depends(get_recipe_service),
):
    return await service.create_brew_bar(payload)


@router.get("/brew-bar/{recipe_id}")
async def get_brew_bar(
    recipe_id: str,
    service: RecipeService = Depends(get_recipe_service),
):
    recipe = await service.get_brew_bar(recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Brew bar recipe not found")
    return recipe


@router.put("/brew-bar/{recipe_id}")
async def replace_brew_bar(
    recipe_id: str,
    payload: BrewBarCreate,
    service: RecipeService = Depends(get_recipe_service),
):
    recipe = await service.replace_brew_bar(recipe_id, payload)
    if not recipe:
        raise HTTPException(status_code=404, detail="Brew bar recipe not found")
    return recipe


@router.patch("/brew-bar/{recipe_id}")
async def update_brew_bar(
    recipe_id: str,
    payload: BrewBarUpdate,
    service: RecipeService = Depends(get_recipe_service),
):
    recipe = await service.update_brew_bar(recipe_id, payload)
    if not recipe:
        raise HTTPException(status_code=404, detail="Brew bar recipe not found")
    return recipe


# === Batch Brew ===

@router.get("/batch-brew")
async def list_batch_brew(
    service: RecipeService = Depends(get_recipe_service),
):
    return await service.list_batch_brew()


@router.post("/batch-brew", status_code=201)
async def create_batch_brew(
    payload: BatchBrewCreate,
    service: RecipeService = Depends(get_recipe_service),
):
    return await service.create_batch_brew(payload)


@router.get("/batch-brew/{recipe_id}")
async def get_batch_brew(
    recipe_id: str,
    service: RecipeService = Depends(get_recipe_service),
):
    recipe = await service.get_batch_brew(recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Batch brew recipe not found")
    return recipe


@router.put("/batch-brew/{recipe_id}")
async def replace_batch_brew(
    recipe_id: str,
    payload: BatchBrewCreate,
    service: RecipeService = Depends(get_recipe_service),
):
    recipe = await service.replace_batch_brew(recipe_id, payload)
    if not recipe:
        raise HTTPException(status_code=404, detail="Batch brew recipe not found")
    return recipe


@router.patch("/batch-brew/{recipe_id}")
async def update_batch_brew(
    recipe_id: str,
    payload: BatchBrewUpdate,
    service: RecipeService = Depends(get_recipe_service),
):
    recipe = await service.update_batch_brew(recipe_id, payload)
    if not recipe:
        raise HTTPException(status_code=404, detail="Batch brew recipe not found")
    return recipe


# === Signature TTK ===

@router.get("/signature-ttk")
async def list_signature_ttk(
    category: str | None = Query(default=None, alias="category"),
    service: RecipeService = Depends(get_recipe_service),
):
    return await service.list_signature_ttk(category)


@router.post("/signature-ttk", status_code=201)
async def create_signature_ttk(
    payload: SignatureTtkCreate,
    service: RecipeService = Depends(get_recipe_service),
):
    return await service.create_signature_ttk(payload)


@router.get("/signature-ttk/{ttk_id}")
async def get_signature_ttk(
    ttk_id: str,
    service: RecipeService = Depends(get_recipe_service),
):
    ttk = await service.get_signature_ttk(ttk_id)
    if not ttk:
        raise HTTPException(status_code=404, detail="Signature TTK not found")
    return ttk


@router.put("/signature-ttk/{ttk_id}")
async def replace_signature_ttk(
    ttk_id: str,
    payload: SignatureTtkCreate,
    service: RecipeService = Depends(get_recipe_service),
):
    ttk = await service.replace_signature_ttk(ttk_id, payload)
    if not ttk:
        raise HTTPException(status_code=404, detail="Signature TTK not found")
    return ttk


@router.patch("/signature-ttk/{ttk_id}")
async def update_signature_ttk(
    ttk_id: str,
    payload: SignatureTtkUpdate,
    service: RecipeService = Depends(get_recipe_service),
):
    ttk = await service.update_signature_ttk(ttk_id, payload)
    if not ttk:
        raise HTTPException(status_code=404, detail="Signature TTK not found")
    return ttk