"""add grind_clicks to batch_brew_recipes

Revision ID: 005
Revises: 004
Create Date: 2026-06-27 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "005"
down_revision: Union[str, None] = "004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "batch_brew_recipes",
        sa.Column("grind_clicks", sa.String(), nullable=False, server_default=""),
    )


def downgrade() -> None:
    op.drop_column("batch_brew_recipes", "grind_clicks")
