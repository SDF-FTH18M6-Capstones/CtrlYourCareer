from app.extensions import db

class ResourceCompletion(db.Model):
    __tablename__ = "resource_completions"
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), primary_key=True)
    resource_id = db.Column(db.Integer, db.ForeignKey("learning_resources.id"), primary_key=True)
