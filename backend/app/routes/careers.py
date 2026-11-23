from flask_jwt_extended import jwt_required
from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.models import User, UserSkill, Career, CareerSkill
from app.schemas import career_schema, careers_schema


careers_bp = Blueprint(
    "careers",
    __name__,
    url_prefix="/api/careers"
)


# GET ALL CAREERS
@careers_bp.route("", methods=["GET"])
@jwt_required()
def get_careers():

    careers = Career.query.order_by(Career.id).all()

    return jsonify(careers_schema.dump(careers)), 200


# GET ONE CAREER
@careers_bp.route("/<int:career_id>", methods=["GET"])
@jwt_required()
def get_career(career_id):

    career = db.session.get(Career, career_id)

    if career is None:
        return jsonify({
            "error": "Career not found"
        }), 404

    return jsonify(career_schema.dump(career)), 200


# CREATE A CAREER
@careers_bp.route("", methods=["POST"])
@jwt_required()
def create_career():

    try:

        data = career_schema.load(
            request.get_json() or {}
        )

        career = Career(**data)

        db.session.add(career)
        db.session.commit()

        return jsonify(
            career_schema.dump(career)
        ), 201

    except ValidationError as error:

        return jsonify({
            "errors": error.messages
        }), 400

    except IntegrityError:

        db.session.rollback()

        return jsonify({
            "error": "A career with that title already exists"
        }), 409


# UPDATE A CAREER
@careers_bp.route("/<int:career_id>", methods=["PUT"])
@jwt_required()
def update_career(career_id):

    career = db.session.get(Career, career_id)

    if career is None:
        return jsonify({
            "error": "Career not found"
        }), 404

    try:

        data = career_schema.load(
            request.get_json() or {},
            partial=True
        )

        if not data:
            return jsonify({
                "error": "Provide at least one field to update"
            }), 400

        for key, value in data.items():
            setattr(career, key, value)

        db.session.commit()

        return jsonify(
            career_schema.dump(career)
        ), 200

    except ValidationError as error:

        db.session.rollback()

        return jsonify({
            "errors": error.messages
        }), 400

    except IntegrityError:

        db.session.rollback()

        return jsonify({
            "error": "A career with that title already exists"
        }), 409


# DELETE A CAREER
@careers_bp.route("/<int:career_id>", methods=["DELETE"])
@jwt_required()
def delete_career(career_id):

    career = db.session.get(Career, career_id)

    if career is None:
        return jsonify({
            "error": "Career not found"
        }), 404

    db.session.delete(career)
    db.session.commit()

    return jsonify({
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