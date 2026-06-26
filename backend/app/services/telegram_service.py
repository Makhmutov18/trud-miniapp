from __future__ import annotations

import hashlib
import hmac
from typing import Any
from urllib.parse import parse_qsl

import httpx

from app.config import settings


def verify_init_data(init_data: str) -> dict[str, Any] | None:
    """Verify Telegram initData and return user data if valid."""
    if not settings.bot_token:
        return None

    pairs = dict(parse_qsl(init_data, keep_blank_values=True))
    received_hash = pairs.pop("hash", None)
    if not received_hash:
        return None

    data_check_string = "\n".join(
        f"{key}={value}" for key, value in sorted(pairs.items())
    )
    secret_key = hmac.new(
        b"WebAppData", settings.bot_token.encode(), hashlib.sha256
    ).digest()
    calculated_hash = hmac.new(
        secret_key, data_check_string.encode(), hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(calculated_hash, received_hash):
        return None

    # Extract user info from initData
    user_raw = pairs.get("user")
    if user_raw:
        import json
        try:
            return json.loads(user_raw)
        except (json.JSONDecodeError, TypeError):
            pass

    return {"authenticated": True}


async def telegram_api(method: str, payload: dict[str, Any]) -> None:
    """Call Telegram Bot API method."""
    if not settings.bot_token:
        return
    url = f"https://api.telegram.org/bot{settings.bot_token}/{method}"
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(url, json=payload)
        response.raise_for_status()


async def configure_telegram() -> None:
    """Set up webhook, commands, and menu button on startup."""
    webhook_url = f"{settings.public_base_url}/telegram/webhook/{settings.webhook_secret}"
    app_url = settings.web_app_url or settings.public_base_url

    await telegram_api("setWebhook", {"url": webhook_url})
    await telegram_api("setMyCommands", {
        "commands": [
            {"command": "start", "description": "Открыть базу бара"},
            {"command": "app", "description": "Открыть mini app"},
        ]
    })
    await telegram_api("setChatMenuButton", {
        "menu_button": {
            "type": "web_app",
            "text": "ТРУД",
            "web_app": {"url": app_url},
        }
    })


async def send_start_message(chat_id: int) -> None:
    """Send welcome message with mini app button."""
    app_url = settings.web_app_url or settings.public_base_url
    await telegram_api("sendMessage", {
        "chat_id": chat_id,
        "text": "Открывай базу бара: рецепты, кондитерка и чек-листы в одном месте.",
        "reply_markup": {
            "inline_keyboard": [
                [{"text": "Открыть ТРУД", "web_app": {"url": app_url}}]
            ]
        },
    })