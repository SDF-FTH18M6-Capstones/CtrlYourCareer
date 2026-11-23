from urllib.parse import urlparse
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from app.admin_security import admin_required
from app.extensions import db
from app.models import Skill
from app.journey_models import LearningResource

resources_bp = Blueprint("resources", __name__, url_prefix="/api")

def serialize(r):
    return dict(id=r.id, skill_id=r.skill_id, title=r.title, url=r.url, resource_type=r.resource_type, difficulty=r.difficulty)

@resources_bp.get("/skills/<int:skill_id>/resources")
@jwt_required()
def list_resources(skill_id):
    if not db.session.get(Skill, skill_id):
        return jsonify(error="Skill not found"), 404
    return jsonify([serialize(r) for r in LearningResource.query.filter_by(skill_id=skill_id).all()])

@resources_bp.post("/skills/<int:skill_id>/resources")
@admin_required
def add_resource(skill_id):
    if not db.session.get(Skill, skill_id):
        return jsonify(error="Skill not found"), 404
    data = request.get_json(silent=True) or {}
    title, url = data.get("title"), data.get("url")
    parsed = urlparse(url) if isinstance(url, str) else None
    if not isinstance(title, str) or not title.strip() or len(title) > 200 or not parsed or parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password or len(url) > 1000:
        return jsonify(error="Valid title and HTTPS resource URL required"), 400
    r = LearningResource(skill_id=skill_id, title=title.strip(), url=url, resource_type=data.get("resource_type") or "article", difficulty=data.get("difficulty"))
    db.session.add(r)
    db.session.commit()
    return jsonify(serialize(r)), 201

@resources_bp.delete("/resources/<int:resource_id>")
@admin_required
def delete_resource(resource_id):
    r = db.session.get(LearningResource, resource_id)
    if not r:
        return jsonify(error="Resource not found"), 404
    db.session.delete(r)
    db.session.commit()
    return jsonify(message="Deleted")
