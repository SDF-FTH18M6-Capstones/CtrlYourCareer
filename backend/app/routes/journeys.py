from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Career, CareerSkill, UserSkill
from app.journey_models import CareerJourney, JourneyStep, LearningResource
from app.routes.careers import SKILL_LEVELS

journeys_bp = Blueprint("journeys", __name__, url_prefix="/api/journeys")

def user_id():
    return int(get_jwt_identity())

def serialize(j):
    requirements = CareerSkill.query.filter_by(career_id=j.career_id).all()
    owned = {s.skill_id: s for s in UserSkill.query.filter_by(user_id=j.user_id).all()}
    met = sum(1 for r in requirements if r.skill_id in owned and SKILL_LEVELS.get((owned[r.skill_id].proficiency_level or "").lower(), 0) >= SKILL_LEVELS.get((r.required_level or "beginner").lower(), 1))
    steps = []
    for s in j.steps:
        resources = LearningResource.query.filter_by(skill_id=s.skill_id).all()
        steps.append(dict(id=s.id, position=s.position, skill_id=s.skill_id, skill=dict(id=s.skill.id, name=s.skill.name), target_level=s.target_level, completed=s.completed, resources=[dict(id=r.id, title=r.title, url=r.url, resource_type=r.resource_type, difficulty=r.difficulty) for r in resources]))
    return dict(id=j.id, career=dict(id=j.career.id, title=j.career.title, description=j.career.description), skill_match_percentage=round(met / len(requirements) * 100) if requirements else None, steps=steps)

@journeys_bp.post("")
@jwt_required()
def start():
    data = request.get_json(silent=True) or {}
    career_id = data.get("career_id")
    if type(career_id) is not int:
        return jsonify(error="career_id must be an integer"), 400
    career = db.session.get(Career, career_id)
    if not career:
        return jsonify(error="Career not found"), 404
    existing = CareerJourney.query.filter_by(user_id=user_id(), career_id=career_id).first()
    if existing:
        return jsonify(serialize(existing)), 200
    reqs = CareerSkill.query.filter_by(career_id=career_id).order_by(CareerSkill.id).all()
    if not reqs:
        return jsonify(error="Career requirements have not been configured"), 422
    owned = {s.skill_id: s for s in UserSkill.query.filter_by(user_id=user_id()).all()}
    journey = CareerJourney(user_id=user_id(), career_id=career_id)
    db.session.add(journey)
    db.session.flush()
    for r in reqs:
        level = SKILL_LEVELS.get((owned[r.skill_id].proficiency_level or "").lower(), 0) if r.skill_id in owned else 0
        target = (r.required_level or "beginner").lower()
        if level < SKILL_LEVELS.get(target, 1):
            db.session.add(JourneyStep(journey_id=journey.id, skill_id=r.skill_id, position=len(journey.steps) + 1 if False else reqs.index(r) + 1, target_level=target))
    db.session.commit()
    return jsonify(serialize(journey)), 201

@journeys_bp.get("/me")
@jwt_required()
def mine():
    return jsonify([serialize(j) for j in CareerJourney.query.filter_by(user_id=user_id()).order_by(CareerJourney.id.desc()).all()])

@journeys_bp.get("/<int:journey_id>")
@jwt_required()
def detail(journey_id):
    j = db.session.get(CareerJourney, journey_id)
    if not j or j.user_id != user_id():
        return jsonify(error="Journey not found"), 404
    return jsonify(serialize(j))

@journeys_bp.patch("/steps/<int:step_id>")
@jwt_required()
def complete(step_id):
    s = db.session.get(JourneyStep, step_id)
    if not s or s.journey.user_id != user_id():
        return jsonify(error="Step not found"), 404
    data = request.get_json(silent=True) or {}
    if type(data.get("completed")) is not bool:
        return jsonify(error="completed must be boolean"), 400
    s.completed = data["completed"]
    db.session.commit()
    return jsonify(id=s.id, completed=s.completed)

@journeys_bp.delete("/<int:journey_id>")
@jwt_required()
def delete_journey(journey_id):
    journey = CareerJourney.query.filter_by(id=journey_id, user_id=user_id()).first()
    if journey is None:
        return jsonify(error="Journey not found"), 404
    db.session.delete(journey)
    db.session.commit()
    return jsonify(message="Learning journey removed"), 200
