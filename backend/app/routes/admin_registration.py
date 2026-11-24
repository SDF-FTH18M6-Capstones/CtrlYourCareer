import secrets
import re
import hashlib

from datetime import timedelta

from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import get_jwt_identity
from sqlalchemy.exc import IntegrityError

from app.extensions import db, bcrypt
from app.models import User
from app.admin_security import admin_required

from app.admin_models import (
    AdminCredential,
    AdminSetup,
    AdminInvitation,
    utcnow,
)

admin_registration_bp = Blueprint(
    "admin_registration",
    __name__,
    url_prefix="/api/admin",
)


def setup_available():
    """Check whether reusable administrator key registration is enabled."""
    key = current_app.config.get("ADMIN_SETUP_KEY")
    return (
        current_app.config.get("ADMIN_KEY_REGISTRATION_ENABLED") is True
        and isinstance(key, str)
        and len(key) >= 32
    )


def validate_registration(data):
    """Validate administrator registration information."""

    if not isinstance(data, dict):
        return None, "Valid JSON is required"

    username = data.get("username") or data.get("name")
    email = data.get("email")
    password = data.get("password")
    pin = data.get("pin")

    if not all(
        isinstance(value, str)
        for value in (username, email, password, pin)
    ):
        return None, "All registration fields are required"

    username = username.strip()
    email = email.strip().lower()

    if not username or len(username) > 80:
        return None, "Invalid username"

    if len(email) > 120 or not re.fullmatch(
        r"[^@\s]+@[^@\s]+\.[^@\s]+", email
    ):
        return None, "Invalid email address"

    if len(password) < 12:
        return None, "Password must be at least 12 characters"

    if len(password.encode("utf-8")) > 72:
        return None, "Password is too long"

    if not re.fullmatch(r"[0-9]{6}", pin):
        return None, "PIN must contain exactly six digits"

    return {
        "username": username,
        "email": email,
        "password": password,
        "pin": pin,
    }, None


def create_admin(data):
    """Create an administrator and their personal PIN credential."""

    user = User(
        username=data["username"],
        email=data["email"],
        password_hash=bcrypt.generate_password_hash(
            data["password"]
        ).decode("utf-8"),
        role="admin",
        created_at=utcnow(),
    )

    db.session.add(user)
    db.session.flush()

    credential = AdminCredential(
        user_id=user.id,
        pin_hash=bcrypt.generate_password_hash(
            data["pin"]
        ).decode("utf-8"),
        failed_attempts=0,
    )

    db.session.add(credential)

    return user


@admin_registration_bp.get("/setup/status")
def get_setup_status():
    return jsonify({
        "setup_available": setup_available()
    }), 200


@admin_registration_bp.post("/setup/register")
def register_admin_with_key():

    if not setup_available():
        return jsonify({
            "error": "Administrator key registration is unavailable"
        }), 403

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "error": "Valid JSON is required"
        }), 400

    provided_key = data.get("setup_key")
    expected_key = current_app.config.get("ADMIN_SETUP_KEY")

    if not isinstance(provided_key, str):
        return jsonify({
            "error": "Setup key is required"
        }), 400

    if not secrets.compare_digest(
        provided_key.encode("utf-8"),
        expected_key.encode("utf-8"),
    ):
        return jsonify({
            "error": "Invalid setup key"
        }), 403

    validated_data, error = validate_registration(data)

    if error:
        return jsonify({"error": error}), 400

    if User.query.filter_by(
        email=validated_data["email"]
    ).first():
        return jsonify({
            "error": "Email already registered"
        }), 409

    try:
        # Retain the historical setup record without blocking later signups.
        if db.session.get(AdminSetup, 1) is None:
            db.session.add(AdminSetup(id=1))
            db.session.flush()

        # Create the administrator and PIN credential.
        user = create_admin(validated_data)

        response_user = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
        }

        db.session.commit()

    except IntegrityError:
        db.session.rollback()

        return jsonify({
            "error": "Unable to register administrator "
                     "or email already registered"
        }), 409

    return jsonify({
        "message": "Administrator account created successfully",
        "user": response_user,
    }), 201
def hash_invitation_token(token):
    return hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()


def serialize_invitation(invitation):
    return {
        "id": invitation.id,
        "email": invitation.email,
        "status": invitation.status,
        "invited_by": invitation.invited_by,
        "accepted_by": invitation.accepted_by,
        "created_at": invitation.created_at.isoformat() + "Z",
        "expires_at": invitation.expires_at.isoformat() + "Z",
        "accepted_at": (
            invitation.accepted_at.isoformat() + "Z"
            if invitation.accepted_at else None
        ),
        "revoked_at": (
            invitation.revoked_at.isoformat() + "Z"
            if invitation.revoked_at else None
        ),
    }


# ==========================================
# CREATE ADMIN INVITATION
# ==========================================

@admin_registration_bp.post("/invitations")
@admin_required
def create_invitation():

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify(error="Valid JSON is required"), 400

    email = data.get("email")

    if not isinstance(email, str):
        return jsonify(error="Email is required"), 400

    email = email.strip().lower()

    if len(email) > 120 or not re.fullmatch(
        r"[^@\s]+@[^@\s]+\.[^@\s]+", email
    ):
        return jsonify(error="Invalid email address"), 400

    if User.query.filter_by(email=email).first():
        return jsonify(
            error="An account with this email already exists"
        ), 409

    now = utcnow()

    existing_invitation = AdminInvitation.query.filter(
        AdminInvitation.email == email,
        AdminInvitation.accepted_at.is_(None),
        AdminInvitation.revoked_at.is_(None),
        AdminInvitation.expires_at > now,
    ).first()

    if existing_invitation:
        return jsonify(
            error="An active invitation already exists for this email"
        ), 409

    token = secrets.token_urlsafe(32)

    expiry_hours = current_app.config.get(
        "ADMIN_INVITATION_EXPIRY_HOURS", 24
    )

    invitation = AdminInvitation(
        email=email,
        token_hash=hash_invitation_token(token),
        invited_by=int(get_jwt_identity()),
        created_at=now,
        expires_at=now + timedelta(hours=expiry_hours),
    )

    try:
        db.session.add(invitation)
        db.session.commit()

    except IntegrityError:
        db.session.rollback()

        return jsonify(
            error="Unable to create invitation"
        ), 409

    return jsonify({
        "message": "Administrator invitation created",
        "token": token,
        "invitation": serialize_invitation(invitation),
    }), 201


# ==========================================
# LIST ADMIN INVITATIONS
# ==========================================

@admin_registration_bp.get("/invitations")
@admin_required
def list_invitations():

    invitations = AdminInvitation.query.order_by(
        AdminInvitation.created_at.desc()
    ).all()

    return jsonify([
        serialize_invitation(invitation)
        for invitation in invitations
    ]), 200


# ==========================================
# VALIDATE ADMIN INVITATION
# ==========================================

@admin_registration_bp.post("/invitations/validate")
def validate_invitation():

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify(error="Valid JSON is required"), 400

    token = data.get("token")

    if not isinstance(token, str) or not token or len(token) > 256:
        return jsonify(error="Invalid invitation token"), 400

    invitation = AdminInvitation.query.filter_by(
        token_hash=hash_invitation_token(token)
    ).first()

    if not invitation or not invitation.is_valid:
        return jsonify(
            error="Invitation is invalid, expired, revoked or already used"
        ), 400

    return jsonify({
        "valid": True,
        "email": invitation.email,
        "expires_at": invitation.expires_at.isoformat() + "Z",
    }), 200


# ==========================================
# ACCEPT ADMIN INVITATION
# ==========================================

@admin_registration_bp.post("/invitations/accept")
def accept_invitation():

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify(error="Valid JSON is required"), 400

    token = data.get("token")

    if not isinstance(token, str) or not token or len(token) > 256:
        return jsonify(error="Invalid invitation token"), 400

    invitation = AdminInvitation.query.filter_by(
        token_hash=hash_invitation_token(token)
    ).first()

    if not invitation or not invitation.is_valid:
        return jsonify(
            error="Invitation is invalid, expired, revoked or already used"
        ), 400

    validated_data, error = validate_registration(data)

    if error:
        return jsonify(error=error), 400

    if validated_data["email"] != invitation.email:
        return jsonify(
            error="This invitation belongs to a different email address"
        ), 403

    if User.query.filter_by(
        email=validated_data["email"]
    ).first():
        return jsonify(error="Email already registered"), 409

    try:
        now = utcnow()

        # Atomically claim the invitation.
        claimed = AdminInvitation.query.filter(
            AdminInvitation.id == invitation.id,
            AdminInvitation.accepted_at.is_(None),
            AdminInvitation.revoked_at.is_(None),
            AdminInvitation.expires_at > now,
        ).update(
            {"accepted_at": now},
            synchronize_session=False,
        )

        if claimed != 1:
            db.session.rollback()

            return jsonify(
                error="Invitation is no longer available"
            ), 409

        user = create_admin(validated_data)

        invitation.accepted_by = user.id

        response_user = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
        }

        db.session.commit()

    except IntegrityError:
        db.session.rollback()

        return jsonify(
            error="Unable to register administrator"
        ), 409

    return jsonify({
        "message": "Administrator account created successfully",
        "user": response_user,
    }), 201


# ==========================================
# REVOKE ADMIN INVITATION
# ==========================================

@admin_registration_bp.delete("/invitations/<int:invitation_id>")
@admin_required
def revoke_invitation(invitation_id):

    invitation = db.session.get(
        AdminInvitation,
        invitation_id,
    )

    if not invitation:
        return jsonify(error="Invitation not found"), 404

    now = utcnow()

    revoked = AdminInvitation.query.filter(
        AdminInvitation.id == invitation_id,
        AdminInvitation.accepted_at.is_(None),
        AdminInvitation.revoked_at.is_(None),
        AdminInvitation.expires_at > now,
    ).update(
        {"revoked_at": now},
        synchronize_session=False,
    )

    if revoked != 1:
        db.session.rollback()

        return jsonify(
            error="Only pending invitations can be revoked"
        ), 409

    db.session.commit()

    return jsonify({
        "message": "Invitation revoked successfully"
    }), 200
