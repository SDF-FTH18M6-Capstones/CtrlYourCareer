
def test_get_skills(client, auth_headers):
    response = client.get(
        "/api/skills",
        headers=auth_headers
    )

    assert response.status_code == 200


def test_create_skill(client, auth_headers):
    response = client.post(
        "/api/skills",
        headers=auth_headers,
        json={
            "name": "Python",
            "category": "Programming",
            "description": "Backend programming language."
        }
    )

    assert response.status_code == 201
    assert response.json["name"] == "Python"


def test_create_skill_invalid_data(client, auth_headers):
    response = client.post(
        "/api/skills",
        headers=auth_headers,
        json={
            "name": "P",
            "category": "Programming"
        }
    )

    assert response.status_code == 400


def test_get_missing_skill(client, auth_headers):
    response = client.get(
        "/api/skills/9999",
        headers=auth_headers
    )

    assert response.status_code == 404


def test_update_skill(client, auth_headers):
    create_response = client.post(
        "/api/skills",
        headers=auth_headers,
        json={
            "name": "Python",
            "category": "Programming",
            "description": "Backend language."
        }
    )

    assert create_response.status_code == 201
    skill_id = create_response.json["id"]

    response = client.put(
        f"/api/skills/{skill_id}",
        headers=auth_headers,
        json={
            "description": "Updated Python description."
        }
    )

    assert response.status_code == 200
    assert (
        response.json["description"]
        == "Updated Python description."
    )


def test_delete_skill(client, auth_headers):
    create_response = client.post(
        "/api/skills",
        headers=auth_headers,
        json={
            "name": "Python",
            "category": "Programming",
            "description": "Backend language."
        }
    )

    assert create_response.status_code == 201
    skill_id = create_response.json["id"]

    response = client.delete(
        f"/api/skills/{skill_id}",
        headers=auth_headers
    )

    assert response.status_code == 200
    assert response.json["message"] == "Skill deleted successfully"

    missing_response = client.get(
        f"/api/skills/{skill_id}",
        headers=auth_headers
    )

    assert missing_response.status_code == 404


# Sprint 3: JWT authorization security tests

def test_get_skills_without_token(client):
    response = client.get("/api/skills")

    assert response.status_code == 401


def test_create_skill_without_token(client):
    response = client.post(
        "/api/skills",
        json={
            "name": "Python",
            "category": "Programming",
            "description": "Backend programming language."
        }
    )

    assert response.status_code == 401
