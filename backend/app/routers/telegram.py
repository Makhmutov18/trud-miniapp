from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request

from app.config import settings
from app.services.telegram_service import send_start_message, verify_init_data

router = APIRouter(tags=["telegram"])


@router.post("/api/telegram/validate")
async def validate_init_data(payload: dict):
    """Validate Telegram initData."""
    init_data = payload.get("initData", "")
    if not settings.bot_token:
        return {"ok": False, "reason": "BOT_TOKEN is not configured"}
    user = verify_init_data(init_data)
    return {"ok": user is not None}


@router.post("/telegram/webhook/{secret}")
async def telegram_webhook(secret: str, request: Request):
    """Telegram bot webhook handler."""
    if secret != settings.webhook_secret:
        raise HTTPException(status_code=403, detail="Bad webhook secret")

    update = await request.json()
    message = update.get("message") or update.get("edited_message") or {}
    chat = message.get("chat") or {}
    text = (message.get("text") or "").strip()
    chat_id = chat.get("id")

    if chat_id and text.startswith("/start"):
        await send_start_message(chat_id)

    return {"ok": True}