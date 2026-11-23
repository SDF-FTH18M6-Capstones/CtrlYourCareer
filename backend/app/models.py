from app.extensions import db
from sqlalchemy import UniqueConstraint, CheckConstraint


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(30), nullable=True)
    created_at = db.Column(db.DateTime, nullable=True)

    # One user has one profile.
    profile = db.relationship(
        "Profile",
        back_populates="user",
        uselist=False
    )

    # One user can have many skills.
    skills = db.relationship(
        "UserSkill",
        back_populates="user"
    )


class Profile(db.Model):
    __tablename__ = "profiles"

    id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        unique=True
    )

    full_name = db.Column(db.String(120), nullable=True)

    # Education information
    education = db.Column(db.Text, nullable=True)
    education_level = db.Column(db.String(100), nullable=True)
    course = db.Column(db.String(150), nullable=True)

    # Experience information
    experience = db.Column(db.String(100), nullable=True)
    experience_details = db.Column(db.Text, nullable=True)

    # Career preferences
    career_interest = db.Column(db.Text, nullable=True)
    career_goal = db.Column(db.String(120), nullable=True)

    # Personal development goals
    short_term_goal = db.Column(db.Text, nullable=True)
    long_term_goal = db.Column(db.Text, nullable=True)

    bio = db.Column(db.Text, nullable=True)

    user = db.relationship(
        "User",
        back_populates="profile"
    )

class Skill(db.Model):
    __tablename__ = "skills"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    category = db.Column(db.String(50), nullable=True)
    description = db.Column(db.Text, nullable=True)

    # A skill can belong to many users.
    users = db.relationship(
        "UserSkill",
        back_populates="skill"
    )

    # A skill can be required by many careers.
    careers = db.relationship(
        "CareerSkill",
        back_populates="skill"
    )


class UserSkill(db.Model):
    __tablename__ = "user_skills"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )
    skill_id = db.Column(
        db.Integer,
        db.ForeignKey("skills.id"),
        nullable=False
    )
    proficiency_level = db.Column(db.String(30), nullable=True)
    years_experience = db.Column(db.Integer, nullable=True)

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "skill_id",
            name="unique_user_skill"
        ),
        CheckConstraint(
            "years_experience IS NULL OR years_experience >= 0",
            name="check_nonnegative_experience"
        ),
    )

    # Connects this record to its user.
    user = db.relationship(
        "User",
        back_populates="skills"
    )

    # Connects this record to its skill.
    skill = db.relationship(
        "Skill",
        back_populates="users"
    )


class Career(db.Model):
    __tablename__ = "careers"

    id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True
    )

    title = db.Column(
        db.String(120),
        nullable=False
    )

    description = db.Column(
        db.Text,
        nullable=True
    )

    category = db.Column(
        db.String(80),
        nullable=True
    )

    # Minimum education level required
    education_level = db.Column(
        db.String(100),
        nullable=True
    )

    # Additional education requirements
    education_requirements = db.Column(
        db.Text,
        nullable=True
    )

    # Expected experience level
    experience_level = db.Column(
        db.String(30),
        nullable=True
    )

    skills = db.relationship(
        "CareerSkill",
        back_populates="career"
    )

class CareerSkill(db.Model):
    __tablename__ = "career_skills"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    career_id = db.Column(
        db.Integer,
        db.ForeignKey("careers.id"),
        nullable=False
    )
    skill_id = db.Column(
        db.Integer,
        db.ForeignKey("skills.id"),
        nullable=False
    )
    required_level = db.Column(db.String(30), nullable=True)

    __table_args__ = (
        UniqueConstraint(
            "career_id",
            "skill_id",
            name="unique_career_skill"
        ),
    )

    # Connects this record to its career.
    career = db.relationship(
        "Career",
        back_populates="skills"
    )

    # Connects this record to its skill.
    skill = db.relationship(
        "Skill",
        back_populates="careers"
    )
