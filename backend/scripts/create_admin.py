import getpass
from app import create_app
from app.extensions import db, bcrypt
from app.models import User
from app.admin_models import AdminCredential

app = create_app()
with app.app_context():
    email = input("Existing account email: ").strip().lower()
    user = User.query.filter_by(email=email).first()
    if user is None:
        raise SystemExit("Create the account normally first")
    pin = getpass.getpass("Unique six-digit PIN: ")
    if len(pin) != 6 or not pin.isascii() or not pin.isdigit():
        raise SystemExit("PIN must be exactly six ASCII digits")
    cred = AdminCredential.query.filter_by(user_id=user.id).first()
    if cred is None:
        cred = AdminCredential(user_id=user.id)
        db.session.add(cred)
    cred.pin_hash = bcrypt.generate_password_hash(pin).decode()
    cred.failed_attempts = 0
    cred.locked_until = None
    user.role = "admin"
    db.session.commit()
    print("Admin configured")
