"""initial migration

Revision ID: 001
Revises:
Create Date: 2026-06-26 16:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- items ---
    op.create_table(
        "items",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("category", sa.String(), nullable=False),
        sa.Column("subcategory", sa.String(), nullable=False, server_default=""),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("subtitle", sa.String(), nullable=False, server_default=""),
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
        sa.Column("price", sa.Integer(), nullable=True),
        sa.Column("image_url", sa.String(), nullable=False, server_default=""),
        sa.Column("specs", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("steps", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("tags", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("is_favorite", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.String(), nullable=False),
        sa.Column("updated_at", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    # --- brew_history ---
    op.create_table(
        "brew_history",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("item_id", sa.String(), nullable=True),
        sa.Column("coffee_beans", sa.String(), nullable=False, server_default=""),
        sa.Column("brew_method", sa.String(), nullable=False, server_default=""),
        sa.Column("weight_in", sa.Float(), nullable=False),
        sa.Column("weight_out", sa.Float(), nullable=False),
        sa.Column("brew_time", sa.Integer(), nullable=False),
        sa.Column("temperature", sa.Float(), nullable=True),
        sa.Column("tds", sa.Float(), nullable=True),
        sa.Column("extraction", sa.Float(), nullable=True),
        sa.Column("status", sa.String(), nullable=False, server_default="within_spec"),
        sa.Column("created_at", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    # --- brew_bar_recipes ---
    op.create_table(
        "brew_bar_recipes",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("lot_name", sa.String(), nullable=False),
        sa.Column("roaster", sa.String(), nullable=False, server_default=""),
        sa.Column("method", sa.String(), nullable=False),
        sa.Column("grind_clicks", sa.String(), nullable=False, server_default=""),
        sa.Column("coffee_weight_g", sa.Float(), nullable=False),
        sa.Column("water_volume_ml", sa.Float(), nullable=False),
        sa.Column("steps", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("notes", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_at", sa.String(), nullable=False),
        sa.Column("updated_at", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    # --- batch_brew_recipes ---
    op.create_table(
        "batch_brew_recipes",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("lot_name", sa.String(), nullable=False),
        sa.Column("roaster", sa.String(), nullable=False, server_default=""),
        sa.Column("thermos_volume_ml", sa.Integer(), nullable=False),
        sa.Column("coffee_dose_g", sa.Float(), nullable=False),
        sa.Column("ratio", sa.String(), nullable=False, server_default=""),
        sa.Column("water_volume_ml", sa.Float(), nullable=False),
        sa.Column("brewer_program", sa.String(), nullable=False, server_default=""),
        sa.Column("notes", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_at", sa.String(), nullable=False),
        sa.Column("updated_at", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    # --- signature_drinks_ttk ---
    op.create_table(
        "signature_drinks_ttk",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("drink_name", sa.String(), nullable=False),
        sa.Column("category", sa.String(), nullable=False),
        sa.Column("serving_volume_ml", sa.Integer(), nullable=False),
        sa.Column("vessel", sa.String(), nullable=False, server_default=""),
        sa.Column("image_url", sa.String(), nullable=False, server_default=""),
        sa.Column("ingredients", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("service_steps", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("allergens_and_composition", sa.Text(), nullable=False, server_default=""),
        sa.Column("storage_conditions", sa.String(), nullable=False, server_default=""),
        sa.Column("notes", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_at", sa.String(), nullable=False),
        sa.Column("updated_at", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    # --- users ---
    op.create_table(
        "users",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("telegram_id", sa.Integer(), nullable=False),
        sa.Column("first_name", sa.String(), nullable=False, server_default=""),
        sa.Column("role", sa.String(), nullable=False, server_default="barista"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("telegram_id"),
    )


def downgrade() -> None:
    op.drop_table("users")
    op.drop_table("signature_drinks_ttk")
    op.drop_table("batch_brew_recipes")
    op.drop_table("brew_bar_recipes")
    op.drop_table("brew_history")
    op.drop_table("items")