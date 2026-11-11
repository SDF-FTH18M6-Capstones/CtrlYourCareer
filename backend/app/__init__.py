from flask import Flask
from config import Config
from app.extensions import db, migrate, cors
from app.routes.health import health_bp


def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)

    db.init_app(app)
    cors.init_app(app)

    from app import models

    migrate.init_app(app, db)

    app.register_blueprint(health_bp)

    return app
