import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token
from app.extensions import db, bcrypt
from app.models import User
from app.admin_models import AdminCredential, AdminChallenge
from app.routes.auth import serialize_user

admin_auth_bp = Blueprint("admin_auth", __name__, url_prefix="/api/auth/admin")

def utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)

def issue_challenge(user):
    secret = secrets.token_urlsafe(32)
    db.session.add(AdminChallenge(user_id=user.id, token_hash=hashlib.sha256(secret.encode()).hexdigest(), expires_at=utcnow() + timedelta(minutes=5)))
    db.session.commit()
    return secret

@admin_auth_bp.post("/verify-pin")
def verify_pin():
    data = request.get_json(silent=True) or {}
    secret, pin = data.get("challenge"), data.get("pin")
    if not isinstance(secret, str) or not isinstance(pin, str) or len(pin) != 6 or not pin.isascii() or not pin.isdigit():
        return jsonify(error="Invalid verification request"), 400
    challenge = AdminChallenge.query.filter_by(token_hash=hashlib.sha256(secret.encode()).hexdigest()).first()
    if not challenge or challenge.consumed_at or challenge.expires_at <= utcnow():
        return jsonify(error="Challenge expired or invalid"), 401
    user = db.session.get(User, challenge.user_id)
    cred = AdminCredential.query.filter_by(user_id=challenge.user_id).first()
    if not user or user.role != "admin" or not cred:
        return jsonify(error="Verification unavailable"), 403
    if cred.locked_until and cred.locked_until > utcnow():
        return jsonify(error="PIN temporarily locked"), 429
    if not bcrypt.check_password_hash(cred.pin_hash, pin):
        cred.failed_attempts = (cred.failed_attempts or 0) + 1
        if cred.failed_attempts >= 5:
            cred.locked_until = utcnow() + timedelta(minutes=15)
        db.session.commit()
        return jsonify(error="Incorrect PIN"), 401
    cred.failed_attempts = 0
    cred.locked_until = None
    challenge.consumed_at = utcnow()
    db.session.commit()
    token = create_access_token(identity=str(user.id), additional_claims={"admin_verified": True})
    return jsonify(token=token, access_token=token, user=serialize_user(user)), 200
