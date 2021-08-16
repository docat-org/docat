import io
from unittest.mock import call, patch


def test_successfully_upload(client):
    with patch("docat.app.remove_docs"), patch("docat.app.create_nginx_config"):
        data = {"file": (io.BytesIO(b"<h1>Hello World</h1>"), "index.html")}
        rv = client.post("/api/some-project/1.0.0", data=data, content_type="multipart/form-data")

        assert 201 == rv.status_code
        assert b"File successfully uploaded" in rv.data


def test_successfully_override(client_with_claimed_project):
    with patch("docat.app.remove_docs") as remove_mock, patch("docat.app.create_nginx_config"):
        data = {"file": (io.BytesIO(b"<h1>Hello World</h1>"), "index.html")}
        rv = client_with_claimed_project.post("/api/some-project/1.0.0", data=data, content_type="multipart/form-data")
        assert 201 == rv.status_code

        data = {"file": (io.BytesIO(b"<h1>Hello World</h1>"), "index.html")}
        rv = client_with_claimed_project.post(
            "/api/some-project/1.0.0", data=data, content_type="multipart/form-data", headers={"Docat-Api-Key": "1234"}
        )

        assert 201 == rv.status_code
        assert b"File successfully uploaded" in rv.data
        assert remove_mock.mock_calls == [call("some-project", "1.0.0")]


def test_tags_are_not_overwritten_without_api_key(client_with_claimed_project):
    with patch("docat.app.remove_docs") as remove_mock, patch("docat.app.create_nginx_config"):
        data = {"file": (io.BytesIO(b"<h1>Hello World</h1>"), "index.html")}
        rv = client_with_claimed_project.post("/api/some-project/1.0.0", data=data, content_type="multipart/form-data")
        assert 201 == rv.status_code

        rv = client_with_claimed_project.put("/api/some-project/1.0.0/tags/latest")
        assert 201 == rv.status_code

        data = {"file": (io.BytesIO(b"<h1>Hello World</h1>"), "index.html")}
        rv = client_with_claimed_project.post("/api/some-project/latest", data=data, content_type="multipart/form-data")

        assert 401 == rv.status_code
        assert b"provide a header with a valid Docat-Api-Key token" in rv.data
        assert remove_mock.mock_calls == []


def test_fails_with_invalid_token(client_with_claimed_project):
    with patch("docat.app.remove_docs") as remove_mock, patch("docat.app.create_nginx_config"):
        data = {"file": (io.BytesIO(b"<h1>Hello World</h1>"), "index.html")}
        rv = client_with_claimed_project.post("/api/some-project/1.0.0", data=data, content_type="multipart/form-data")
        assert 201 == rv.status_code

        data = {"file": (io.BytesIO(b"<h1>Hello World</h1>"), "index.html")}
        rv = client_with_claimed_project.post(
            "/api/some-project/1.0.0", data=data, content_type="multipart/form-data", headers={"Docat-Api-Key": "456"}
        )

        assert 401 == rv.status_code
        assert b"Docat-Api-Key token is not valid" in rv.data
        assert remove_mock.mock_calls == []
