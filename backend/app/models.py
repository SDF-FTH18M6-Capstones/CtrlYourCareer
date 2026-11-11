from datetime import datetime, timezone
from app.extensions import db

class User(db.Model):
    __tablename__ = "users"

    user_id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(30), nullable=False, default="student")
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )

    profile = db.relationship(
        "StudentProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )

    career_interests = db.relationship(
        "StudentCareerInterest",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    student_skills = db.relationship(
        "StudentSkill",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    assessment_attempts = db.relationship(
        "AssessmentAttempt",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    learning_progress = db.relationship(
        "LearningProgress",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    career_matches = db.relationship(
        "CareerMatch",
        back_populates="user",
        cascade="all, delete-orphan"
    )

class StudentProfile(db.Model):
    __tablename__ = "student_profiles"

    profile_id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id"),
        unique=True,
        nullable=False
    )

    institution = db.Column(db.String(150))
    course = db.Column(db.String(150))
    education_level = db.Column(db.String(100))
    graduation_year = db.Column(db.Integer)

    user = db.relationship(
        "User",
        back_populates="profile"
    )

class Sector(db.Model):
    __tablename__ = "sectors"

    sector_id = db.Column(db.Integer, primary_key=True)

    sector_name = db.Column(
        db.String(150),
        unique=True,
        nullable=False
    )

    description = db.Column(db.Text)

    careers = db.relationship(
        "Career",
        back_populates="sector"
    )

class Career(db.Model):
    __tablename__ = "careers"

    career_id = db.Column(db.Integer, primary_key=True)

    sector_id = db.Column(
        db.Integer,
        db.ForeignKey("sectors.sector_id"),
        nullable=False
    )

    career_name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    education_requirements = db.Column(db.Text)

    sector = db.relationship(
        "Sector",
        back_populates="careers"
    )

    student_interests = db.relationship(
        "StudentCareerInterest",
        back_populates="career",
        cascade="all, delete-orphan"
    )

    career_skills = db.relationship(
        "CareerSkill",
        back_populates="career",
        cascade="all, delete-orphan"
    )

    career_matches = db.relationship(
        "CareerMatch",
        back_populates="career",
        cascade="all, delete-orphan"
    )

class Skill(db.Model):
    __tablename__ = "skills"

    skill_id = db.Column(db.Integer, primary_key=True)

    skill_name = db.Column(
        db.String(150),
        unique=True,
        nullable=False
    )

    category = db.Column(db.String(100))
    description = db.Column(db.Text)

    student_skills = db.relationship(
        "StudentSkill",
        back_populates="skill",
        cascade="all, delete-orphan"
    )

    career_skills = db.relationship(
        "CareerSkill",
        back_populates="skill",
        cascade="all, delete-orphan"
    )

    assessment_skills = db.relationship(
        "AssessmentSkill",
        back_populates="skill",
        cascade="all, delete-orphan"
    )

    resource_skills = db.relationship(
        "ResourceSkill",
        back_populates="skill",
        cascade="all, delete-orphan"
    )

class StudentCareerInterest(db.Model):
    __tablename__ = "student_career_interests"

    interest_id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id"),
        nullable=False
    )

    career_id = db.Column(
        db.Integer,
        db.ForeignKey("careers.career_id"),
        nullable=False
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )

    user = db.relationship(
        "User",
        back_populates="career_interests"
    )

    career = db.relationship(
        "Career",
        back_populates="student_interests"
    )

class StudentSkill(db.Model):
    __tablename__ = "student_skills"

    student_skill_id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id"),
        nullable=False
    )

    skill_id = db.Column(
        db.Integer,
        db.ForeignKey("skills.skill_id"),
        nullable=False
    )

    proficiency_level = db.Column(db.String(50))
    source_type = db.Column(db.String(50))

    updated_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    user = db.relationship(
        "User",
        back_populates="student_skills"
    )

    skill = db.relationship(
        "Skill",
        back_populates="student_skills"
    )

    __table_args__ = (
        db.UniqueConstraint(
            "user_id",
            "skill_id",
            name="uq_student_skill"
        ),
    )

class CareerSkill(db.Model):
    __tablename__ = "career_skills"

    career_skill_id = db.Column(
        db.Integer,
        primary_key=True
    )

    career_id = db.Column(
        db.Integer,
        db.ForeignKey("careers.career_id"),
        nullable=False
    )

    skill_id = db.Column(
        db.Integer,
        db.ForeignKey("skills.skill_id"),
        nullable=False
    )

    importance_weight = db.Column(
        db.Numeric(5, 2),
        nullable=False
    )

    required_level = db.Column(db.String(50))

    career = db.relationship(
        "Career",
        back_populates="career_skills"
    )

    skill = db.relationship(
        "Skill",
        back_populates="career_skills"
    )

    __table_args__ = (
        db.UniqueConstraint(
            "career_id",
            "skill_id",
            name="uq_career_skill"
        ),
    )

class Assessment(db.Model):
    __tablename__ = "assessments"

    assessment_id = db.Column(
        db.Integer,
        primary_key=True
    )

    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    assessment_type = db.Column(db.String(100))
    time_limit = db.Column(db.Integer)

    assessment_skills = db.relationship(
        "AssessmentSkill",
        back_populates="assessment",
        cascade="all, delete-orphan"
    )

    questions = db.relationship(
        "Question",
        back_populates="assessment",
        cascade="all, delete-orphan"
    )

    attempts = db.relationship(
        "AssessmentAttempt",
        back_populates="assessment",
        cascade="all, delete-orphan"
    )

class AssessmentSkill(db.Model):
    __tablename__ = "assessment_skills"

    assessment_skill_id = db.Column(
        db.Integer,
        primary_key=True
    )

    assessment_id = db.Column(
        db.Integer,
        db.ForeignKey("assessments.assessment_id"),
        nullable=False
    )

    skill_id = db.Column(
        db.Integer,
        db.ForeignKey("skills.skill_id"),
        nullable=False
    )

    assessment = db.relationship(
        "Assessment",
        back_populates="assessment_skills"
    )

    skill = db.relationship(
        "Skill",
        back_populates="assessment_skills"
    )

    __table_args__ = (
        db.UniqueConstraint(
            "assessment_id",
            "skill_id",
            name="uq_assessment_skill"
        ),
    )

class Question(db.Model):
    __tablename__ = "questions"

    question_id = db.Column(
        db.Integer,
        primary_key=True
    )

    assessment_id = db.Column(
        db.Integer,
        db.ForeignKey("assessments.assessment_id"),
        nullable=False
    )

    question_text = db.Column(db.Text, nullable=False)
    question_type = db.Column(db.String(50), nullable=False)

    marks = db.Column(
        db.Numeric(8, 2),
        nullable=False
    )

    assessment = db.relationship(
        "Assessment",
        back_populates="questions"
    )

    options = db.relationship(
        "QuestionOption",
        back_populates="question",
        cascade="all, delete-orphan"
    )

    answers = db.relationship(
        "AssessmentAnswer",
        back_populates="question"
    )

class QuestionOption(db.Model):
    __tablename__ = "question_options"

    option_id = db.Column(
        db.Integer,
        primary_key=True
    )

    question_id = db.Column(
        db.Integer,
        db.ForeignKey("questions.question_id"),
        nullable=False
    )

    option_text = db.Column(db.Text, nullable=False)
    is_correct = db.Column(db.Boolean, nullable=False, default=False)

    question = db.relationship(
        "Question",
        back_populates="options"
    )

    selected_answers = db.relationship(
        "AssessmentAnswer",
        back_populates="selected_option"
    )


class AssessmentAttempt(db.Model):
    __tablename__ = "assessment_attempts"

    attempt_id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id"),
        nullable=False
    )

    assessment_id = db.Column(
        db.Integer,
        db.ForeignKey("assessments.assessment_id"),
        nullable=False
    )

    started_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )

    completed_at = db.Column(
        db.DateTime(timezone=True),
        nullable=True
    )

    total_score = db.Column(db.Numeric(8, 2))

    status = db.Column(
        db.String(50),
        nullable=False,
        default="in_progress"
    )

    user = db.relationship(
        "User",
        back_populates="assessment_attempts"
    )

    assessment = db.relationship(
        "Assessment",
        back_populates="attempts"
    )

    answers = db.relationship(
        "AssessmentAnswer",
        back_populates="attempt",
        cascade="all, delete-orphan"
    )

class AssessmentAnswer(db.Model):
    __tablename__ = "assessment_answers"

    answer_id = db.Column(
        db.Integer,
        primary_key=True
    )

    attempt_id = db.Column(
        db.Integer,
        db.ForeignKey("assessment_attempts.attempt_id"),
        nullable=False
    )

    question_id = db.Column(
        db.Integer,
        db.ForeignKey("questions.question_id"),
        nullable=False
    )

    selected_option_id = db.Column(
        db.Integer,
        db.ForeignKey("question_options.option_id"),
        nullable=True
    )

    answer_text = db.Column(db.Text)

    awarded_marks = db.Column(
        db.Numeric(8, 2)
    )

    attempt = db.relationship(
        "AssessmentAttempt",
        back_populates="answers"
    )

    question = db.relationship(
        "Question",
        back_populates="answers"
    )

    selected_option = db.relationship(
        "QuestionOption",
        back_populates="selected_answers"
    )

class LearningResource(db.Model):
    __tablename__ = "learning_resources"

    resource_id = db.Column(
        db.Integer,
        primary_key=True
    )

    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    resource_url = db.Column(db.Text)
    resource_type = db.Column(db.String(100))

    resource_skills = db.relationship(
        "ResourceSkill",
        back_populates="resource",
        cascade="all, delete-orphan"
    )

    learning_progress = db.relationship(
        "LearningProgress",
        back_populates="resource",
        cascade="all, delete-orphan"
    )

class ResourceSkill(db.Model):
    __tablename__ = "resource_skills"

    resource_skill_id = db.Column(
        db.Integer,
        primary_key=True
    )

    resource_id = db.Column(
        db.Integer,
        db.ForeignKey("learning_resources.resource_id"),
        nullable=False
    )

    skill_id = db.Column(
        db.Integer,
        db.ForeignKey("skills.skill_id"),
        nullable=False
    )

    resource = db.relationship(
        "LearningResource",
        back_populates="resource_skills"
    )

    skill = db.relationship(
        "Skill",
        back_populates="resource_skills"
    )

    __table_args__ = (
        db.UniqueConstraint(
            "resource_id",
            "skill_id",
            name="uq_resource_skill"
        ),
    )

class LearningProgress(db.Model):
    __tablename__ = "learning_progress"

    progress_id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id"),
        nullable=False
    )

    resource_id = db.Column(
        db.Integer,
        db.ForeignKey("learning_resources.resource_id"),
        nullable=False
    )

    status = db.Column(
        db.String(50),
        nullable=False,
        default="not_started"
    )

    started_at = db.Column(
        db.DateTime(timezone=True)
    )

    completed_at = db.Column(
        db.DateTime(timezone=True)
    )

    user = db.relationship(
        "User",
        back_populates="learning_progress"
    )

    resource = db.relationship(
        "LearningResource",
        back_populates="learning_progress"
    )

    __table_args__ = (
        db.UniqueConstraint(
            "user_id",
            "resource_id",
            name="uq_user_learning_resource"
        ),
    )

class CareerMatch(db.Model):
    __tablename__ = "career_matches"

    match_id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id"),
        nullable=False
    )

    career_id = db.Column(
        db.Integer,
        db.ForeignKey("careers.career_id"),
        nullable=False
    )

    compatibility_score = db.Column(
        db.Numeric(5, 2),
        nullable=False
    )

    generated_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )

    user = db.relationship(
        "User",
        back_populates="career_matches"
    )

    career = db.relationship(
        "Career",
        back_populates="career_matches"
    )
