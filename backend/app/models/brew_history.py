from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class BrewHistory(Base):
    __tablename__ = "brew_history"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    item_id: Mapped[str | None] = mapped_column(String, nullable=True)
    coffee_beans: Mapped[str] = mapped_column(String, default="")
    brew_method: Mapped[str] = mapped_column(String, default="")
    weight_in: Mapped[float] = mapped_column(Float, nullable=False)
    weight_out: Mapped[float] = mapped_column(Float, nullable=False)
    brew_time: Mapped[int] = mapped_column(Integer, nullable=False)
    temperature: Mapped[float | None] = mapped_column(Float, nullable=True)
    tds: Mapped[float | None] = mapped_column(Float, nullable=True)
    extraction: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String, default="within_spec")
    created_at: Mapped[str] = mapped_column(String, default=now_iso)