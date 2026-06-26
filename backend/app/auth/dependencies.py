from __future__ import annotations

from fastapi import Header, HTTPException

from app.services.telegram_service import verify_init_data


async def get_current_user(x_telegram_init_data: str = Header(...)):
    """Extract and verify Telegram user from initData header."""
    user_data = verify_init_data(x_telegram_init_data)
    if not user_data:
        raise HTTPException(
            status_code=401,
            detail="Invalid or missing Telegram authentication",
        )
    return user_data


async def optional_user(x_telegram_init_data: str | None = Header(default=None)):
    """Optionally extract Telegram user (does not fail if missing)."""
    if not x_telegram_init_data:
        return None
    return verify_init_data(x_telegram_init_data)