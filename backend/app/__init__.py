from flask import Flask
from config import Config
from app.extensions import db, migrate, cors, bcrypt, jwt
from app.routes.health import health_bp
from app.routes.skills import skills_bp
from app.routes.careers import careers_bp
from app.routes.auth import auth_bp
from app.routes.profile import profile_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

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
    app.register_blueprint(profile_bp)

    return app
