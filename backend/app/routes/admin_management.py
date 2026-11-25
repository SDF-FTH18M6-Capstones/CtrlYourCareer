from flask import Blueprint, jsonify
from app.admin_security import admin_required
from app.models import User, Career, Skill
from app.extensions import db
admin_bp = Blueprint("admin_management", __name__, url_prefix="/api/admin")
@admin_bp.get("/stats")
@admin_required
def stats():
    return jsonify(users=db.session.query(User).count(), careers=db.session.query(Career).count(), skills=db.session.query(Skill).count())
@admin_bp.get("/users")
@admin_required
def users():
    return jsonify([dict(id=u.id, username=u.username, email=u.email, role=u.role) for u in User.query.order_by(User.id).all()])
