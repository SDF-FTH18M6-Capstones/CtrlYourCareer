def test_get_careers(client):
    response = client.get("/api/careers")

    assert response.status_code == 200
    assert isinstance(response.json, list)


def test_create_career(client):
    response = client.post(
        "/api/careers",
        json={
            "title": "Backend Developer",
            "category": "Software Development",
            "description": "Builds APIs and server-side applications."
        }
    )

    assert response.status_code == 201
    assert response.json["title"] == "Backend Developer"


def test_create_career_invalid_data(client):
    response = client.post(
        "/api/careers",
        json={
            "title": "A",
            "category": "Technology",
            "description": "Short"
        }
    )

    assert response.status_code == 400


def test_get_missing_career(client):
    response = client.get("/api/careers/9999")

    assert response.status_code == 404


def test_update_career(client):
    create_response = client.post(
        "/api/careers",
        json={
            "title": "Backend Developer",
            "category": "Technology",
            "description": "Builds APIs and server-side applications."
        }
    )

    career_id = create_response.json["id"]

    response = client.put(
        f"/api/careers/{career_id}",
        json={"title": "Senior Backend Developer"}
    )

    assert response.status_code == 200
    assert response.json["title"] == "Senior Backend Developer"


def test_delete_career(client):
    create_response = client.post(
        "/api/careers",
        json={
            "title": "Backend Developer",
            "category": "Technology",
            "description": "Builds APIs and server-side applications."
        }
    )

    career_id = create_response.json["id"]

    response = client.delete(f"/api/careers/{career_id}")

    assert response.status_code == 200

    missing_response = client.get(f"/api/careers/{career_id}")

    assert missing_response.status_code == 404
