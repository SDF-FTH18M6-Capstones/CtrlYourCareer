from functools import wraps
from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from app.extensions import db
from app.models import User

def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def inner(*args, **kwargs):
        try:
            user = db.session.get(User, int(get_jwt_identity()))
        except (TypeError, ValueError):
            user = None
        if not user or user.role != "admin" or get_jwt().get("admin_verified") is not True:
            return jsonify(error="Verified administrator required"), 403
        return fn(*args, **kwargs)
    return inner
