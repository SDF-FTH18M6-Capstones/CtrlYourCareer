import json

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import User, Profile


profile_bp = Blueprint(
    "profile",
    __name__,
    url_prefix="/api/profile"
)


# USER ONBOARDING
@profile_bp.route("/onboarding", methods=["PUT"])
@jwt_required()
def onboarding():

    user_id = get_jwt_identity()

    try:
        user = db.session.get(User, int(user_id))
    except (ValueError, TypeError):
        return jsonify({
            "error": "Invalid user identity"
        }), 401

    if user is None:
        return jsonify({
            "error": "User not found"
        }), 404

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "error": "A JSON object is required"
        }), 400

    role = data.get("role")
    goal = data.get("goal")
    experience = data.get("experience")
    interests = data.get("interests", [])

    if not all(
        isinstance(value, str) and value.strip()
        for value in (role, goal, experience)
    ):
        return jsonify({
            "error": "Role, goal and experience are required"
        }), 400

    if not isinstance(interests, list) or not all(
        isinstance(interest, str)
        for interest in interests
    ):
        return jsonify({
            "error": "Interests must be a list of strings"
        }), 400

    encoded_interests = json.dumps(interests)

    if len(encoded_interests) > 120:
        return jsonify({
            "error": "Selected interests exceed the storage limit"
        }), 400

    profile = Profile.query.filter_by(
        user_id=user.id
    ).first()

    if profile is None:
        profile = Profile(user_id=user.id)
        db.session.add(profile)

    profile.full_name = user.username
    profile.education = goal.strip()
    profile.experience = experience.strip()
    profile.career_interest = encoded_interests

    user.role = role.strip()

    db.session.commit()

    return jsonify({
        "message": "Onboarding completed successfully",
        "user": {
            "id": user.id,
            "username": user.username,
            "name": user.username,
            "email": user.email,
            "role": user.role,
            "goal": profile.education,
            "experience": profile.experience,
            "interests": interests,
            "onboardingComplete": True
        }
    }), 200