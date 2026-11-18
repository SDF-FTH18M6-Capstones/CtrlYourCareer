import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "super-secret-and-sufficiently-long-key-exceeds-32-bytes")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///ctrl_your_career.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False