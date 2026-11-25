from flask_jwt_extended import create_access_token

from app.models import User

def test_get_skills(client, auth_headers):

    response = client.get(
        "/api/skills",
        headers=auth_headers,
    )

    assert response.status_code == 200


def test_get_skills_without_token(client):

    response = client.get("/api/skills")

    assert response.status_code == 401


def test_get_missing_skill(client, auth_headers):

    response = client.get(
        "/api/skills/99999",
        headers=auth_headers,
    )

    assert response.status_code == 404

def test_create_skill(client, admin_headers):

    response = client.post(
        "/api/skills",
        headers=admin_headers,
        json={
            "name": "Python",
            "category": "Programming",
            "description": "Backend programming language.",
        },
    )

    assert response.status_code == 201

    data = response.get_json()

    assert data["name"] == "Python"


def test_create_skill_invalid_data(
    client,
    admin_headers,
):

    response = client.post(
        "/api/skills",
        headers=admin_headers,
        json={
            "name": "P",
            "category": "Programming",
        },
    )

    assert response.status_code == 400


def test_create_skill_without_token(client):

    response = client.post(
        "/api/skills",
        json={
            "name": "Python",
            "category": "Programming",
            "description": "Backend programming language.",
        },
    )

    assert response.status_code == 401


def test_regular_user_cannot_create_skill(
    client,
    auth_headers,
):

    response = client.post(
        "/api/skills",
        headers=auth_headers,
        json={
            "name": "Docker",
            "category": "DevOps",
            "description": "Containerization technology.",
        },
    )

    assert response.status_code == 403

def test_update_skill(client, admin_headers):

    create_response = client.post(
        "/api/skills",
        headers=admin_headers,
        json={
            "name": "Python",
            "category": "Programming",
            "description": "Backend programming language.",
        },
    )

    assert create_response.status_code == 201

    skill_id = create_response.get_json()["id"]

    response = client.put(
        f"/api/skills/{skill_id}",
        headers=admin_headers,
        json={
            "name": "Advanced Python",
            "category": "Programming",
            "description": "Advanced backend programming.",
        },
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["name"] == "Advanced Python"


def test_regular_user_cannot_update_skill(
    client,
    admin_headers,
    auth_headers,
):

    create_response = client.post(
        "/api/skills",
        headers=admin_headers,
        json={
            "name": "JavaScript",
            "category": "Programming",
            "description": "Web development language.",
        },
    )

    assert create_response.status_code == 201

    skill_id = create_response.get_json()["id"]

    response = client.put(
        f"/api/skills/{skill_id}",
        headers=auth_headers,
        json={
            "name": "Updated JavaScript",
            "category": "Programming",
            "description": "Modern web development language.",
        },
    )

    assert response.status_code == 403

def test_delete_skill(client, admin_headers):

    create_response = client.post(
        "/api/skills",
        headers=admin_headers,
        json={
            "name": "Python",
            "category": "Programming",
            "description": "Backend programming language.",
        },
    )

    assert create_response.status_code == 201

    skill_id = create_response.get_json()["id"]

    response = client.delete(
        f"/api/skills/{skill_id}",
        headers=admin_headers,
    )

    assert response.status_code in (200, 204)

    get_response = client.get(
        f"/api/skills/{skill_id}",
        headers=admin_headers,
    )

    assert get_response.status_code == 404


def test_regular_user_cannot_delete_skill(
    client,
    admin_headers,
    auth_headers,
):

    create_response = client.post(
        "/api/skills",
        headers=admin_headers,
        json={
            "name": "React",
            "category": "Frontend",
            "description": "JavaScript user interface library.",
        },
    )

    assert create_response.status_code == 201

    skill_id = create_response.get_json()["id"]

    response = client.delete(
        f"/api/skills/{skill_id}",
        headers=auth_headers,
    )

    assert response.status_code == 403

def test_admin_without_pin_cannot_create_skill(
    app,
    client,
    admin_headers,
):

    with app.app_context():

        admin = User.query.filter_by(
            email="testadmin@example.com"
        ).first()

        assert admin is not None

        token = create_access_token(
            identity=str(admin.id),
            additional_claims={
                "admin_verified": False,
            },
        )

    response = client.post(
        "/api/skills",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "name": "Kubernetes",
            "category": "DevOps",
            "description": "Container orchestration platform.",
        },
    )

    assert response.status_code == 403