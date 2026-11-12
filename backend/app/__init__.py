from flask import Flask
from config import Config
from app.extensions import db, migrate, cors
from app.routes.health import health_bp
from app.routes.skills import skills_bp
from app.routes.careers import careers_bp


def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)

    db.init_app(app)
    cors.init_app(app)

    from app import models

    migrate.init_app(app, db)

    app.register_blueprint(health_bp)
    app.register_blueprint(skills_bp)
    app.register_blueprint(careers_bp)

    return app
