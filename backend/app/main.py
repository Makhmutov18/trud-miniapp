from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.config import settings
from app.database import async_session, engine, Base
from app.routers import items, recipes, brew_history, calculation, telegram
from app.seed import seed_database
from app.services.telegram_service import configure_telegram

load_dotenv()

FRONTEND_DIST = Path(__file__).resolve().parents[2] / "frontend" / "dist"

app = FastAPI(title="TRUD Mini App API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(items.router)
app.include_router(recipes.router)
app.include_router(brew_history.router)
app.include_router(calculation.router)
app.include_router(telegram.router)


async def ensure_runtime_columns(conn) -> None:
    """Keep deployed databases compatible when Alembic was not run manually."""
    columns_by_table = {
        "brew_bar_recipes": {
            "folder_id": "VARCHAR",
            "origin": "VARCHAR NOT NULL DEFAULT ''",
            "processing": "VARCHAR NOT NULL DEFAULT ''",
            "grinder": "VARCHAR NOT NULL DEFAULT ''",
            "temperature": "FLOAT",
            "water_ppm": "INTEGER",
            "cup_description": "TEXT NOT NULL DEFAULT ''",
        },
        "batch_brew_recipes": {
            "folder_id": "VARCHAR",
            "thermos_volume_ml": "INTEGER NOT NULL DEFAULT 0",
            "ratio": "VARCHAR NOT NULL DEFAULT ''",
            "grind_clicks": "VARCHAR NOT NULL DEFAULT ''",
        },
        "signature_drinks_ttk": {
            "folder_id": "VARCHAR",
            "image_url": "VARCHAR NOT NULL DEFAULT ''",
        },
        "items": {
            "composition": "TEXT NOT NULL DEFAULT ''",
            "shelf_life": "VARCHAR NOT NULL DEFAULT ''",
        },
    }

    for table, columns in columns_by_table.items():
        if conn.dialect.name == "sqlite":
            result = await conn.execute(text(f"PRAGMA table_info({table})"))
            existing_columns = {row[1] for row in result.fetchall()}
            for column_name, definition in columns.items():
                if column_name not in existing_columns:
                    await conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column_name} {definition}"))
        else:
            for column_name, definition in columns.items():
                await conn.execute(text(f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {column_name} {definition}"))


@app.on_event("startup")
async def startup() -> None:
    """Initialize database and Telegram on startup."""
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await ensure_runtime_columns(conn)

    # Seed data
    async with async_session() as db:
        await seed_database(db)

    # Configure Telegram (non-fatal — app works without it)
    if settings.bot_token and settings.public_base_url:
        try:
            await configure_telegram()
        except Exception:
            import logging
            logger = logging.getLogger(__name__)
            logger.warning("Telegram webhook setup failed — app will still work", exc_info=True)


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "trud-miniapp"}


@app.get("/api/debug/routes")
async def debug_routes() -> list[dict[str, object]]:
    routes: list[dict[str, object]] = []
    for route in app.routes:
        routes.append(
            {
                "path": route.path,
                "methods": sorted(list(route.methods)) if getattr(route, "methods", None) else [],
            }
        )
    return routes


# Serve static frontend files
if FRONTEND_DIST.exists():
    assets_dir = FRONTEND_DIST / "assets"
    brand_dir = FRONTEND_DIST / "brand"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")
    if brand_dir.exists():
        app.mount("/brand", StaticFiles(directory=str(brand_dir)), name="brand")


@app.get("/{path:path}", include_in_schema=False)
async def serve_spa(path: str) -> FileResponse:
    """Serve SPA for all non-API routes."""
    if path == "api" or path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API route not found")
    index = FRONTEND_DIST / "index.html"
    if not index.exists():
        raise HTTPException(status_code=404, detail="Frontend build not found")
    requested = FRONTEND_DIST / path
    if requested.is_file():
        return FileResponse(str(requested))
    return FileResponse(str(index))
