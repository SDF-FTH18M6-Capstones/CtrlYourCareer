import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv(
        "SECRET_KEY",
        "dev-secret-key",
    )

    JWT_SECRET_KEY = os.getenv(
        "JWT_SECRET_KEY",
        "test-fallback-key-that-is-longer-than-32-bytes",
    )

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "sqlite:///ctrl_your_career.db",
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)

    ADMIN_SETUP_KEY = os.getenv("ADMIN_SETUP_KEY")

    ADMIN_KEY_REGISTRATION_ENABLED = (
        os.getenv(
            "ADMIN_KEY_REGISTRATION_ENABLED",
            "false",
        ).strip().lower() == "true"
    )

    ADMIN_INVITATION_EXPIRY_HOURS = 24