import json
from sqlalchemy import func
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
)
from sqlalchemy.exc import IntegrityError

from app.extensions import db, bcrypt
from app.models import User, Profile


auth_bp = Blueprint(
    "auth",
    __name__,
    url_prefix="/api/auth",
)


def serialize_user(user):
    """Return safe user details, including saved onboarding information."""

    # Retrieve the user's profile from the database
    profile = Profile.query.filter_by(user_id=user.id).first()

    # Retrieve saved career interests
    interests = []

    if profile and profile.career_interest:
        try:
            saved_interests = json.loads(profile.career_interest)

            if isinstance(saved_interests, list):
                interests = saved_interests

        except (json.JSONDecodeError, TypeError):
            interests = []

    return {
        "id": user.id,
        "username": user.username,
        "name": user.username,
        "email": user.email,
        "role": user.role,

        # Saved onboarding information
        "goal": profile.education if profile else "",
        "experience": profile.experience if profile else "",
        "interests": interests,

        # Check whether onboarding has been completed
        "onboardingComplete": profile is not None,
    }


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "error": "Valid JSON is required"
        }), 400

    # Accept both 'name' (React) and 'username' (Postman).
    username = data.get("username") or data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not all(
        isinstance(value, str)
        for value in (username, email, password)
    ):
        return jsonify({
            "error": "Name, email and password are required"
        }), 400

    username = username.strip()
    email = email.strip().lower()

    if not username or not email or not password:
        return jsonify({
            "error": "All fields are required"
        }), 400

    if len(username) > 80 or len(email) > 120:
        return jsonify({
            "error": "Username or email is too long"
        }), 400

    if "@" not in email:
        return jsonify({
            "error": "Invalid email address"
        }), 400

    if len(password) < 8:
        return jsonify({
            "error": "Password must be at least 8 characters"
        }), 400

    if User.query.filter_by(email=email).first():
        return jsonify({
            "error": "Email already registered"
        }), 409

    hashed_password = bcrypt.generate_password_hash(
        password
    ).decode("utf-8")

    user = User(
        username=username,
        email=email,
        password_hash=hashed_password,
        role="user",
    )

    try:
        db.session.add(user)
        db.session.commit()

    except IntegrityError:
        db.session.rollback()

        return jsonify({
            "error": "Email already registered"
        }), 409

    return jsonify({
        "message": "Account created successfully",
        "user": serialize_user(user),
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "error": "Valid JSON is required"
        }), 400

    email = data.get("email")
    password = data.get("password")

    if not isinstance(email, str) or not isinstance(password, str):
        return jsonify({
            "error": "Email and password are required"
        }), 400

    email = email.strip().lower()

    if not email or not password:
        return jsonify({
            "error": "Email and password are required"
        }), 400

    user = User.query.filter_by(email=email).first()

    if not user or not bcrypt.check_password_hash(
        user.password_hash,
        password,
    ):
        return jsonify({
            "error": "Invalid credentials"
        }), 401

    if user.role == "admin":
        from app.admin_models import AdminCredential
        from app.routes.admin_auth import issue_challenge
        credential = AdminCredential.query.filter_by(user_id=user.id).first()
        if credential is None:
            return jsonify(error="Admin PIN not configured"), 403
        return jsonify(requires_admin_pin=True, challenge=issue_challenge(user)), 200

    access_token = create_access_token(identity=str(user.id), additional_claims={"admin_verified": False})
    return jsonify(message="Login successful", access_token=access_token, user=serialize_user(user)), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
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

    return jsonify({
        "user": serialize_user(user),
    }), 200

@auth_bp.route("/change-password", methods=["PUT"])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()

    try:
        user = db.session.get(User, int(user_id))
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid user identity"}), 401

    if user is None:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Valid JSON is required"}), 400

    current_password = data.get("current_password")
    new_password = data.get("new_password")
    confirm_password = data.get("confirm_password")

    if not all(
        isinstance(value, str)
        for value in (current_password, new_password, confirm_password)
    ):
        return jsonify({"error": "All password fields are required"}), 400

    if not bcrypt.check_password_hash(
        user.password_hash,
        current_password
    ):
        return jsonify({"error": "Current password is incorrect"}), 401

    if len(new_password) < 8:
        return jsonify({
            "error": "New password must be at least 8 characters"
        }), 400

    if new_password != confirm_password:
        return jsonify({"error": "New passwords do not match"}), 400

    if new_password == current_password:
        return jsonify({
            "error": "New password must be different from current password"
        }), 400

    user.password_hash = bcrypt.generate_password_hash(
        new_password
    ).decode("utf-8")

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({"error": "Could not update password"}), 500

    return jsonify({
        "message": "Password changed successfully"
    }), 200
@auth_bp.route("/delete-account", methods=["DELETE"])
@jwt_required()
def delete_account():
    user_id = get_jwt_identity()

    try:
        user = db.session.get(User, int(user_id))
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid user identity"}), 401

    if user is None:
        return jsonify({"error": "User not found"}), 404

    # Administrators cannot delete their accounts here.
    if user.role == "admin":
        return jsonify({
            "error": "Administrator accounts cannot be deleted here"
        }), 403

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Valid JSON is required"}), 400

    current_password = data.get("current_password")
    confirmation = data.get("confirmation")

    if not isinstance(current_password, str):
        return jsonify({"error": "Current password is required"}), 400

    if confirmation != "DELETE MY ACCOUNT":
        return jsonify({
            "error": "Please enter DELETE MY ACCOUNT to confirm"
        }), 400

    if not bcrypt.check_password_hash(
        user.password_hash,
        current_password
    ):
        return jsonify({"error": "Incorrect password"}), 401

    # Import associated models.
    from app.journey_models import CareerJourney, JourneyStep
    from app.progress_models import ResourceCompletion
    from app.referral_models import Referral, Notification
    from app.admin_models import AdminChallenge, AdminCredential

    try:
        # Remove administrator security records if any exist.
        AdminChallenge.query.filter_by(user_id=user.id).delete(
            synchronize_session=False
        )

        AdminCredential.query.filter_by(user_id=user.id).delete(
            synchronize_session=False
        )

        # Remove referrals and notifications.
        Referral.query.filter_by(user_id=user.id).delete(
            synchronize_session=False
        )

        Notification.query.filter_by(user_id=user.id).delete(
            synchronize_session=False
        )

        # Remove learning resource completion records.
        ResourceCompletion.query.filter_by(user_id=user.id).delete(
            synchronize_session=False
        )

        # Remove user's skills.
        from app.models import UserSkill, Profile

        UserSkill.query.filter_by(user_id=user.id).delete(
            synchronize_session=False
        )

        # Remove learning journeys and their steps.
        journeys = CareerJourney.query.filter_by(
            user_id=user.id
        ).all()

        journey_ids = [journey.id for journey in journeys]

        if journey_ids:
            JourneyStep.query.filter(
                JourneyStep.journey_id.in_(journey_ids)
            ).delete(synchronize_session=False)

        CareerJourney.query.filter_by(user_id=user.id).delete(
            synchronize_session=False
        )

        # Remove profile.
        Profile.query.filter_by(user_id=user.id).delete(
            synchronize_session=False
        )

        # Finally, delete the user.
        db.session.delete(user)
        db.session.commit()

    except Exception:
        db.session.rollback()
        return jsonify({
            "error": "Could not delete account"
        }), 500

    return jsonify({
        "message": "Account and associated personal data deleted successfully"
    }), 200