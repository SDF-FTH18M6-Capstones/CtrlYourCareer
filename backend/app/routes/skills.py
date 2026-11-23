from collections import defaultdict

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload

from app.admin_security import admin_required
from app.extensions import db
from app.models import (
    User,
    Profile,
    Skill,
    Career,
    CareerSkill,
    UserSkill,
)
from app.schemas import skill_schema, skills_schema
from app.career_categories import category_matches_interest


skills_bp = Blueprint(
    "skills",
    __name__,
    url_prefix="/api/skills"
)

def get_logged_in_user():
    identity = get_jwt_identity()

    try:
        user_id = int(identity)
    except (TypeError, ValueError):
        return None

    return db.session.get(User, user_id)

@skills_bp.route("/recommended", methods=["GET"])
@jwt_required()
def get_recommended_skills():
    """
    Recommend skills associated with careers matching
    the authenticated user's onboarding interests.

    Skills already added by the user are excluded.

    The endpoint does not modify user skills.
    """

    from app.routes.careers import get_user_interests

    user = get_logged_in_user()

    if user is None:
        return jsonify({
            "error": "User not found"
        }), 404

    profile = Profile.query.filter_by(
        user_id=user.id
    ).first()

    interests = get_user_interests(profile)

    if not interests:
        return jsonify([]), 200

    existing_skill_ids = {
        record.skill_id
        for record in UserSkill.query.filter_by(
            user_id=user.id
        ).all()
    }

    careers = (
        Career.query
        .options(
            joinedload(Career.skills)
            .joinedload(CareerSkill.skill)
        )
        .all()
    )

    recommended = defaultdict(
        lambda: {
            "skill": None,
            "career_ids": set(),
            "career_titles": set(),
        }
    )

    for career in careers:

        is_relevant = any(
            category_matches_interest(
                interest,
                career
            )
            for interest in interests
        )

        if not is_relevant:
            continue

        for requirement in career.skills:

            skill = requirement.skill

            if skill is None:
                continue
            if skill.id in existing_skill_ids:
                continue

            item = recommended[skill.id]

            item["skill"] = skill
            item["career_ids"].add(career.id)
            item["career_titles"].add(career.title)

    results = []

    for item in recommended.values():

        skill = item["skill"]

        results.append({
            **skill_schema.dump(skill),
            "relevant_careers": sorted(
                item["career_titles"]
            ),
            "career_count": len(
                item["career_ids"]
            ),
        })

    results.sort(
        key=lambda item: (
            -item["career_count"],
            item["name"].lower()
        )
    )

    return jsonify(results), 200

@skills_bp.route("", methods=["GET"])
@jwt_required()
def get_skills():

    skills = Skill.query.order_by(Skill.id).all()

    return jsonify(
        skills_schema.dump(skills)
    ), 200

@skills_bp.route("/<int:skill_id>", methods=["GET"])
@jwt_required()
def get_skill(skill_id):

    skill = db.session.get(Skill, skill_id)

    if skill is None:
        return jsonify({
            "error": "Skill not found"
        }), 404

    return jsonify(
        skill_schema.dump(skill)
    ), 200

@skills_bp.route("", methods=["POST"])
@admin_required
def create_skill():

    try:
        data = skill_schema.load(
            request.get_json() or {}
        )

        skill = Skill(**data)

        db.session.add(skill)
        db.session.commit()

        return jsonify(
            skill_schema.dump(skill)
        ), 201

    except ValidationError as error:
        return jsonify({
            "errors": error.messages
        }), 400

    except IntegrityError:
        db.session.rollback()

        return jsonify({
            "error": "A skill with that name already exists"
        }), 409

@skills_bp.route(
    "/<int:skill_id>",
    methods=["PUT"]
)
@admin_required
def update_skill(skill_id):

    skill = db.session.get(
        Skill,
        skill_id
    )

    if skill is None:
        return jsonify({
            "error": "Skill not found"
        }), 404

    try:
        data = skill_schema.load(
            request.get_json() or {},
            partial=True
        )

        if not data:
            return jsonify({
                "error": "Provide at least one field to update"
            }), 400

        for key, value in data.items():
            setattr(
                skill,
                key,
                value
            )

        db.session.commit()

        return jsonify(
            skill_schema.dump(skill)
        ), 200

    except ValidationError as error:
        db.session.rollback()

        return jsonify({
            "errors": error.messages
        }), 400

    except IntegrityError:
        db.session.rollback()

        return jsonify({
            "error": "A skill with that name already exists"
        }), 409


@skills_bp.route(
    "/<int:skill_id>",
    methods=["DELETE"]
)
@admin_required
def delete_skill(skill_id):

    skill = db.session.get(
        Skill,
        skill_id
    )

    if skill is None:
        return jsonify({
            "error": "Skill not found"
        }), 404

    db.session.delete(skill)
    db.session.commit()

    return jsonify({
        "message": "Skill deleted successfully"
    }), 200