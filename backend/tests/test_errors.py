
def test_unknown_endpoint_returns_404(client):
    response = client.get("/api/does-not-exist")

    assert response.status_code == 404

    data = response.get_json()
    assert "error" in data


def test_wrong_method_returns_405(client):
    response = client.patch("/api/health")

    assert response.status_code == 405
