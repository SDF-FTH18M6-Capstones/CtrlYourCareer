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


@profile_bp.route("/onboarding", methods=["PUT"])
@jwt_required()
def onboarding():

    # Identify authenticated user
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

    # Required information
    role = data.get("role")
    goal = data.get("goal")
    experience = data.get("experience")
    education_level = data.get("education_level")

    interests = data.get("interests", [])

    required_fields = {
        "role": role,
        "goal": goal,
        "experience": experience,
        "education_level": education_level
    }

    for field, value in required_fields.items():
        if not isinstance(value, str) or not value.strip():
            return jsonify({
                "error": f"{field} is required"
            }), 400

    if not isinstance(interests, list) or not interests:
        return jsonify({
            "error": "Select at least one career interest"
        }), 400

    if not all(
        isinstance(item, str) and item.strip()
        for item in interests
    ):
        return jsonify({
            "error": "Invalid career interests"
        }), 400

    # Additional information
    course = data.get("course", "")
    experience_details = data.get("experience_details", "")
    short_term_goal = data.get("short_term_goal", "")
    long_term_goal = data.get("long_term_goal", "")

    text_fields = {
        "course": course,
        "experience_details": experience_details,
        "short_term_goal": short_term_goal,
        "long_term_goal": long_term_goal
    }

    for field, value in text_fields.items():
        if not isinstance(value, str):
            return jsonify({
                "error": f"{field} must be text"
            }), 400

    # Prevent oversized input
    limits = {
        "course": 150,
        "experience_details": 2000,
        "short_term_goal": 1000,
        "long_term_goal": 1000
    }

    for field, limit in limits.items():
        if len(text_fields[field]) > limit:
            return jsonify({
                "error": f"{field} exceeds {limit} characters"
            }), 400

    encoded_interests = json.dumps(interests)

    if len(encoded_interests) > 2000:
        return jsonify({
            "error": "Too many career interests selected"
        }), 400

    # Find or create profile
    profile = Profile.query.filter_by(
        user_id=user.id
    ).first()

    if profile is None:
        profile = Profile(user_id=user.id)
        db.session.add(profile)

    # Save education
    profile.education = education_level.strip()
    profile.education_level = education_level.strip()
    profile.course = course.strip()

    # Save experience
    profile.experience = experience.strip()
    profile.experience_details = experience_details.strip()

    # Save career preferences
    profile.career_interest = encoded_interests
    profile.career_goal = goal.strip()

    # Save development goals
    profile.short_term_goal = short_term_goal.strip()
    profile.long_term_goal = long_term_goal.strip()

    profile.full_name = user.username


    try:
        db.session.commit()

    except Exception:
        db.session.rollback()
        raise

    return jsonify({
        "message": "Onboarding completed successfully",

        "user": {
            "id": user.id,
            "username": user.username,
            "name": user.username,
            "email": user.email,
            "role": user.role,

            "goal": profile.career_goal,
            "experience": profile.experience,
            "interests": interests,

            "education_level": profile.education_level,
            "course": profile.course,

            "experience_details": profile.experience_details,

            "short_term_goal": profile.short_term_goal,
            "long_term_goal": profile.long_term_goal,

            "onboardingComplete": True
        }
    }), 200

@profile_bp.route("/settings", methods=["GET", "PUT"])
@jwt_required()
def profile_settings():
    from sqlalchemy import func
    identity = get_jwt_identity()
    try:
        user = db.session.get(User, int(identity))
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid user identity"}), 401
    if user is None:
        return jsonify({"error": "User not found"}), 404
    profile = Profile.query.filter_by(user_id=user.id).first()
    if request.method == "PUT":
        data = request.get_json(silent=True)
        if not isinstance(data, dict):
            return jsonify({"error": "JSON object required"}), 400
        if profile is None:
            profile = Profile(user_id=user.id)
            db.session.add(profile)
        text_limits = {
            "full_name": 120, "education_level": 50, "course": 150,
            "experience": 80, "experience_details": 2000,
            "career_goal": 120, "short_term_goal": 1000,
            "long_term_goal": 1000, "bio": 2000,
        }
        for field, limit in text_limits.items():
            if field in data:
                value = data[field]
                if not isinstance(value, str) or len(value) > limit:
                    return jsonify({"error": f"{field} must be text of at most {limit} characters"}), 400
                setattr(profile, field, value.strip())
        if "interests" in data:
            interests = data["interests"]
            if (not isinstance(interests, list) or len(interests) > 30 or
                not all(isinstance(x, str) and 0 < len(x.strip()) <= 100 for x in interests)):
                return jsonify({"error": "Invalid interests"}), 400
            encoded = json.dumps([x.strip() for x in interests])
            if len(encoded) > 2000:
                return jsonify({"error": "Too many interests"}), 400
            profile.career_interest = encoded
        if "username" in data:
            username = data["username"]
            if not isinstance(username, str) or not 2 <= len(username.strip()) <= 80:
                return jsonify({"error": "Username must be 2-80 characters"}), 400
            user.username = username.strip()
        if "email" in data:
            email = data["email"]
            if not isinstance(email, str) or len(email) > 120 or "@" not in email or not email.strip():
                return jsonify({"error": "Invalid email"}), 400
            email = email.strip().lower()
            duplicate = User.query.filter(func.lower(User.email) == email, User.id != user.id).first()
            if duplicate:
                return jsonify({"error": "Email already in use"}), 409
            user.email = email
        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            return jsonify({"error": "Could not save settings"}), 400
    try:
        interests = json.loads(profile.career_interest or "[]") if profile else []
    except (TypeError, ValueError):
        interests = []
    if not isinstance(interests, list):
        interests = []
    return jsonify({
        "user": {"id": user.id, "username": user.username, "name": user.username,
                 "email": user.email, "role": user.role,
                 "goal": profile.career_goal if profile else "",
                 "experience": profile.experience if profile else "",
                 "interests": interests, "onboardingComplete": True},
        "profile": {
            "full_name": profile.full_name or "" if profile else "",
            "education_level": profile.education_level or "" if profile else "",
            "course": profile.course or "" if profile else "",
            "experience": profile.experience or "" if profile else "",
            "experience_details": profile.experience_details or "" if profile else "",
            "career_goal": profile.career_goal or "" if profile else "",
            "short_term_goal": profile.short_term_goal or "" if profile else "",
            "long_term_goal": profile.long_term_goal or "" if profile else "",
            "bio": profile.bio or "" if profile else "",
            "interests": interests
        }
    }), 200
