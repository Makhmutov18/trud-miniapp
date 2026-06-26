"""add pastry composition, shelf life, and brew cup description

Revision ID: 004
Revises: 003
Create Date: 2026-06-27 01:30:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "004"
down_revision: Union[str, None] = "003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("brew_bar_recipes", sa.Column("cup_description", sa.Text(), nullable=False, server_default=""))
    op.add_column("items", sa.Column("composition", sa.Text(), nullable=False, server_default=""))
    op.add_column("items", sa.Column("shelf_life", sa.String(), nullable=False, server_default=""))


def downgrade() -> None:
    op.drop_column("items", "shelf_life")
    op.drop_column("items", "composition")
    op.drop_column("brew_bar_recipes", "cup_description")
