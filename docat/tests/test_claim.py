def test_successfully_claim_token(client):

    response = client.get("/api/some-project/claim")
    response_data = response.json()
    assert response.status_code == 201
    assert response_data["message"] == "Project some-project successfully claimed"
    assert "token" in response_data


def test_already_claimed(client):

    client.get("/api/some-project/claim")
    response = client.get("/api/some-project/claim")
    response_data = response.json()
    assert response.status_code == 409
    assert response_data["message"] == "Project some-project is already claimed!"
