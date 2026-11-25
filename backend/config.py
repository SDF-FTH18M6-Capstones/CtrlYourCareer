import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()


def get_database_url():
    database_url = os.getenv(
        "DATABASE_URL",
        "sqlite:///ctrl_your_career.db",
    )

    # Use the psycopg PostgreSQL driver in production.
    if database_url.startswith("postgres://"):
        database_url = database_url.replace(
            "postgres://",
            "postgresql+psycopg://",
            1,
        )

    elif database_url.startswith("postgresql://"):
        database_url = database_url.replace(
            "postgresql://",
            "postgresql+psycopg://",
            1,
        )

    return database_url


class Config:
    IS_PRODUCTION = (
        os.getenv("APP_ENV", "development").lower()
        == "production"
    )

    SECRET_KEY = os.getenv("SECRET_KEY")

    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

    if IS_PRODUCTION:
        if not SECRET_KEY or not JWT_SECRET_KEY:
            raise RuntimeError(
                "Production secret keys must be configured."
            )

        if not os.getenv("DATABASE_URL"):
            raise RuntimeError(
                "Production DATABASE_URL must be configured."
            )

        if SECRET_KEY == "dev-secret-key":
            raise RuntimeError(
                "Development secret key cannot be used in production."
            )

        if JWT_SECRET_KEY == "test-fallback-key-that-is-longer-than-32-bytes":
            raise RuntimeError(
                "Development JWT key cannot be used in production."
            )

    else:
        SECRET_KEY = SECRET_KEY or "dev-secret-key"

        JWT_SECRET_KEY = (
            JWT_SECRET_KEY
            or "test-fallback-key-that-is-longer-than-32-bytes"
        )

    SQLALCHEMY_DATABASE_URI = get_database_url()

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
    }

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)

    ADMIN_SETUP_KEY = os.getenv("ADMIN_SETUP_KEY")

    ADMIN_KEY_REGISTRATION_ENABLED = (
        os.getenv(
            "ADMIN_KEY_REGISTRATION_ENABLED",
            "false",
        ).strip().lower() == "true"
    )

    ADMIN_INVITATION_EXPIRY_HOURS = 24

    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        ).split(",")
        if origin.strip()
    ]