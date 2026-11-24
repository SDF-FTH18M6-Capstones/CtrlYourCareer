from datetime import datetime, timezone
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.admin_security import admin_required
from app.extensions import db
from app.models import User
from app.referral_models import Company, Job, Referral, Notification

referrals_bp = Blueprint("employment", __name__, url_prefix="/api")

def body():
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else {}

def valid(value, limit):
    return isinstance(value, str) and 0 < len(value.strip()) <= limit

def job_json(j):
    return dict(id=j.id, company_id=j.company_id, company=j.company.name, title=j.title, description=j.description, active=j.active)

def referral_json(r):
    return dict(id=r.id, user_id=r.user_id, job=job_json(r.job), status=r.status, consent_at=r.consent_at.isoformat() if r.consent_at else None)

def notify(r):
    db.session.add(Notification(user_id=r.user_id, message=f"Referral #{r.id}: {r.status}"))

@referrals_bp.route("/admin/companies", methods=["GET", "POST"])
@admin_required
def companies():
    if request.method == "POST":
        name = body().get("name")
        if not valid(name, 150): return jsonify(error="Valid company name required"), 400
        db.session.add(Company(name=name.strip()))
        db.session.commit()
    return jsonify([dict(id=c.id, name=c.name) for c in Company.query.all()])

@referrals_bp.route("/admin/jobs", methods=["GET", "POST"])
@admin_required
def jobs():
    if request.method == "POST":
        d = body()
        if type(d.get("company_id")) is not int or not db.session.get(Company, d["company_id"]) or not valid(d.get("title"),150) or not valid(d.get("description"),5000):
            return jsonify(error="Valid company, title and description required"),400
        db.session.add(Job(company_id=d["company_id"], title=d["title"].strip(), description=d["description"].strip()))
        db.session.commit()
    return jsonify([job_json(j) for j in Job.query.all()])

@referrals_bp.patch("/admin/jobs/<int:id>")
@admin_required
def close_job(id):
    j = db.session.get(Job,id)
    if not j: return jsonify(error="Job not found"),404
    j.active = False
    db.session.commit()
    return jsonify(job_json(j))

@referrals_bp.route("/admin/referrals", methods=["GET", "POST"])
@admin_required
def admin_referrals():
    if request.method == "POST":
        d = body()
        if type(d.get("user_id")) is not int or type(d.get("job_id")) is not int: return jsonify(error="Integer IDs required"),400
        u,j = db.session.get(User,d["user_id"]),db.session.get(Job,d["job_id"])
        if not u or u.role == "admin" or not j or not j.active: return jsonify(error="Invalid user or job"),400
        if Referral.query.filter_by(user_id=u.id,job_id=j.id).first(): return jsonify(error="Referral already exists"),409
        r = Referral(user_id=u.id,job_id=j.id)
        db.session.add(r); db.session.flush(); notify(r); db.session.commit()
    return jsonify([referral_json(r) for r in Referral.query.all()])

@referrals_bp.patch("/admin/referrals/<int:id>/status")
@admin_required
def status(id):
    r = db.session.get(Referral,id)
    if not r: return jsonify(error="Referral not found"),404
    target = body().get("status")
    if not r.consent_at or target not in {"referred", "hired", "unsuccessful"} or (r.status,target) not in {("accepted","referred"),("referred","hired"),("referred","unsuccessful")}:
        return jsonify(error="Invalid transition or missing consent"),409
    r.status=target; notify(r); db.session.commit()
    return jsonify(referral_json(r))

@referrals_bp.get("/referrals")
@jwt_required()
def mine():
    return jsonify([referral_json(r) for r in Referral.query.filter_by(user_id=int(get_jwt_identity())).all()])

@referrals_bp.post("/referrals/<int:id>/<action>")
@jwt_required()
def respond(id,action):
    r=Referral.query.filter_by(id=id,user_id=int(get_jwt_identity())).first()
    if not r: return jsonify(error="Referral not found"),404
    if r.status != "pending" or action not in {"accept","decline"}: return jsonify(error="Invalid response"),409
    if action == "accept" and (body().get("consent") is not True or not r.job.active): return jsonify(error="Explicit consent and active job required"),400
    r.status="accepted" if action=="accept" else "declined"
    if action=="accept": r.consent_at=datetime.now(timezone.utc).replace(tzinfo=None)
    notify(r); db.session.commit()
    return jsonify(referral_json(r))

@referrals_bp.get("/notifications")
@jwt_required()
def notifications():
    return jsonify([dict(id=n.id,message=n.message,read=n.read) for n in Notification.query.filter_by(user_id=int(get_jwt_identity())).order_by(Notification.id.desc()).all()])

@referrals_bp.patch("/notifications/<int:id>/read")
@jwt_required()
def read(id):
    n=Notification.query.filter_by(id=id,user_id=int(get_jwt_identity())).first()
    if not n: return jsonify(error="Notification not found"),404
    n.read=True; db.session.commit(); return jsonify(read=True)
