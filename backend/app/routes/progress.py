from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.progress_models import ResourceCompletion
from app.journey_models import CareerJourney, JourneyStep, LearningResource
from app.models import User
from app.admin_security import admin_required
from app.routes.journeys import serialize

progress_bp = Blueprint("resource_progress", __name__, url_prefix="/api")

@progress_bp.get("/progress")
@jwt_required()
def mine():
    return jsonify([r.resource_id for r in ResourceCompletion.query.filter_by(user_id=int(get_jwt_identity())).all()])

@progress_bp.put("/progress/<int:resource_id>")
@jwt_required()
def update(resource_id):
    uid = int(get_jwt_identity())
    resource = db.session.get(LearningResource, resource_id)
    if not resource or not JourneyStep.query.join(CareerJourney).filter(CareerJourney.user_id == uid, JourneyStep.skill_id == resource.skill_id).first():
        return jsonify(error="Resource not in your journey"), 404
    data = request.get_json(silent=True)
    if not isinstance(data, dict) or type(data.get("completed")) is not bool:
        return jsonify(error="completed must be boolean"), 400
    row = db.session.get(ResourceCompletion, (uid, resource_id))
    if data["completed"] and not row:
        db.session.add(ResourceCompletion(user_id=uid, resource_id=resource_id))
    elif not data["completed"] and row:
        db.session.delete(row)
    db.session.commit()
    return jsonify(completed=data["completed"])

@progress_bp.get("/admin/monitoring")
@admin_required
def monitoring():
    result = []
    for u in User.query.filter(db.or_(User.role != "admin", User.role.is_(None))).order_by(User.id).all():
        done = {r.resource_id for r in ResourceCompletion.query.filter_by(user_id=u.id).all()}
        journeys = []
        for j in CareerJourney.query.filter_by(user_id=u.id).all():
            data = serialize(j)
            ids = {r["id"] for s in data["steps"] for r in s["resources"]}
            journeys.append(dict(id=j.id, career=data["career"]["title"], readiness=data["skill_match_percentage"], completed=len(ids & done), total=len(ids), activities_done=sum(s["completed"] for s in data["steps"]), activities_total=len(data["steps"])))
        result.append(dict(id=u.id, username=u.username, skills=[dict(name=s.skill.name, level=s.proficiency_level) for s in u.skills], journeys=journeys))
    return jsonify(result)
