import os

os.environ["DATABASE_URL"] = "sqlite:///:memory:"

import pytest

from flask_jwt_extended import create_access_token

from app import create_app
from app.extensions import db
from app.models import User


@pytest.fixture
def app():

    app = create_app()

    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite://",
        "JWT_SECRET_KEY": "test-secret-key-that-is-at-least-32-bytes-long",
    })

    with app.app_context():

        db.create_all()

        yield app

        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def auth_headers(app):
    """
    Create a regular user and return their JWT headers.
    """

    with app.app_context():

        user = User(
            username="testuser",
            email="testuser@example.com",
            password_hash="test-password-hash",
            role="user",
        )

        db.session.add(user)
        db.session.commit()

        token = create_access_token(
            identity=str(user.id),
            additional_claims={
                "admin_verified": False
            },
        )

    return {
        "Authorization": f"Bearer {token}"
    }


@pytest.fixture
def admin_headers(app):
    """
    Create a verified admin and return their JWT headers.
    """

    with app.app_context():

        admin = User(
            username="testadmin",
            email="testadmin@example.com",
            password_hash="test-admin-password-hash",
            role="admin",
        )

        db.session.add(admin)
        db.session.commit()

        token = create_access_token(
            identity=str(admin.id),
            additional_claims={
                "admin_verified": True
            },
        )

    return {
        "Authorization": f"Bearer {token}"
    }