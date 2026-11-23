from datetime import datetime, timezone
from app.extensions import db

class CareerJourney(db.Model):
    __tablename__ = "career_journeys"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    career_id = db.Column(db.Integer, db.ForeignKey("careers.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None), nullable=False)
    career = db.relationship("Career")
    steps = db.relationship("JourneyStep", back_populates="journey", cascade="all, delete-orphan", order_by="JourneyStep.position")
    __table_args__ = (db.UniqueConstraint("user_id", "career_id", name="uq_user_career_journey"),)

class JourneyStep(db.Model):
    __tablename__ = "journey_steps"
    id = db.Column(db.Integer, primary_key=True)
    journey_id = db.Column(db.Integer, db.ForeignKey("career_journeys.id"), nullable=False)
    skill_id = db.Column(db.Integer, db.ForeignKey("skills.id"), nullable=False)
    position = db.Column(db.Integer, nullable=False)
    target_level = db.Column(db.String(30), nullable=False)
    completed = db.Column(db.Boolean, nullable=False, default=False)
    journey = db.relationship("CareerJourney", back_populates="steps")
    skill = db.relationship("Skill")

class LearningResource(db.Model):
    __tablename__ = "learning_resources"
    id = db.Column(db.Integer, primary_key=True)
    skill_id = db.Column(db.Integer, db.ForeignKey("skills.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    resource_type = db.Column(db.String(30), nullable=False, default="article")
    url = db.Column(db.String(1000), nullable=False)
    difficulty = db.Column(db.String(30))
