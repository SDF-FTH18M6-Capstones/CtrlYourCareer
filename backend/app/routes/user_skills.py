from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import UserSkill, Skill

user_skills_bp = Blueprint("user_skills", __name__)


@user_skills_bp.route("", methods=["POST"])
@jwt_required()
def add_user_skill():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    skill_id = data.get("skill_id")
    skill = db.session.get(Skill, skill_id) if skill_id else None
    if not skill:
        return jsonify({"error": "Invalid skill_id"}), 400

    existing = UserSkill.query.filter_by(
        user_id=user_id, skill_id=skill_id
    ).first()
    if existing:
        return jsonify({"error": "Skill already added"}), 409

    user_skill = UserSkill(
        user_id=user_id,
        skill_id=skill_id,
        proficiency_level=data.get("proficiency_level", "Beginner"),
        years_experience=data.get("years_experience", 0),
    )
    db.session.add(user_skill)
    db.session.commit()

    return jsonify({
        "skill_id": skill.id,
        "name": skill.name,
        "proficiency_level": user_skill.proficiency_level,
        "years_experience": user_skill.years_experience,
    }), 201