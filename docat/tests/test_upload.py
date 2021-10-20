import io
from unittest.mock import call, patch


def test_successfully_upload(client):
    with patch("docat.app.remove_docs"), patch("docat.app.create_nginx_config"):
        response = client.post("/api/some-project/1.0.0", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")})
        response_data = response.json()

        assert response.status_code == 201
        assert response_data["message"] == "File successfully uploaded"


def test_successfully_override(client_with_claimed_project):
    with patch("docat.app.remove_docs") as remove_mock, patch("docat.app.create_nginx_config"):
        response = client_with_claimed_project.post(
            "/api/some-project/1.0.0", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")}
        )
        assert response.status_code == 201

        response = client_with_claimed_project.post(
            "/api/some-project/1.0.0",
            files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
            headers={"Docat-Api-Key": "1234"},
        )
        response_data = response.json()

        assert response.status_code == 201
        assert response_data["message"] == "File successfully uploaded"
        assert remove_mock.mock_calls == [call("some-project", "1.0.0")]


def test_tags_are_not_overwritten_without_api_key(client_with_claimed_project):
    with patch("docat.app.remove_docs") as remove_mock, patch("docat.app.create_nginx_config"):
        response = client_with_claimed_project.post(
            "/api/some-project/1.0.0", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")}
        )
        assert response.status_code == 201

        response = client_with_claimed_project.put("/api/some-project/1.0.0/tags/latest")
        assert response.status_code == 201

        response = client_with_claimed_project.post(
            "/api/some-project/1.0.0", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")}
        )
        response_data = response.json()

        assert response.status_code == 401
        assert response_data["message"] == "Please provide a header with a valid Docat-Api-Key token for some-project"
        assert remove_mock.mock_calls == []


def test_fails_with_invalid_token(client_with_claimed_project):
    with patch("docat.app.remove_docs") as remove_mock, patch("docat.app.create_nginx_config"):
        response = client_with_claimed_project.post(
            "/api/some-project/1.0.0", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")}
        )
        assert response.status_code == 201

        response = client_with_claimed_project.post(
            "/api/some-project/1.0.0",
            files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
            headers={"Docat-Api-Key": "456"},
        )
        response_data = response.json()

        assert response.status_code == 401
        assert response_data["message"] == "Docat-Api-Key token is not valid for some-project"
        assert remove_mock.mock_calls == []
