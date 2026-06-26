from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class SignatureTtk(Base):
    __tablename__ = "signature_drinks_ttk"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    folder_id: Mapped[str | None] = mapped_column(String, nullable=True, default=None)
    drink_name: Mapped[str] = mapped_column(String, nullable=False)
    category: Mapped[str] = mapped_column(String, nullable=False)
    serving_volume_ml: Mapped[int] = mapped_column(Integer, nullable=False)
    vessel: Mapped[str] = mapped_column(String, default="")
    image_url: Mapped[str] = mapped_column(String, default="")
    ingredients: Mapped[str] = mapped_column(Text, default="[]")
    service_steps: Mapped[str] = mapped_column(Text, default="[]")
    allergens_and_composition: Mapped[str] = mapped_column(Text, default="")
    storage_conditions: Mapped[str] = mapped_column(String, default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[str] = mapped_column(String, default=now_iso)
    updated_at: Mapped[str] = mapped_column(String, default=now_iso)
