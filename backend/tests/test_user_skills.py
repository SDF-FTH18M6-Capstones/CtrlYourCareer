
from app.extensions import db
from app.models import User, Skill
from flask_jwt_extended import create_access_token


def test_user_can_add_skill(client, app):
    with app.app_context():
        user = User(
            username="skilluser",
            email="skilluser@example.com",
            password_hash="test-hash"
        )

        skill = Skill(name="Python")

        db.session.add_all([user, skill])
        db.session.commit()

        user_id = user.id
        skill_id = skill.id

        token = create_access_token(
            identity=str(user_id)
        )

    response = client.post(
        "/api/my-skills",
        json={
            "skill_id": skill_id,
            "proficiency_level": "Intermediate",
            "years_experience": 2
        },
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 201
    assert response.get_json()["name"] == "Python"


def test_user_cannot_add_same_skill_twice(client, app):
    with app.app_context():
        user = User(
            username="duplicateuser",
            email="duplicate@example.com",
            password_hash="test-hash"
        )

        skill = Skill(name="JavaScript")

        db.session.add_all([user, skill])
        db.session.commit()

        user_id = user.id
        skill_id = skill.id

        token = create_access_token(
            identity=str(user_id)
        )

    headers = {
        "Authorization": f"Bearer {token}"
    }

    payload = {
        "skill_id": skill_id,
        "proficiency_level": "Beginner",
        "years_experience": 0
    }

    first = client.post(
        "/api/my-skills",
        json=payload,
        headers=headers
    )

    second = client.post(
        "/api/my-skills",
        json=payload,
        headers=headers
    )

    assert first.status_code == 201
    assert second.status_code == 409
