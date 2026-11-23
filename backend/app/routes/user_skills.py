from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.orm import joinedload

from app.extensions import db
from app.models import User, Skill, UserSkill


user_skills_bp = Blueprint(
    "user_skills",
    __name__,
    url_prefix="/api/my-skills"
)


def get_current_user():
    """
    Get the user ID stored inside the JWT and find that user.
    """
    identity = get_jwt_identity()

    try:
        user_id = int(identity)
    except (TypeError, ValueError):
        return None

    return db.session.get(User, user_id)


def serialize_user_skill(record):
    """
    Convert a UserSkill database record into JSON-friendly data.
    """
    return {
        "id": record.id,
        "skill_id": record.skill_id,
        "name": record.skill.name,
        "category": record.skill.category,
        "proficiency_level": record.proficiency_level,
        "years_experience": record.years_experience
    }


def validate_skill_data(data, require_skill_id=False):
    """
    Validate information received from the frontend.
    """
    if not isinstance(data, dict):
        return None, "Request body must be a JSON object."

    skill_id = data.get("skill_id")

    if require_skill_id:
        if skill_id is None:
            return None, "skill_id is required."

        if isinstance(skill_id, bool) or not isinstance(skill_id, int):
            return None, "skill_id must be an integer."

    proficiency = data.get("proficiency_level", "Beginner")

    allowed_levels = ["Beginner", "Intermediate", "Advanced"]

    if proficiency not in allowed_levels:
        return None, (
            "proficiency_level must be Beginner, Intermediate, or Advanced."
        )

    years = data.get("years_experience", 0)

    if isinstance(years, bool) or not isinstance(years, int) or years < 0:
        return None, "years_experience must be a non-negative integer."

    return {
        "skill_id": skill_id,
        "proficiency_level": proficiency,
        "years_experience": years
    }, None


# GET ALL SKILLS BELONGING TO THE LOGGED-IN USER
@user_skills_bp.route("", methods=["GET"])
@jwt_required()
def get_my_skills():
    user = get_current_user()

    if user is None:
        return jsonify({"error": "User not found"}), 404

    records = (
        UserSkill.query
        .options(joinedload(UserSkill.skill))
        .filter_by(user_id=user.id)
        .all()
    )

    return jsonify([
        serialize_user_skill(record)
        for record in records
    ]), 200


# ADD A SKILL TO THE LOGGED-IN USER
@user_skills_bp.route("", methods=["POST"])
@jwt_required()
def add_my_skill():
    user = get_current_user()

    if user is None:
        return jsonify({"error": "User not found"}), 404

    data, error = validate_skill_data(
        request.get_json(silent=True),
        require_skill_id=True
    )

    if error:
        return jsonify({"error": error}), 400

    skill = db.session.get(Skill, data["skill_id"])

    if skill is None:
        return jsonify({"error": "Skill not found"}), 404

    existing = UserSkill.query.filter_by(
        user_id=user.id,
        skill_id=skill.id
    ).first()

    if existing:
        return jsonify({
            "error": "You have already added this skill."
        }), 409

    record = UserSkill(
        user_id=user.id,
        skill_id=skill.id,
        proficiency_level=data["proficiency_level"],
        years_experience=data["years_experience"]
    )

    db.session.add(record)
    db.session.commit()

    return jsonify({
        "message": "Skill added successfully",
        "skill": serialize_user_skill(record)
    }), 201


# UPDATE A USER'S SKILL RECORD
@user_skills_bp.route("/<int:record_id>", methods=["PUT"])
@jwt_required()
def update_my_skill(record_id):
    user = get_current_user()

    if user is None:
        return jsonify({"error": "User not found"}), 404

    record = UserSkill.query.filter_by(
        id=record_id,
        user_id=user.id
    ).first()

    if record is None:
        return jsonify({"error": "Skill record not found"}), 404

    data, error = validate_skill_data(
        request.get_json(silent=True)
    )

    if error:
        return jsonify({"error": error}), 400

    record.proficiency_level = data["proficiency_level"]
    record.years_experience = data["years_experience"]

    db.session.commit()

    return jsonify({
        "message": "Skill updated successfully",
        "skill": serialize_user_skill(record)
    }), 200


# DELETE A USER'S SKILL RECORD
@user_skills_bp.route("/<int:record_id>", methods=["DELETE"])
@jwt_required()
def delete_my_skill(record_id):
    user = get_current_user()

    if user is None:
        return jsonify({"error": "User not found"}), 404

    record = UserSkill.query.filter_by(
        id=record_id,
        user_id=user.id
    ).first()

    if record is None:
        return jsonify({"error": "Skill record not found"}), 404

    db.session.delete(record)
    db.session.commit()