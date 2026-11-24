import hashlib
from datetime import timedelta

from config import Config

# Use an isolated temporary database.
Config.SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
Config.TESTING = True
Config.ADMIN_SETUP_KEY = "temporary-test-setup-key-not-for-production"
Config.ADMIN_INVITATION_EXPIRY_HOURS = 24
Config.ADMIN_KEY_REGISTRATION_ENABLED = True

from app import create_app
from app.extensions import db, bcrypt
from app.models import User
from app.admin_models import (
    AdminCredential,
    AdminInvitation,
    AdminSetup,
    utcnow,
)
from flask_jwt_extended import create_access_token


app = create_app()

passed = 0


def check(description, condition):
    global passed

    if not condition:
        print(f"[FAIL] {description}")
        raise AssertionError(description)

    passed += 1
    print(f"[PASS] {description}")


def auth_headers(token):
    return {
        "Authorization": f"Bearer {token}"
    }


def login_admin(client, email, password, pin):
    response = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )

    check(
        f"Administrator login: {email}",
        response.status_code == 200,
    )

    data = response.get_json()

    check(
        "Administrator PIN challenge required",
        data.get("requires_admin_pin") is True,
    )

    response = client.post(
        "/api/auth/admin/verify-pin",
        json={
            "challenge": data["challenge"],
            "pin": pin,
        },
    )

    check(
        "Administrator PIN verification",
        response.status_code == 200,
    )

    return response.get_json()["access_token"]


with app.app_context():

    assert db.engine.url.database == ":memory:"

    db.create_all()

    client = app.test_client()

    print("\n========================================")
    print("CTRL YOUR CAREER - ADMIN INVITATION TESTS")
    print("========================================")

    # ======================================
    # 1. FIRST ADMINISTRATOR REGISTRATION
    # ======================================

    print("\n===== FIRST ADMINISTRATOR =====")

    response = client.post(
        "/api/admin/setup/register",
        json={
            "username": "First Admin",
            "email": "admin@example.com",
            "password": "AdminPassword123!",
            "pin": "123456",
            "setup_key": Config.ADMIN_SETUP_KEY,
        },
    )

    check(
        "First administrator registration",
        response.status_code == 201,
    )

    admin = User.query.filter_by(
        email="admin@example.com"
    ).first()

    check(
        "Correct administrator role",
        admin is not None and admin.role == "admin",
    )

    check(
        "Initial setup permanently recorded",
        db.session.get(AdminSetup, 1) is not None,
    )

    # ======================================
    # 2. ADMIN LOGIN AND PIN VERIFICATION
    # ======================================

    print("\n===== ADMIN AUTHENTICATION =====")

    admin_token = login_admin(
        client,
        "admin@example.com",
        "AdminPassword123!",
        "123456",
    )

    headers = auth_headers(admin_token)

    # ======================================
    # 3. ACCESS CONTROL
    # ======================================

    print("\n===== ACCESS CONTROL =====")

    response = client.get("/api/admin/invitations")

    check(
        "Unauthenticated access denied",
        response.status_code == 401,
    )

    unverified_token = create_access_token(
        identity=str(admin.id),
        additional_claims={
            "admin_verified": False
        },
    )

    response = client.get(
        "/api/admin/invitations",
        headers=auth_headers(unverified_token),
    )

    check(
        "Administrator without PIN verification denied",
        response.status_code == 403,
    )

    regular_user = User(
        username="Regular User",
        email="user@example.com",
        password_hash=bcrypt.generate_password_hash(
            "UserPassword123!"
        ).decode("utf-8"),
        role="student",
        created_at=utcnow(),
    )

    db.session.add(regular_user)
    db.session.commit()

    regular_token = create_access_token(
        identity=str(regular_user.id),
        additional_claims={
            "admin_verified": False
        },
    )

    response = client.get(
        "/api/admin/invitations",
        headers=auth_headers(regular_token),
    )

    check(
        "Regular user cannot list invitations",
        response.status_code == 403,
    )

    response = client.post(
        "/api/admin/invitations",
        headers=auth_headers(regular_token),
        json={"email": "blocked@example.com"},
    )

    check(
        "Regular user cannot create invitations",
        response.status_code == 403,
    )

    # ======================================
    # 4. CREATE ADMIN INVITATION
    # ======================================

    print("\n===== INVITATION CREATION =====")

    response = client.post(
        "/api/admin/invitations",
        headers=headers,
        json={"email": "secondadmin@example.com"},
    )

    check(
        "Administrator invitation created",
        response.status_code == 201,
    )

    invitation_data = response.get_json()

    invitation_token = invitation_data["token"]
    invitation_id = invitation_data["invitation"]["id"]

    invitation = db.session.get(
        AdminInvitation,
        invitation_id,
    )

    check(
        "Invitation status is pending",
        invitation.status == "pending",
    )

    expected_hash = hashlib.sha256(
        invitation_token.encode("utf-8")
    ).hexdigest()

    check(
        "Invitation token securely hashed",
        invitation.token_hash == expected_hash
        and invitation.token_hash != invitation_token,
    )

    check(
        "Invitation expires after 24 hours",
        invitation.expires_at - invitation.created_at
        == timedelta(hours=24),
    )

    # ======================================
    # 5. DUPLICATE INVITATION
    # ======================================

    response = client.post(
        "/api/admin/invitations",
        headers=headers,
        json={"email": "secondadmin@example.com"},
    )

    check(
        "Duplicate active invitation rejected",
        response.status_code == 409,
    )

    # ======================================
    # 6. LIST INVITATIONS
    # ======================================

    response = client.get(
        "/api/admin/invitations",
        headers=headers,
    )

    check(
        "Verified administrator can list invitations",
        response.status_code == 200,
    )

    check(
        "Invitation appears in invitation list",
        any(
            item["id"] == invitation_id
            for item in response.get_json()
        ),
    )

    check(
        "Invitation list does not expose token hashes",
        all(
            "token_hash" not in item and "token" not in item
            for item in response.get_json()
        ),
    )

    # ======================================
    # 7. VALIDATE INVITATION
    # ======================================

    print("\n===== INVITATION VALIDATION =====")

    response = client.post(
        "/api/admin/invitations/validate",
        json={"token": invitation_token},
    )

    check(
        "Valid invitation accepted",
        response.status_code == 200,
    )

    check(
        "Invitation email matches recipient",
        response.get_json()["email"]
        == "secondadmin@example.com",
    )

    # ======================================
    # 8. INCORRECT EMAIL
    # ======================================

    registration_data = {
        "username": "Second Admin",
        "email": "wrong@example.com",
        "password": "SecondPassword123!",
        "pin": "654321",
        "token": invitation_token,
    }

    response = client.post(
        "/api/admin/invitations/accept",
        json=registration_data,
    )

    check(
        "Incorrect recipient email rejected",
        response.status_code == 403,
    )

    # ======================================
    # 9. ACCEPT INVITATION
    # ======================================

    print("\n===== INVITATION ACCEPTANCE =====")

    registration_data["email"] = "secondadmin@example.com"

    response = client.post(
        "/api/admin/invitations/accept",
        json=registration_data,
    )

    check(
        "Invited administrator registered",
        response.status_code == 201,
    )

    second_admin = User.query.filter_by(
        email="secondadmin@example.com"
    ).first()

    check(
        "Invited user has administrator role",
        second_admin is not None
        and second_admin.role == "admin",
    )

    db.session.refresh(invitation)

    check(
        "Invitation marked as accepted",
        invitation.status == "accepted",
    )

    check(
        "Invitation linked to new administrator",
        invitation.accepted_by == second_admin.id,
    )

    credential = AdminCredential.query.filter_by(
        user_id=second_admin.id
    ).first()

    check(
        "Invited administrator PIN correctly hashed",
        credential is not None
        and bcrypt.check_password_hash(
            credential.pin_hash,
            "654321",
        )
        and credential.pin_hash != "654321",
    )

    # ======================================
    # 10. PREVENT INVITATION REUSE
    # ======================================

    response = client.post(
        "/api/admin/invitations/accept",
        json=registration_data,
    )

    check(
        "Used invitation cannot be reused",
        response.status_code == 400,
    )

    # ======================================
    # 11. REVOKE INVITATION
    # ======================================

    print("\n===== INVITATION REVOCATION =====")

    response = client.post(
        "/api/admin/invitations",
        headers=headers,
        json={"email": "revoked@example.com"},
    )

    check(
        "Revocation test invitation created",
        response.status_code == 201,
    )

    revoked_data = response.get_json()
    revoked_id = revoked_data["invitation"]["id"]
    revoked_token = revoked_data["token"]

    response = client.delete(
        f"/api/admin/invitations/{revoked_id}",
        headers=headers,
    )

    check(
        "Pending invitation successfully revoked",
        response.status_code == 200,
    )

    response = client.post(
        "/api/admin/invitations/validate",
        json={"token": revoked_token},
    )

    check(
        "Revoked invitation validation rejected",
        response.status_code == 400,
    )

    response = client.post(
        "/api/admin/invitations/accept",
        json={
            "username": "Revoked Admin",
            "email": "revoked@example.com",
            "password": "RevokedPassword123!",
            "pin": "112233",
            "token": revoked_token,
        },
    )

    check(
        "Revoked invitation registration rejected",
        response.status_code == 400,
    )

    # ======================================
    # 12. EXPIRED INVITATION
    # ======================================

    print("\n===== INVITATION EXPIRATION =====")

    response = client.post(
        "/api/admin/invitations",
        headers=headers,
        json={"email": "expired@example.com"},
    )

    check(
        "Expiration test invitation created",
        response.status_code == 201,
    )

    expired_data = response.get_json()

    expired_invitation = db.session.get(
        AdminInvitation,
        expired_data["invitation"]["id"],
    )

    expired_invitation.expires_at = (
        utcnow() - timedelta(minutes=1)
    )

    db.session.commit()

    check(
        "Invitation status is expired",
        expired_invitation.status == "expired",
    )

    response = client.post(
        "/api/admin/invitations/validate",
        json={"token": expired_data["token"]},
    )

    check(
        "Expired invitation validation rejected",
        response.status_code == 400,
    )

    response = client.post(
        "/api/admin/invitations/accept",
        json={
            "username": "Expired Admin",
            "email": "expired@example.com",
            "password": "ExpiredPassword123!",
            "pin": "445566",
            "token": expired_data["token"],
        },
    )

    check(
        "Expired invitation registration rejected",
        response.status_code == 400,
    )

    # ======================================
    # 13. NEW ADMINISTRATOR LOGIN
    # ======================================

    print("\n===== NEW ADMINISTRATOR LOGIN =====")

    second_token = login_admin(
        client,
        "secondadmin@example.com",
        "SecondPassword123!",
        "654321",
    )

    response = client.get(
        "/api/admin/invitations",
        headers=auth_headers(second_token),
    )

    check(
        "New administrator can manage invitations",
        response.status_code == 200,
    )

    # ======================================
    # FINAL DATABASE VERIFICATION
    # ======================================

    print("\n===== FINAL DATABASE VERIFICATION =====")

    total_admins = User.query.filter_by(
        role="admin"
    ).count()

    total_invitations = AdminInvitation.query.count()

    check(
        "Exactly two administrators exist",
        total_admins == 2,
    )

    check(
        "Exactly three invitations exist",
        total_invitations == 3,
    )

    print("\n===== REUSABLE ADMINISTRATOR KEY =====")
    payload = {
        "username": "Third Admin",
        "email": "thirdadmin@example.com",
        "password": "ThirdPassword123!",
        "pin": "789123",
        "setup_key": Config.ADMIN_SETUP_KEY,
    }
    response = client.get("/api/admin/setup/status")
    check("Key registration remains available", response.status_code == 200 and response.get_json()["setup_available"] is True)
    response = client.post("/api/admin/setup/register", json={**payload, "setup_key": "wrong"})
    check("Incorrect key rejected", response.status_code == 403)
    response = client.post("/api/admin/setup/register", json=payload)
    check("Additional administrator registered with key", response.status_code == 201)
    third = User.query.filter_by(email=payload["email"]).first()
    check("Correct role", third is not None and third.role == "admin")
    credential = AdminCredential.query.filter_by(user_id=third.id).first()
    check("PIN hashed", credential is not None and credential.pin_hash != payload["pin"] and bcrypt.check_password_hash(credential.pin_hash, payload["pin"]))
    response = client.post("/api/admin/setup/register", json=payload)
    check("Duplicate email rejected", response.status_code == 409)
    third_token = login_admin(client, payload["email"], payload["password"], payload["pin"])
    response = client.get("/api/admin/invitations", headers=auth_headers(third_token))
    check("Key-registered admin can manage invitations", response.status_code == 200)
    app.config["ADMIN_KEY_REGISTRATION_ENABLED"] = False
    response = client.get("/api/admin/setup/status")
    check("Disabled key registration unavailable", response.status_code == 200 and response.get_json()["setup_available"] is False)
    response = client.post("/api/admin/setup/register", json={**payload, "email": "blocked@example.com"})
    check("Disabled registration rejects valid key", response.status_code == 403)
    response = client.post("/api/admin/invitations", headers=auth_headers(third_token), json={"email": "fourthadmin@example.com"})
    check("Invitations still available", response.status_code == 201)
    response = client.post("/api/admin/invitations/accept", json={"username": "Fourth Admin", "email": "fourthadmin@example.com", "password": "FourthPassword123!", "pin": "987654", "token": response.get_json()["token"]})
    check("Invitation acceptance independent of key switch", response.status_code == 201)
    check("Exactly four administrators exist", User.query.filter_by(role="admin").count() == 4)
    print(f"\nSUCCESS! {passed} total checks passed.")
    print("Database: Temporary in-memory SQLite")
