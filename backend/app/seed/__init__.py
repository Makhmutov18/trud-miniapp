from __future__ import annotations

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.item import Item
from app.models.brew_bar_recipe import BrewBarRecipe
from app.models.batch_brew_recipe import BatchBrewRecipe
from app.models.signature_ttk import SignatureTtk
from app.repositories.item_repository import ItemRepository
from app.repositories.brew_bar_repository import BrewBarRepository
from app.repositories.batch_brew_repository import BatchBrewRepository
from app.repositories.signature_ttk_repository import SignatureTtkRepository
from app.seed.items import SEED_ITEMS
from app.seed.recipes import (
    SEED_BATCH_BREW_RECIPES,
    SEED_BREW_BAR_RECIPES,
    SEED_SIGNATURE_TTKS,
)


async def seed_database(db: AsyncSession) -> None:
    """Seed database with initial data if tables are empty."""

    # Seed items
    count = await db.execute(select(func.count(Item.id)))
    if count.scalar() == 0:
        repo = ItemRepository(db)
        for item_data in SEED_ITEMS:
            await repo.create(item_data)

    # Seed brew bar recipes
    count = await db.execute(select(func.count(BrewBarRecipe.id)))
    if count.scalar() == 0:
        repo = BrewBarRepository(db)
        for recipe_data in SEED_BREW_BAR_RECIPES:
            await repo.create(recipe_data)

    # Seed batch brew recipes
    count = await db.execute(select(func.count(BatchBrewRecipe.id)))
    if count.scalar() == 0:
        repo = BatchBrewRepository(db)
        for recipe_data in SEED_BATCH_BREW_RECIPES:
            await repo.create(recipe_data)

    # Seed signature TTKs
    count = await db.execute(select(func.count(SignatureTtk.id)))
    if count.scalar() == 0:
        repo = SignatureTtkRepository(db)
        for ttk_data in SEED_SIGNATURE_TTKS:
            await repo.create(ttk_data)