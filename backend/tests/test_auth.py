def test_register_user(client):
    response = client.post(
        "/api/auth/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "TestPassword123"
        }
    )

    assert response.status_code == 201
    assert response.json["message"] == "Account created successfully"


def test_register_duplicate_email(client):
    payload = {
        "username": "testuser",
        "email": "duplicate@example.com",
        "password": "TestPassword123"
    }

    first_response = client.post(
        "/api/auth/register",
        json=payload
    )

    second_response = client.post(
        "/api/auth/register",
        json=payload
    )

    assert first_response.status_code == 201
    assert second_response.status_code == 409


def test_register_short_password(client):
    response = client.post(
        "/api/auth/register",
        json={
            "username": "testuser",
            "email": "short@example.com",
            "password": "123"
        }
    )

    assert response.status_code == 400


def test_login_success(client):
    client.post(
        "/api/auth/register",
        json={
            "username": "loginuser",
            "email": "login@example.com",
            "password": "TestPassword123"
        }
    )

    response = client.post(
        "/api/auth/login",
        json={
            "email": "login@example.com",
            "password": "TestPassword123"
        }
    )

    assert response.status_code == 200
    assert "access_token" in response.json


def test_login_wrong_password(client):
    client.post(
        "/api/auth/register",
        json={
            "username": "loginuser",
            "email": "wrongpassword@example.com",
            "password": "TestPassword123"
        }
    )

    response = client.post(
        "/api/auth/login",
        json={
            "email": "wrongpassword@example.com",
            "password": "WrongPassword123"
        }
    )

    assert response.status_code == 401


def test_me_requires_token(client):
    response = client.get("/api/auth/me")

    assert response.status_code == 401


def test_me_with_valid_token(client):
    client.post(
        "/api/auth/register",
        json={
            "username": "currentuser",
            "email": "current@example.com",
            "password": "TestPassword123"
        }
    )

    login_response = client.post(
        "/api/auth/login",
        json={
            "email": "current@example.com",
            "password": "TestPassword123"
        }
    )

    token = login_response.json["access_token"]

    response = client.get(
        "/api/auth/me",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 200
    assert response.json["user"]["email"] == "current@example.com"