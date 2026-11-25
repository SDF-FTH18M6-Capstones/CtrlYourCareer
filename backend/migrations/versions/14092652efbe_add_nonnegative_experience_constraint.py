"""Add nonnegative experience constraint

Revision ID: 14092652efbe
Revises: f89abfd4df07
Create Date: 2026-11-25 12:03:47.772670

"""

from alembic import op
import sqlalchemy as sa


# Revision identifiers, used by Alembic.
revision = "14092652efbe"
down_revision = "f89abfd4df07"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table(
        "user_skills",
        schema=None,
    ) as batch_op:

        batch_op.create_check_constraint(
            "check_nonnegative_experience",
            "years_experience IS NULL OR years_experience >= 0",
        )


def downgrade():
    with op.batch_alter_table(
        "user_skills",
        schema=None,
    ) as batch_op:

        batch_op.drop_constraint(
            "check_nonnegative_experience",
            type_="check",
        )