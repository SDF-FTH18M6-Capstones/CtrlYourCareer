from flask_jwt_extended import jwt_required
from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.models import Skill
from app.schemas import skill_schema, skills_schema


skills_bp = Blueprint(
    "skills",
    __name__,
    url_prefix="/api/skills"
)


# GET ALL SKILLS
@skills_bp.route("", methods=["GET"])
@jwt_required()
def get_skills():

    skills = Skill.query.order_by(Skill.id).all()

    return jsonify(skills_schema.dump(skills)), 200


# GET ONE SKILL
@skills_bp.route("/<int:skill_id>", methods=["GET"])
@jwt_required()
def get_skill(skill_id):

    skill = db.session.get(Skill, skill_id)

    if skill is None:
        return jsonify({
            "error": "Skill not found"
        }), 404

    return jsonify(skill_schema.dump(skill)), 200


# CREATE A SKILL
@skills_bp.route("", methods=["POST"])
@jwt_required()
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


# UPDATE A SKILL
@skills_bp.route("/<int:skill_id>", methods=["PUT"])
@jwt_required()
def update_skill(skill_id):

    skill = db.session.get(Skill, skill_id)

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
            setattr(skill, key, value)

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


# DELETE A SKILL
@skills_bp.route("/<int:skill_id>", methods=["DELETE"])
@jwt_required()
def delete_skill(skill_id):

    skill = db.session.get(Skill, skill_id)

    if skill is None:
        return jsonify({
            "error": "Skill not found"
        }), 404

    db.session.delete(skill)
    db.session.commit()

    return jsonify({
        "message": "Skill deleted successfully"
    }), 200
