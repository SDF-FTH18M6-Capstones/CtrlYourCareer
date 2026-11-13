def test_get_skills(client):
    response = client.get("/api/skills")

    assert response.status_code == 200
    assert isinstance(response.json, list)


def test_create_skill(client):
    response = client.post(
        "/api/skills",
        json={
            "name": "Python",
            "category": "Programming",
            "description": "Backend programming language."
        }
    )

    assert response.status_code == 201
    assert response.json["name"] == "Python"


def test_create_skill_invalid_data(client):
    response = client.post(
        "/api/skills",
        json={
            "name": "P",
            "category": "Programming"
        }
    )

    assert response.status_code == 400


def test_get_missing_skill(client):
    response = client.get("/api/skills/9999")

    assert response.status_code == 404


def test_update_skill(client):
    create_response = client.post(
        "/api/skills",
        json={
            "name": "Python",
            "category": "Programming",
            "description": "Backend language."
        }
    )

    skill_id = create_response.json["id"]

    response = client.put(
        f"/api/skills/{skill_id}",
        json={"description": "Updated Python description."}
    )

    assert response.status_code == 200
    assert response.json["description"] == "Updated Python description."


def test_delete_skill(client):
    create_response = client.post(
        "/api/skills",
        json={
            "name": "Python",
            "category": "Programming",
            "description": "Backend language."
        }
    )

    skill_id = create_response.json["id"]

    response = client.delete(f"/api/skills/{skill_id}")

    assert response.status_code == 200
    assert response.json["message"] == "Skill deleted successfully"

    missing_response = client.get(f"/api/skills/{skill_id}")

    assert missing_response.status_code == 404
