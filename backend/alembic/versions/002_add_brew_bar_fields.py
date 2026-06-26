"""add origin, processing, grinder, temperature, water_ppm to brew_bar_recipes

Revision ID: 002
Revises: 001
Create Date: 2026-06-26 20:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("brew_bar_recipes", sa.Column("origin", sa.String(), nullable=False, server_default=""))
    op.add_column("brew_bar_recipes", sa.Column("processing", sa.String(), nullable=False, server_default=""))
    op.add_column("brew_bar_recipes", sa.Column("grinder", sa.String(), nullable=False, server_default=""))
    op.add_column("brew_bar_recipes", sa.Column("temperature", sa.Float(), nullable=True))
    op.add_column("brew_bar_recipes", sa.Column("water_ppm", sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column("brew_bar_recipes", "water_ppm")
    op.drop_column("brew_bar_recipes", "temperature")
    op.drop_column("brew_bar_recipes", "grinder")
    op.drop_column("brew_bar_recipes", "processing")
    op.drop_column("brew_bar_recipes", "origin")