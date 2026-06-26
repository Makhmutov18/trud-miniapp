from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

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


@app.on_event("startup")
async def startup() -> None:
    """Initialize database and Telegram on startup."""
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

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
    index = FRONTEND_DIST / "index.html"
    if not index.exists():
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Frontend build not found")
    requested = FRONTEND_DIST / path
    if requested.is_file():
        return FileResponse(str(requested))
    return FileResponse(str(index))
