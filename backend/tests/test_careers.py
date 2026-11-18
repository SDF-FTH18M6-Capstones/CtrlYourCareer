
def test_get_careers(client, auth_headers):
    response = client.get(
        "/api/careers",
        headers=auth_headers
    )

    assert response.status_code == 200
    assert isinstance(response.json, list)


def test_create_career(client, auth_headers):
    response = client.post(
        "/api/careers",
        headers=auth_headers,
        json={
            "title": "Backend Developer",
            "category": "Software Development",
            "description": "Builds APIs and server-side applications."
        }
    )

    assert response.status_code == 201
    assert response.json["title"] == "Backend Developer"


def test_create_career_invalid_data(client, auth_headers):
    response = client.post(
        "/api/careers",
        headers=auth_headers,
        json={
            "title": "A",
            "category": "Technology",
            "description": "Short"
        }
    )

    assert response.status_code == 400


def test_get_missing_career(client, auth_headers):
    response = client.get(
        "/api/careers/9999",
        headers=auth_headers
    )

    assert response.status_code == 404


def test_update_career(client, auth_headers):
    create_response = client.post(
        "/api/careers",
        headers=auth_headers,
        json={
            "title": "Backend Developer",
            "category": "Technology",
            "description": "Builds APIs and server-side applications."
        }
    )

    assert create_response.status_code == 201
    career_id = create_response.json["id"]

    response = client.put(
        f"/api/careers/{career_id}",
        headers=auth_headers,
        json={
            "title": "Senior Backend Developer"
        }
    )

    assert response.status_code == 200
    assert response.json["title"] == "Senior Backend Developer"


def test_delete_career(client, auth_headers):
    create_response = client.post(
        "/api/careers",
        headers=auth_headers,
        json={
            "title": "Backend Developer",
            "category": "Technology",
            "description": "Builds APIs and server-side applications."
        }
    )

    assert create_response.status_code == 201
    career_id = create_response.json["id"]

    response = client.delete(
        f"/api/careers/{career_id}",
        headers=auth_headers
    )

    assert response.status_code == 200

    missing_response = client.get(
        f"/api/careers/{career_id}",
        headers=auth_headers
    )

    assert missing_response.status_code == 404


# Sprint 3: JWT authorization security tests

def test_get_careers_without_token(client):
    response = client.get("/api/careers")

    assert response.status_code == 401


def test_create_career_without_token(client):
    response = client.post(
        "/api/careers",
        json={
            "title": "Backend Developer",
            "category": "Software Development",
            "description": "Builds APIs and server-side applications."
        }
    )

    assert response.status_code == 401
