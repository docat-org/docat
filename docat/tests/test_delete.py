from unittest.mock import patch


def test_successfully_delete(client_with_claimed_project):
    with patch("docat.app.remove_docs", return_value="remove mock"):
        response = client_with_claimed_project.delete("/api/some-project/1.0.0", headers={"Docat-Api-Key": "1234"})
        assert b"remove mock" in response.content


def test_no_valid_token_delete(client_with_claimed_project):
    with patch("docat.app.remove_docs", return_value="remove mock"):
        response = client_with_claimed_project.delete("/api/some-project/1.0.0", headers={"Docat-Api-Key": "abcd"})
        response_data = response.json()

        assert response.status_code == 401
        assert response_data["message"] == "Docat-Api-Key token is not valid for some-project"


def test_no_token_delete(client_with_claimed_project):
    with patch("docat.app.remove_docs", return_value="remove mock"):
        response = client_with_claimed_project.delete("/api/some-project/1.0.0")
        response_data = response.json()

        assert response.status_code == 401
        assert response_data["message"] == "Please provide a header with a valid Docat-Api-Key token for some-project"
