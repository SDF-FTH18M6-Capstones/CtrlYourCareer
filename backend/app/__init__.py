import os
from flask import Flask, app
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    
    # Database configuration (SQLite default, PostgreSQL via DATABASE_URL)
    db_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), '..', 'app.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', f'sqlite:///{db_path}')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)

    # Import models so Flask-Migrate recognizes them
    from app import models

    # Register routes
    from app.routes import init_routes
    init_routes(app)

    app.register_blueprint(health_bp)
    return app