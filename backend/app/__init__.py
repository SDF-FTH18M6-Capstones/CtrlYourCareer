from flask import Flask, jsonify
from config import Config
from app.extensions import db, migrate, cors, bcrypt, jwt
from app.errors import register_error_handlers
from app.routes.health import health_bp
from app.routes.skills import skills_bp
from app.routes.careers import careers_bp
from app.routes.auth import auth_bp
from app.routes.user_skills import user_skills_bp
from app.routes.profile import profile_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Not found"}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({"error": "Method not allowed"}), 405

    register_error_handlers(app)

    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    from app import models, admin_models, journey_models
    from app.models import User

    @jwt.token_in_blocklist_loader
    def check_if_user_exists(jwt_header, jwt_payload):
        identity = jwt_payload.get("sub")

        try:
            user = db.session.get(User, int(identity))
            return user is None
        except (ValueError, TypeError):
            return True

    from app.routes.admin_auth import admin_auth_bp
    from app.routes.admin_management import admin_bp
    from app.routes.journeys import journeys_bp
    from app.routes.resources import resources_bp
    from app.routes.progress import progress_bp
    from app.routes.referrals import referrals_bp

    app.register_blueprint(health_bp)
    app.register_blueprint(skills_bp)
    app.register_blueprint(careers_bp)
    app.register_blueprint(auth_bp)

    app.register_blueprint(
        user_skills_bp,
        url_prefix="/api/my-skills"
    )

    app.register_blueprint(profile_bp)

    app.register_blueprint(admin_auth_bp)
    app.register_blueprint(admin_bp)

    app.register_blueprint(journeys_bp)
    app.register_blueprint(resources_bp)

    app.register_blueprint(progress_bp)
    app.register_blueprint(referrals_bp)

    return app