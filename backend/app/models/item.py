from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class Item(Base):
    __tablename__ = "items"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    category: Mapped[str] = mapped_column(String, nullable=False)
    subcategory: Mapped[str] = mapped_column(String, default="")
    title: Mapped[str] = mapped_column(String, nullable=False)
    subtitle: Mapped[str] = mapped_column(String, default="")
    description: Mapped[str] = mapped_column(Text, default="")
    price: Mapped[int | None] = mapped_column(Integer, nullable=True)
    image_url: Mapped[str] = mapped_column(String, default="")
    specs: Mapped[str] = mapped_column(Text, default="[]")
    steps: Mapped[str] = mapped_column(Text, default="[]")
    tags: Mapped[str] = mapped_column(Text, default="[]")
    is_favorite: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[str] = mapped_column(String, default=now_iso)
    updated_at: Mapped[str] = mapped_column(String, default=now_iso)