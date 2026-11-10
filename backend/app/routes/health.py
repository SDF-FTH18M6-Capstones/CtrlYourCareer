from flask import Blueprint, jsonify
from app.extensions import db

health_bp = Blueprint("health", __name__)

@health_bp.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "success",
        "message": "SkillMap backend is running"
    }), 200


@health_bp.route("/api/health/database", methods=["GET"])
def database_health():
    try:
        db.session.execute(db.text("SELECT 1"))

        return jsonify({
            "status": "success",
            "database": "connected"
        }), 200

    except Exception as e:
        db.session.rollback()

        print("DATABASE ERROR:", str(e))

        return jsonify({
            "status": "error",
            "database": "disconnected",
            "error": str(e)
        }), 503