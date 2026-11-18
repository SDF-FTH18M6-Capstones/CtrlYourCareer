from flask_jwt_extended import jwt_required
from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.models import Career
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
