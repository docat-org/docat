from unittest.mock import patch

from app import app


def test_successfully_delete(client):
    with patch("app.remove_docs", return_value="remove mock"):
        table = app.db.table("claims")
        table.insert({"name": "some-project", "token": "1234"})
        rv = client.delete("/api/some-project/1.0.0", headers={"x-docat-api-key": "1234"})
        assert b"remove mock" in rv.data


def test_no_valid_token_delete(client):
    with patch("app.remove_docs", return_value="remove mock"):
        table = app.db.table("claims")
        table.insert({"name": "some-project", "token": "1234"})
        rv = client.delete("/api/some-project/1.0.0", headers={"x-docat-api-key": "abcd"})
        assert b"Please provide a header with a valid X-Docat-Api-Key token" in rv.data
        assert 401 == rv.status_code


def test_no_token_delete(client):
    with patch("app.remove_docs", return_value="remove mock"):
        table = app.db.table("claims")
        table.insert({"name": "some-project", "token": "1234"})
        rv = client.delete("/api/some-project/1.0.0")
        assert b"Please provide a header with a valid X-Docat-Api-Key token" in rv.data
        assert 401 == rv.status_code
