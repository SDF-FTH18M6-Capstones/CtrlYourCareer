import pytest
from app.extensions import db
from app.models import Career, CareerSkill, Skill, UserSkill

def test_get_careers(client, auth_headers):

    response = client.get(
        "/api/careers",
        headers=auth_headers,
    )

    assert response.status_code == 200


def test_get_careers_without_token(client):

    response = client.get("/api/careers")

    assert response.status_code == 401


def test_get_missing_career(client, auth_headers):

    response = client.get(
        "/api/careers/99999",
        headers=auth_headers,
    )

    assert response.status_code == 404

def test_create_career(client, admin_headers):

    response = client.post(
        "/api/careers",
        headers=admin_headers,
        json={
            "title": "Backend Developer",
            "category": "Software Development",
            "description": "Builds APIs and server-side applications.",
        },
    )

    assert response.status_code == 201

    data = response.get_json()

    assert data["title"] == "Backend Developer"


def test_create_career_invalid_data(client, admin_headers):

    response = client.post(
        "/api/careers",
        headers=admin_headers,
        json={
            "title": "A",
            "category": "Technology",
            "description": "Short",
        },
    )

    assert response.status_code == 400


def test_create_career_without_token(client):

    response = client.post(
        "/api/careers",
        json={
            "title": "Backend Developer",
            "category": "Technology",
            "description": "Builds APIs and server-side applications.",
        },
    )

    assert response.status_code == 401


def test_regular_user_cannot_create_career(
    client,
    auth_headers,
):

    response = client.post(
        "/api/careers",
        headers=auth_headers,
        json={
            "title": "Software Engineer",
            "category": "Technology",
            "description": "Develops software applications.",
        },
    )

    assert response.status_code == 403

def test_update_career(client, admin_headers):

    create_response = client.post(
        "/api/careers",
        headers=admin_headers,
        json={
            "title": "Backend Developer",
            "category": "Technology",
            "description": "Builds APIs and server-side applications.",
        },
    )

    assert create_response.status_code == 201

    career_id = create_response.get_json()["id"]

    response = client.put(
        f"/api/careers/{career_id}",
        headers=admin_headers,
        json={
            "title": "Senior Backend Developer",
            "category": "Software Development",
            "description": "Designs and maintains backend systems.",
        },
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["title"] == "Senior Backend Developer"


def test_regular_user_cannot_update_career(
    client,
    admin_headers,
    auth_headers,
):

    create_response = client.post(
        "/api/careers",
        headers=admin_headers,
        json={
            "title": "Data Engineer",
            "category": "Technology",
            "description": "Builds reliable data pipelines.",
        },
    )

    assert create_response.status_code == 201

    career_id = create_response.get_json()["id"]

    response = client.put(
        f"/api/careers/{career_id}",
        headers=auth_headers,
        json={
            "title": "Updated Data Engineer",
            "category": "Technology",
            "description": "Develops large-scale data platforms.",
        },
    )

    assert response.status_code == 403

def test_delete_career(client, admin_headers):

    create_response = client.post(
        "/api/careers",
        headers=admin_headers,
        json={
            "title": "Backend Developer",
            "category": "Technology",
            "description": "Builds APIs and server-side applications.",
        },
    )

    assert create_response.status_code == 201

    career_id = create_response.get_json()["id"]

    response = client.delete(
        f"/api/careers/{career_id}",
        headers=admin_headers,
    )

    assert response.status_code in (200, 204)

    get_response = client.get(
        f"/api/careers/{career_id}",
        headers=admin_headers,
    )

    assert get_response.status_code == 404


def test_regular_user_cannot_delete_career(
    client,
    admin_headers,
    auth_headers,
):

    create_response = client.post(
        "/api/careers",
        headers=admin_headers,
        json={
            "title": "Cloud Engineer",
            "category": "Technology",
            "description": "Designs and maintains cloud infrastructure.",
        },
    )

    assert create_response.status_code == 201

    career_id = create_response.get_json()["id"]

    response = client.delete(
        f"/api/careers/{career_id}",
        headers=auth_headers,
    )

    assert response.status_code == 403

def test_skill_gap_endpoint(
    client,
    auth_headers,
    admin_headers,
):

    create_response = client.post(
        "/api/careers",
        headers=admin_headers,
        json={
            "title": "Python Developer",
            "category": "Software Development",
            "description": "Develops applications using Python.",
        },
    )

    assert create_response.status_code == 201

    career_id = create_response.get_json()["id"]

    response = client.get(
        f"/api/careers/{career_id}/skill-gap",
        headers=auth_headers,
    )

    assert response.status_code == 200


def test_skill_gap_requires_login(client):

    response = client.get(
        "/api/careers/1/skill-gap",
    )

    assert response.status_code == 401

def test_admin_without_pin_cannot_create_career(
    app,
    client,
    admin_headers,
):

    from flask_jwt_extended import create_access_token
    from app.models import User

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
        "/api/careers",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "title": "Security Engineer",
            "category": "Technology",
            "description": "Protects systems and applications.",
        },
    )

    assert response.status_code == 403