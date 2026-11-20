from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import Career, CareerSkill, UserSkill, Skill

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
    }), 200