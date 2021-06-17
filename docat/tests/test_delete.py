from unittest.mock import patch


def test_successfully_delete(client_with_claimed_project):
    with patch("app.remove_docs", return_value="remove mock"):
        rv = client_with_claimed_project.delete("/api/some-project/1.0.0", headers={"Docat-Api-Key": "1234"})
        assert b"remove mock" in rv.data


def test_no_valid_token_delete(client_with_claimed_project):
    with patch("app.remove_docs", return_value="remove mock"):
        rv = client_with_claimed_project.delete("/api/some-project/1.0.0", headers={"Docat-Api-Key": "abcd"})
        assert b"Please provide a header with a valid Docat-Api-Key token" in rv.data
        assert 401 == rv.status_code


def test_no_token_delete(client_with_claimed_project):
    with patch("app.remove_docs", return_value="remove mock"):
        rv = client_with_claimed_project.delete("/api/some-project/1.0.0")
        assert b"Please provide a header with a valid Docat-Api-Key token" in rv.data
        assert 401 == rv.status_code
