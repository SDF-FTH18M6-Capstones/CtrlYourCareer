from datetime import datetime, timezone
from app.extensions import db


def utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class AdminCredential(db.Model):
    __tablename__ = "admin_credentials"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        unique=True,
    )

    pin_hash = db.Column(db.String(255), nullable=False)

    failed_attempts = db.Column(
        db.Integer,
        nullable=False,
        default=0,
    )

    locked_until = db.Column(db.DateTime)

    user = db.relationship("User")


class AdminChallenge(db.Model):
    __tablename__ = "admin_challenges"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
    )

    token_hash = db.Column(
        db.String(64),
        nullable=False,
        unique=True,
        index=True,
    )

    expires_at = db.Column(db.DateTime, nullable=False)

    consumed_at = db.Column(db.DateTime)


class AdminInvitation(db.Model):
    __tablename__ = "admin_invitations"

    id = db.Column(db.Integer, primary_key=True)

    email = db.Column(
        db.String(120),
        nullable=False,
        index=True,
    )

    token_hash = db.Column(
        db.String(64),
        nullable=False,
        unique=True,
        index=True,
    )

    invited_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    accepted_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=utcnow,
    )

    expires_at = db.Column(
        db.DateTime,
        nullable=False,
    )

    accepted_at = db.Column(db.DateTime, nullable=True)

    revoked_at = db.Column(db.DateTime, nullable=True)

    inviter = db.relationship(
        "User",
        foreign_keys=[invited_by],
    )

    accepted_user = db.relationship(
        "User",
        foreign_keys=[accepted_by],
    )

    @property
    def status(self):
        if self.accepted_at is not None:
            return "accepted"

        if self.revoked_at is not None:
            return "revoked"

        if self.expires_at <= utcnow():
            return "expired"

        return "pending"

    @property
    def is_valid(self):
        return self.status == "pending"


class AdminSetup(db.Model):
    __tablename__ = "admin_setup"

    id = db.Column(db.Integer, primary_key=True)

    completed_at = db.Column(
        db.DateTime,
        nullable=False,
        default=utcnow,
    )

    __table_args__ = (
        db.CheckConstraint(
            "id = 1",
            name="ck_admin_setup_singleton",
        ),
    )