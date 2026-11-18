
import os

# Must be set BEFORE importing the app, because config.py reads it at import time
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

import pytest
from app import create_app
from app.models import db


@pytest.fixture
def app():
    app = create_app()
    app.config.update(TESTING=True)

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()

import pytest
from flask_jwt_extended import create_access_token


@pytest.fixture
def auth_headers(app):
    with app.app_context():
        token = create_access_token(identity="1")

    return {
        "Authorization": f"Bearer {token}"
    }
