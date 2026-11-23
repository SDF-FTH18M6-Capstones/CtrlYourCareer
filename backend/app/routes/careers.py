import json
import re

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from sqlalchemy.orm import joinedload

from app.extensions import db

from app.models import (
    User,
    Profile,
    Career,
    CareerSkill,
    UserSkill
)


careers_bp = Blueprint(
    "careers",
    __name__,
    url_prefix="/api/careers"
)


# =====================================================
# RECOMMENDATION WEIGHTS
# =====================================================

WEIGHTS = {
    "skills": 0.40,
    "education": 0.20,
    "experience": 0.15,
    "interests": 0.15,
    "goals": 0.10
}


# =====================================================
# COMPATIBILITY LEVELS
# =====================================================

EDUCATION_LEVELS = {
    "high-school": 1,
    "certificate": 2,
    "diploma": 3,
    "undergraduate": 4,
    "graduate": 5,
    "postgraduate": 6,
    "other": 0
}


EXPERIENCE_LEVELS = {
    "starting": 1,
    "transitioning": 2,
    "building": 2,
    "experienced": 3
}


SKILL_LEVELS = {
    "beginner": 1,
    "intermediate": 2,
    "advanced": 3
}


# =====================================================
# AUTHENTICATED USER
# =====================================================

def get_logged_in_user():

    identity = get_jwt_identity()

    try:
        user_id = int(identity)
    except (TypeError, ValueError):
        return None

    return db.session.get(User, user_id)


# =====================================================
# PROFILE HELPERS
# =====================================================

def get_user_profile(user):

    return Profile.query.filter_by(
        user_id=user.id
    ).first()


def get_user_interests(profile):

    if not profile or not profile.career_interest:
        return []

    try:
        interests = json.loads(profile.career_interest)

        if isinstance(interests, list):
            return interests

    except (ValueError, TypeError):
        pass

    return []


# =====================================================
# TEXT MATCHING HELPERS
# =====================================================

STOP_WORDS = {
    "the", "and", "for", "with", "from",
    "into", "that", "this", "want", "would",
    "like", "become", "be", "a", "an", "to",
    "in", "of", "my", "me", "i", "is"
}


def normalize_text(value):

    if not isinstance(value, str):
        return ""

    return re.sub(
        r"[^a-z0-9 ]",
        " ",
        value.lower()
    ).strip()


def get_words(value):

    return {
        word
        for word in normalize_text(value).split()
        if word not in STOP_WORDS and len(word) > 2
    }


def text_match_score(user_text, career_text):

    user_words = get_words(user_text)
    career_words = get_words(career_text)

    if not user_words or not career_words:
        return 50

    overlap = user_words.intersection(career_words)

    return round(
        (len(overlap) / len(career_words)) * 100
    )


# =====================================================
# SKILLS COMPATIBILITY - 40%
# =====================================================

def calculate_skill_match(user_records, career):

    user_skills = {
        record.skill_id: record
        for record in user_records
    }

    required_skills = [
        relationship
        for relationship in career.skills
        if relationship.skill is not None
    ]

    matched_skills = []
    missing_skills = []
    improvement_skills = []

    total_score = 0

    for requirement in required_skills:

        skill = requirement.skill

        user_record = user_skills.get(skill.id)

        if user_record is None:

            missing_skills.append(skill.name)

            continue

        user_level = SKILL_LEVELS.get(
            (user_record.proficiency_level or "").lower(),
            1
        )

        required_level = SKILL_LEVELS.get(
            (requirement.required_level or "").lower(),
            1
        )

        if user_level >= required_level:

            score = 100
            matched_skills.append(skill.name)

        else:

            score = 70

            improvement_skills.append({
                "skill": skill.name,
                "current_level": user_record.proficiency_level,
                "required_level": requirement.required_level
            })

        total_score += score

    if required_skills:

        score = round(
            total_score / len(required_skills)
        )

    else:

        score = 50

    return {
        "score": score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "improvement_skills": improvement_skills,
        "total_required_skills": len(required_skills)
    }


# =====================================================
# EDUCATION COMPATIBILITY - 20%
# =====================================================

def calculate_education_match(profile, career):

    if not profile or not career.education_level:
        return 50

    user_level = EDUCATION_LEVELS.get(
        (profile.education_level or "").lower()
    )

    required_level = EDUCATION_LEVELS.get(
        career.education_level.lower()
    )

    if user_level is None or required_level is None:
        return 50

    if user_level >= required_level:
        level_score = 100

    elif required_level - user_level == 1:
        level_score = 70

    elif required_level - user_level == 2:
        level_score = 40

    else:
        level_score = 20

    # Consider course and additional requirements
    if career.education_requirements:

        course_score = text_match_score(
            profile.course or "",
            career.education_requirements
        )

        return round(
            (level_score * 0.7) +
            (course_score * 0.3)
        )

    return level_score


# =====================================================
# EXPERIENCE COMPATIBILITY - 15%
# =====================================================

def calculate_experience_match(profile, career):

    if not profile or not career.experience_level:
        return 50

    user_level = EXPERIENCE_LEVELS.get(
        (profile.experience or "").lower()
    )

    required_level = EXPERIENCE_LEVELS.get(
        career.experience_level.lower()
    )

    if user_level is None or required_level is None:
        return 50

    if user_level >= required_level:
        return 100

    difference = required_level - user_level

    if difference == 1:
        return 70

    return 40


# =====================================================
# CAREER INTEREST COMPATIBILITY - 15%
# =====================================================

def calculate_interest_match(profile, career):

    interests = get_user_interests(profile)

    if not interests:
        return 50

    career_text = (
        f"{career.title} "
        f"{career.category or ''} "
        f"{career.description or ''}"
    )

    career_normalized = normalize_text(career_text)

    scores = []

    for interest in interests:

        interest_normalized = normalize_text(interest)

        if not interest_normalized:
            continue

        if interest_normalized in career_normalized:

            scores.append(100)

        else:

            scores.append(
                text_match_score(
                    interest,
                    f"{career.title} {career.category or ''}"
                )
            )

    if not scores:
        return 50

    return max(scores)


# =====================================================
# CAREER GOAL COMPATIBILITY - 10%
# =====================================================

def calculate_goal_match(profile, career):

    if not profile:
        return 50

    user_goals = " ".join([
        profile.short_term_goal or "",
        profile.long_term_goal or ""
    ])

    if not user_goals.strip():
        return 50

    career_description = (
        f"{career.title} "
        f"{career.category or ''}"
    )

    return text_match_score(
        user_goals,
        career_description
    )


# =====================================================
# COMPLETE CAREER RECOMMENDATION
# =====================================================

def calculate_career_match(
    user_records,
    profile,
    career
):

    skills = calculate_skill_match(
        user_records,
        career
    )

    education = calculate_education_match(
        profile,
        career
    )

    experience = calculate_experience_match(
        profile,
        career
    )

    interests = calculate_interest_match(
        profile,
        career
    )

    goals = calculate_goal_match(
        profile,
        career
    )

    # Weighted calculation
    final_score = (

        skills["score"] * WEIGHTS["skills"]

        + education * WEIGHTS["education"]

        + experience * WEIGHTS["experience"]

        + interests * WEIGHTS["interests"]

        + goals * WEIGHTS["goals"]

    )

    final_score = round(final_score)

    return {

        "match_percentage": final_score,

        "factor_scores": {

            "skills": skills["score"],

            "education": education,

            "experience": experience,

            "interests": interests,

            "goals": goals

        },

        "matched_skills": skills["matched_skills"],

        "missing_skills": skills["missing_skills"],

        "improvement_skills": skills["improvement_skills"],

        "total_required_skills": skills["total_required_skills"],

        "matched_count": len(skills["matched_skills"]),

        "missing_count": len(skills["missing_skills"])

    }


# =====================================================
# CAREER SERIALIZATION
# =====================================================

def career_to_dict(career):

    return {

        "id": career.id,

        "title": career.title,

        "description": career.description,

        "category": career.category,

        "education_level": career.education_level,

        "education_requirements": career.education_requirements,

        "experience_level": career.experience_level

    }


# =====================================================
# GET ALL CAREERS
# =====================================================

@careers_bp.route("", methods=["GET"])
@jwt_required()
def get_careers():

    careers = Career.query.all()

    return jsonify([
        career_to_dict(career)
        for career in careers
    ]), 200


# =====================================================
# CREATE CAREER
# =====================================================

@careers_bp.route("", methods=["POST"])
@jwt_required()
def create_career():

    data = request.get_json() or {}

    title = (data.get("title") or "").strip()

    description = (data.get("description") or "").strip()

    if len(title) < 3:

        return jsonify({
            "error": "Title must be at least 3 characters"
        }), 400

    if len(description) < 10:

        return jsonify({
            "error": "Description must be at least 10 characters"
        }), 400

    career = Career(

        title=title,

        description=description,

        category=data.get("category"),

        education_level=data.get("education_level"),

        education_requirements=data.get("education_requirements"),

        experience_level=data.get("experience_level")

    )

    db.session.add(career)

    db.session.commit()

    return jsonify(career_to_dict(career)), 201


# =====================================================
# GET ONE CAREER
# =====================================================

@careers_bp.route("/<int:career_id>", methods=["GET"])
@jwt_required()
def get_career(career_id):

    career = db.session.get(Career, career_id)

    if career is None:

        return jsonify({
            "error": "Career not found"
        }), 404

    return jsonify(career_to_dict(career)), 200


# =====================================================
# UPDATE CAREER
# =====================================================

@careers_bp.route("/<int:career_id>", methods=["PUT", "PATCH"])
@jwt_required()
def update_career(career_id):

    career = db.session.get(Career, career_id)

    if career is None:

        return jsonify({
            "error": "Career not found"
        }), 404

    data = request.get_json() or {}

    allowed_fields = [
        "title",
        "description",
        "category",
        "education_level",
        "education_requirements",
        "experience_level"
    ]

    for field in allowed_fields:

        if field in data:

            setattr(career, field, data[field])

    db.session.commit()

    return jsonify(career_to_dict(career)), 200


# =====================================================
# DELETE CAREER
# =====================================================

@careers_bp.route("/<int:career_id>", methods=["DELETE"])
@jwt_required()
def delete_career(career_id):

    career = db.session.get(Career, career_id)

    if career is None:

        return jsonify({
            "error": "Career not found"
        }), 404

    CareerSkill.query.filter_by(
        career_id=career_id
    ).delete()

    db.session.delete(career)

    db.session.commit()

    return jsonify({
        "message": "Career deleted successfully"
    }), 200


# =====================================================
# GENERATE PERSONALIZED RECOMMENDATIONS
# =====================================================

def generate_recommendations(user):

    profile = get_user_profile(user)

    user_records = (
        UserSkill.query
        .options(joinedload(UserSkill.skill))
        .filter_by(user_id=user.id)
        .all()
    )

    careers = (
        Career.query
        .options(
            joinedload(Career.skills)
            .joinedload(CareerSkill.skill)
        )
        .all()
    )

    recommendations = []

    for career in careers:

        match = calculate_career_match(
            user_records,
            profile,
            career
        )

        recommendations.append({

            **career_to_dict(career),

            **match

        })

    recommendations.sort(
        key=lambda item: item["match_percentage"],
        reverse=True
    )

    return recommendations


# =====================================================
# GET CAREER RECOMMENDATIONS
# =====================================================

@careers_bp.route("/recommendations", methods=["GET"])
@jwt_required()
def career_recommendations():

    user = get_logged_in_user()

    if user is None:

        return jsonify({
            "error": "User not found"
        }), 404

    recommendations = generate_recommendations(user)

    return jsonify(recommendations), 200


# =====================================================
# REFRESH RECOMMENDATIONS
# =====================================================

@careers_bp.route(
    "/recommendations/refresh",
    methods=["POST"]
)
@jwt_required()
def refresh_recommendations():

    user = get_logged_in_user()

    if user is None:

        return jsonify({
            "error": "User not found"
        }), 404

    recommendations = generate_recommendations(user)

    return jsonify({

        "message": "Career recommendations refreshed successfully",

        "recommendations": recommendations

    }), 200


# =====================================================
# CAREER SKILL GAP ANALYSIS
# =====================================================

@careers_bp.route(
    "/<int:career_id>/skill-gap",
    methods=["GET"]
)
@jwt_required()
def career_skill_gap(career_id):

    user = get_logged_in_user()

    if user is None:

        return jsonify({
            "error": "User not found"
        }), 404

    career = (
        Career.query
        .options(
            joinedload(Career.skills)
            .joinedload(CareerSkill.skill)
        )
        .filter_by(id=career_id)
        .first()
    )

    if career is None:

        return jsonify({
            "error": "Career not found"
        }), 404

    profile = get_user_profile(user)

    user_records = (
        UserSkill.query
        .filter_by(user_id=user.id)
        .all()
    )

    match = calculate_career_match(
        user_records,
        profile,
        career
    )

    return jsonify({

        "career": career_to_dict(career),

        **match

    }), 200