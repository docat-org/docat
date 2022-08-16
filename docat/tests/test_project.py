from unittest.mock import patch

from fastapi.testclient import TestClient

from docat.app import app

client = TestClient(app)


def test_project_api(temp_project_version):
    project = "project"
    docs = temp_project_version(project, "1.0")

    with patch("docat.app.DOCAT_UPLOAD_FOLDER", docs):
        response = client.get("/api/projects")

        assert response.ok
        assert response.json() == {"projects": ["project"]}


def test_project_api_without_any_projects():
    response = client.get("/api/projects")

    assert response.ok
    assert response.json() == {"projects": []}


def test_project_details_api(temp_project_version):
    project = "project"
    docs = temp_project_version(project, "1.0")
    symlink_to_latest = docs / project / "latest"
    assert symlink_to_latest.is_symlink()

    with patch("docat.app.DOCAT_UPLOAD_FOLDER", docs):
        response = client.get(f"/api/projects/{project}")

        assert response.ok
        assert response.json() == {"name": "project", "versions": [{"name": "1.0", "tags": ["latest"]}]}


def test_project_details_api_with_a_project_that_does_not_exist():
    response = client.get("/api/projects/i-do-not-exist")

    assert not response.ok
    assert response.json() == {"message": "Project i-do-not-exist does not exist"}
