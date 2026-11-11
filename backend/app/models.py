from datetime import datetime, timezone

from app.extensions import db


class User(db.Model):
    __tablename__ = "users"

    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=True)

    profile = db.relationship(
        "StudentProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    career_interests = db.relationship(
        "StudentCareerInterest",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    student_skills = db.relationship(
        "StudentSkill",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    assessment_attempts = db.relationship(
        "AssessmentAttempt",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    learning_progress = db.relationship(
        "LearningProgress",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    career_matches = db.relationship(
        "CareerMatch",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    def __str__(self):
        return self.full_name


class StudentProfile(db.Model):
    __tablename__ = "student_profiles"

    profile_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id"),
        unique=True,
        nullable=False,
    )
    institution = db.Column(db.String(255), nullable=True)
    course = db.Column(db.String(255), nullable=True)
    education_level = db.Column(db.String(50), nullable=True)
    graduation_year = db.Column(db.Integer, nullable=True)

    user = db.relationship("User", back_populates="profile")


class Sector(db.Model):
    __tablename__ = "sectors"

    sector_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    sector_name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)

    careers = db.relationship("Career", back_populates="sector")

    def __str__(self):
        return self.sector_name


class Career(db.Model):
    __tablename__ = "careers"

    career_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    sector_id = db.Column(
        db.Integer,
        db.ForeignKey("sectors.sector_id"),
        nullable=False,
    )
    career_name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    education_requirements = db.Column(db.Text, nullable=True)

    sector = db.relationship("Sector", back_populates="careers")
    student_interests = db.relationship(
        "StudentCareerInterest",
        back_populates="career",
        cascade="all, delete-orphan",
    )
    career_skills = db.relationship(
        "CareerSkill",
        back_populates="career",
        cascade="all, delete-orphan",
    )
    career_matches = db.relationship(
        "CareerMatch",
        back_populates="career",
        cascade="all, delete-orphan",
    )

    def __str__(self):
        return self.career_name


class Skill(db.Model):
    __tablename__ = "skills"

    skill_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    skill_name = db.Column(db.String(100), unique=True, nullable=False)
    category = db.Column(db.String(50), nullable=True)
    description = db.Column(db.Text, nullable=True)

    student_skills = db.relationship(
        "StudentSkill",
        back_populates="skill",
        cascade="all, delete-orphan",
    )
    career_skills = db.relationship(
        "CareerSkill",
        back_populates="skill",
        cascade="all, delete-orphan",
    )
    assessment_skills = db.relationship(
        "AssessmentSkill",
        back_populates="skill",
        cascade="all, delete-orphan",
    )
    resource_skills = db.relationship(
        "ResourceSkill",
        back_populates="skill",
        cascade="all, delete-orphan",
    )

    def __str__(self):
        return self.skill_name


class StudentCareerInterest(db.Model):
    __tablename__ = "student_career_interests"

    interest_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id"),
        nullable=False,
    )
    career_id = db.Column(
        db.Integer,
        db.ForeignKey("careers.career_id"),
        nullable=False,
    )
    created_at = db.Column(db.DateTime(timezone=True), nullable=True)

    user = db.relationship("User", back_populates="career_interests")
    career = db.relationship("Career", back_populates="student_interests")


class StudentSkill(db.Model):
    __tablename__ = "student_skills"

    student_skill_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id"),
        nullable=False,
    )
    skill_id = db.Column(
        db.Integer,
        db.ForeignKey("skills.skill_id"),
        nullable=False,
    )
    proficiency_level = db.Column(db.String(50), nullable=True)
    source_type = db.Column(db.String(50), nullable=True)
    updated_at = db.Column(db.DateTime(timezone=True), nullable=True)

    user = db.relationship("User", back_populates="student_skills")
    skill = db.relationship("Skill", back_populates="student_skills")


class CareerSkill(db.Model):
    __tablename__ = "career_skills"

    career_skill_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    career_id = db.Column(
        db.Integer,
        db.ForeignKey("careers.career_id"),
        nullable=False,
    )
    skill_id = db.Column(
        db.Integer,
        db.ForeignKey("skills.skill_id"),
        nullable=False,
    )
    importance_weight = db.Column(db.Numeric(5, 2), nullable=True)
    required_level = db.Column(db.String(50), nullable=True)

    career = db.relationship("Career", back_populates="career_skills")
    skill = db.relationship("Skill", back_populates="career_skills")


class Assessment(db.Model):
    __tablename__ = "assessments"

    assessment_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    assessment_type = db.Column(db.String(50), nullable=True)
    time_limit = db.Column(db.Integer, nullable=True)

    assessment_skills = db.relationship(
        "AssessmentSkill",
        back_populates="assessment",
        cascade="all, delete-orphan",
    )
    questions = db.relationship(
        "Question",
        back_populates="assessment",
        cascade="all, delete-orphan",
    )
    attempts = db.relationship(
        "AssessmentAttempt",
        back_populates="assessment",
        cascade="all, delete-orphan",
    )

    def __str__(self):
        return self.title


class AssessmentSkill(db.Model):
    __tablename__ = "assessment_skills"

    assessment_skill_id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True,
    )
    assessment_id = db.Column(
        db.Integer,
        db.ForeignKey("assessments.assessment_id"),
        nullable=False,
    )
    skill_id = db.Column(
        db.Integer,
        db.ForeignKey("skills.skill_id"),
        nullable=False,
    )

    assessment = db.relationship("Assessment", back_populates="assessment_skills")
    skill = db.relationship("Skill", back_populates="assessment_skills")


class Question(db.Model):
    __tablename__ = "questions"

    question_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    assessment_id = db.Column(
        db.Integer,
        db.ForeignKey("assessments.assessment_id"),
        nullable=False,
    )
    question_text = db.Column(db.Text, nullable=False)
    question_type = db.Column(db.String(50), nullable=True)
    marks = db.Column(db.Numeric(5, 2), nullable=True)

    assessment = db.relationship("Assessment", back_populates="questions")
    options = db.relationship(
        "QuestionOption",
        back_populates="question",
        cascade="all, delete-orphan",
    )
    answers = db.relationship("AssessmentAnswer", back_populates="question")


class QuestionOption(db.Model):
    __tablename__ = "question_options"

    option_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    question_id = db.Column(
        db.Integer,
        db.ForeignKey("questions.question_id"),
        nullable=False,
    )
    option_text = db.Column(db.Text, nullable=False)
    is_correct = db.Column(db.Boolean, nullable=False)

    question = db.relationship("Question", back_populates="options")
    selected_answers = db.relationship(
        "AssessmentAnswer",
        back_populates="selected_option",
    )


class AssessmentAttempt(db.Model):
    __tablename__ = "assessment_attempts"

    attempt_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id"),
        nullable=False,
    )
    assessment_id = db.Column(
        db.Integer,
        db.ForeignKey("assessments.assessment_id"),
        nullable=False,
    )
    started_at = db.Column(db.DateTime(timezone=True), nullable=True)
    completed_at = db.Column(db.DateTime(timezone=True), nullable=True)
    total_score = db.Column(db.Numeric(6, 2), nullable=True)
    status = db.Column(db.String(20), nullable=True)

    user = db.relationship("User", back_populates="assessment_attempts")
    assessment = db.relationship("Assessment", back_populates="attempts")
    answers = db.relationship(
        "AssessmentAnswer",
        back_populates="attempt",
        cascade="all, delete-orphan",
    )


class AssessmentAnswer(db.Model):
    __tablename__ = "assessment_answers"

    answer_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    attempt_id = db.Column(
        db.Integer,
        db.ForeignKey("assessment_attempts.attempt_id"),
        nullable=False,
    )
    question_id = db.Column(
        db.Integer,
        db.ForeignKey("questions.question_id"),
        nullable=False,
    )
    selected_option_id = db.Column(
        db.Integer,
        db.ForeignKey("question_options.option_id"),
        nullable=True,
    )
    answer_text = db.Column(db.Text, nullable=True)
    awarded_marks = db.Column(db.Numeric(5, 2), nullable=True)

    attempt = db.relationship("AssessmentAttempt", back_populates="answers")
    question = db.relationship("Question", back_populates="answers")
    selected_option = db.relationship(
        "QuestionOption",
        back_populates="selected_answers",
    )


class LearningResource(db.Model):
    __tablename__ = "learning_resources"

    resource_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    resource_url = db.Column(db.Text, nullable=True)
    resource_type = db.Column(db.String(50), nullable=True)

    resource_skills = db.relationship(
        "ResourceSkill",
        back_populates="resource",
        cascade="all, delete-orphan",
    )
    learning_progress = db.relationship(
        "LearningProgress",
        back_populates="resource",
        cascade="all, delete-orphan",
    )

    def __str__(self):
        return self.title


class ResourceSkill(db.Model):
    __tablename__ = "resource_skills"

    resource_skill_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    resource_id = db.Column(
        db.Integer,
        db.ForeignKey("learning_resources.resource_id"),
        nullable=False,
    )
    skill_id = db.Column(
        db.Integer,
        db.ForeignKey("skills.skill_id"),
        nullable=False,
    )

    resource = db.relationship("LearningResource", back_populates="resource_skills")
    skill = db.relationship("Skill", back_populates="resource_skills")


class LearningProgress(db.Model):
    __tablename__ = "learning_progress"

    progress_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id"),
        nullable=False,
    )
    resource_id = db.Column(
        db.Integer,
        db.ForeignKey("learning_resources.resource_id"),
        nullable=False,
    )
    status = db.Column(db.String(20), nullable=True)
    started_at = db.Column(db.DateTime(timezone=True), nullable=True)
    completed_at = db.Column(db.DateTime(timezone=True), nullable=True)

    user = db.relationship("User", back_populates="learning_progress")
    resource = db.relationship("LearningResource", back_populates="learning_progress")


class CareerMatch(db.Model):
    __tablename__ = "career_matches"

    match_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id"),
        nullable=False,
    )
    career_id = db.Column(
        db.Integer,
        db.ForeignKey("careers.career_id"),
        nullable=False,
    )
    compatibility_score = db.Column(db.Numeric(5, 2), nullable=True)
    generated_at = db.Column(db.DateTime(timezone=True), nullable=True)

    user = db.relationship("User", back_populates="career_matches")
    career = db.relationship("Career", back_populates="career_matches")
