from app.extensions import db

class Company(db.Model):
    __tablename__ = "companies"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)

class Job(db.Model):
    __tablename__ = "job_opportunities"
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey("companies.id"), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    active = db.Column(db.Boolean, default=True, nullable=False)
    company = db.relationship(Company)

class Referral(db.Model):
    __tablename__ = "referrals"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey("job_opportunities.id"), nullable=False)
    status = db.Column(db.String(30), default="pending", nullable=False)
    consent_at = db.Column(db.DateTime)
    job = db.relationship(Job)
    __table_args__ = (db.UniqueConstraint("user_id", "job_id", name="uq_referral_user_job"),)

class Notification(db.Model):
    __tablename__ = "notifications"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    message = db.Column(db.String(300), nullable=False)
    read = db.Column(db.Boolean, default=False, nullable=False)

