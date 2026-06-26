"""add folder_id to recipe tables

Revision ID: 003
Revises: 002
Create Date: 2026-06-27 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("brew_bar_recipes", sa.Column("folder_id", sa.String(), nullable=True))
    op.add_column("batch_brew_recipes", sa.Column("folder_id", sa.String(), nullable=True))
    op.add_column("signature_drinks_ttk", sa.Column("folder_id", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("signature_drinks_ttk", "folder_id")
    op.drop_column("batch_brew_recipes", "folder_id")
    op.drop_column("brew_bar_recipes", "folder_id")
