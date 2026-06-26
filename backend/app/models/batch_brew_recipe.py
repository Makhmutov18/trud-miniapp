from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class BatchBrewRecipe(Base):
    __tablename__ = "batch_brew_recipes"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    lot_name: Mapped[str] = mapped_column(String, nullable=False)
    roaster: Mapped[str] = mapped_column(String, default="")
    thermos_volume_ml: Mapped[int] = mapped_column(Integer, nullable=False)
    coffee_dose_g: Mapped[float] = mapped_column(Float, nullable=False)
    ratio: Mapped[str] = mapped_column(String, default="")
    water_volume_ml: Mapped[float] = mapped_column(Float, nullable=False)
    brewer_program: Mapped[str] = mapped_column(String, default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[str] = mapped_column(String, default=now_iso)
    updated_at: Mapped[str] = mapped_column(String, default=now_iso)