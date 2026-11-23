from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import Career, CareerSkill, UserSkill, Skill
from app.models import User, UserSkill, Career, CareerSkill
from app.schemas import career_schema, careers_schema

careers_bp = Blueprint("careers", __name__, url_prefix="/api/careers")


def career_to_dict(career):
    return {
        "id": career.id,
        "title": career.title,
        "category": career.category,
        "description": career.description,
    }


@careers_bp.route("", methods=["GET"])
@jwt_required()
def get_careers():
    careers = Career.query.all()
    return jsonify([career_to_dict(c) for c in careers]), 200


@careers_bp.route("", methods=["POST"])
@jwt_required()
def create_career():
    data = request.get_json() or {}
    title = (data.get("title") or "").strip()
    description = (data.get("description") or "").strip()

    if len(title) < 3:
        return jsonify({"error": "title must be at least 3 characters"}), 400
    if len(description) < 10:
        return jsonify({"error": "description must be at least 10 characters"}), 400

    career = Career(
        title=title,
        category=data.get("category"),
        description=description,
    )
    db.session.add(career)
    db.session.commit()
    return jsonify(career_to_dict(career)), 201


@careers_bp.route("/<int:career_id>", methods=["GET"])
@jwt_required()
def get_career(career_id):
    career = db.session.get(Career, career_id)
    if not career:
        return jsonify({"error": "Career not found"}), 404
    return jsonify(career_to_dict(career)), 200


@careers_bp.route("/<int:career_id>", methods=["PUT", "PATCH"])
@jwt_required()
def update_career(career_id):
    career = db.session.get(Career, career_id)
    if not career:
        return jsonify({"error": "Career not found"}), 404

    data = request.get_json() or {}
    for field in ("title", "category", "description"):
        if field in data:
            setattr(career, field, data[field])

    db.session.commit()
    return jsonify(career_to_dict(career)), 200


@careers_bp.route("/<int:career_id>", methods=["DELETE"])
@jwt_required()
def delete_career(career_id):
    career = db.session.get(Career, career_id)
    if not career:
        return jsonify({"error": "Career not found"}), 404

    CareerSkill.query.filter_by(career_id=career_id).delete()
    db.session.delete(career)
    db.session.commit()
    return jsonify({"message": "Career deleted"}), 200


@careers_bp.route("/<int:career_id>/skill-gap", methods=["GET"])
@jwt_required()
def skill_gap(career_id):
    user_id = int(get_jwt_identity())
    career = db.session.get(Career, career_id)
    if not career:
        return jsonify({"error": "Career not found"}), 404

    required_ids = {
        cs.skill_id for cs in CareerSkill.query.filter_by(career_id=career_id)
    }
    user_ids = {
        us.skill_id for us in UserSkill.query.filter_by(user_id=user_id)
    }

    matched = required_ids & user_ids
    missing = required_ids - user_ids
    percentage = (
        round(len(matched) / len(required_ids) * 100) if required_ids else 0
    )

    def skill_names(ids):
        return [
            s.name for s in Skill.query.filter(Skill.id.in_(ids)).all()
        ] if ids else []

    return jsonify({
        "career_id": career_id,
        "match_percentage": percentage,
        "matched_skills": skill_names(matched),
        "missing_skills": skill_names(missing),
        "message": "Career deleted successfully"
    }), 200

# CAREER RECOMMENDATIONS AND SKILL GAP LOGIC
def get_logged_in_user():
    """
    Retrieve the user represented by the JWT identity.
    """
    identity = get_jwt_identity()

    try:
        user_id = int(identity)
    except (TypeError, ValueError):
        return None

    return db.session.get(User, user_id)


def calculate_career_match(user_skill_ids, career):
    """
    Compare the user's skills with the skills required by a career.
    """

    required_skills = [
        relationship.skill
        for relationship in career.skills
        if relationship.skill is not None
    ]

    matched_skills = [
        skill.name
        for skill in required_skills
        if skill.id in user_skill_ids
    ]

    missing_skills = [
        skill.name
        for skill in required_skills
        if skill.id not in user_skill_ids
    ]

    total_required = len(required_skills)

    percentage = (
        round((len(matched_skills) / total_required) * 100)
        if total_required > 0
        else 0
    )

    return {
        "total_required_skills": total_required,
        "matched_count": len(matched_skills),
        "missing_count": len(missing_skills),
        "match_percentage": percentage,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills
    }


# GET CAREER RECOMMENDATIONS
@careers_bp.route("/recommendations", methods=["GET"])
@jwt_required()
def career_recommendations():

    user = get_logged_in_user()

    if user is None:
        return jsonify({"error": "User not found"}), 404

    user_records = UserSkill.query.filter_by(
        user_id=user.id
    ).all()

    user_skill_ids = {
        record.skill_id for record in user_records
    }

    careers = (
        Career.query
        .options(
            joinedload(Career.skills).joinedload(CareerSkill.skill)
        )
        .all()
    )

    recommendations = []

    for career in careers:
        match = calculate_career_match(
            user_skill_ids,
            career
        )

        recommendations.append({
            "id": career.id,
            "title": career.title,
            "description": career.description,
            "category": career.category,
            **match
        })

    recommendations.sort(
        key=lambda item: item["match_percentage"],
        reverse=True
    )

    return jsonify(recommendations), 200


# GET CAREER SKILL GAP
@careers_bp.route("/<int:career_id>/skill-gap", methods=["GET"])
@jwt_required()
def career_skill_gap(career_id):

    user = get_logged_in_user()

    if user is None:
        return jsonify({"error": "User not found"}), 404

    career = (
        Career.query
        .options(
            joinedload(Career.skills).joinedload(CareerSkill.skill)
        )
        .filter_by(id=career_id)
        .first()
    )

    if career is None:
        return jsonify({"error": "Career not found"}), 404

    user_records = UserSkill.query.filter_by(
        user_id=user.id
    ).all()

    user_skill_ids = {
        record.skill_id for record in user_records
    }

    match = calculate_career_match(
        user_skill_ids,
        career
    )

    return jsonify({
        "career": {
            "id": career.id,
            "title": career.title,
            "description": career.description
        },
        **match
    }), 200