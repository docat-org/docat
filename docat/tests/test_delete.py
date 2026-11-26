import io
from unittest.mock import patch

import docat.app as docat


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


def test_delete_last_version_of_project_with_icon(client_with_claimed_project):
    project = docat.DOCAT_UPLOAD_FOLDER / "some-project"
    response = client_with_claimed_project.post(
        "/api/some-project/1.0.0", files={"file": ("index.html", io.BytesIO(b"<h1>Hello</h1>"), "plain/text")}
    )
    assert response.status_code == 201
    (project / "logo").write_bytes(b"icon")

    response = client_with_claimed_project.delete("/api/some-project/1.0.0", headers={"Docat-Api-Key": "1234"})

    assert response.status_code == 200
    assert not project.exists()
