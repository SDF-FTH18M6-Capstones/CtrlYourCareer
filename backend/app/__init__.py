from flask import Flask
from config import Config
from app.extensions import db, migrate, cors, bcrypt, jwt
from app.routes.health import health_bp
from app.routes.skills import skills_bp
from app.routes.careers import careers_bp
from app.routes.auth import auth_bp
from app.routes.user_skills import user_skills_bp
from flask import Flask, jsonify
from app.routes.profile import profile_bp
from app.errors import register_error_handlers


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.register_blueprint(user_skills_bp)

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

    from app import models

    app.register_blueprint(health_bp)
    app.register_blueprint(skills_bp)
    app.register_blueprint(careers_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_skills_bp, url_prefix="/api/my-skills")
    app.register_blueprint(profile_bp)

    return app
