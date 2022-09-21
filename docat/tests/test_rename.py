import io
from pathlib import Path
from unittest.mock import call, patch

from tinydb import Query

import docat.app as docat


def test_rename_fail_project_does_not_exist(client_with_claimed_project):
    with patch("os.rename") as rename_mock:
        response = client_with_claimed_project.put("/api/does-not-exist/rename/new-project-name")
        assert response.status_code == 404
        assert response.json() == {"message": "Project does-not-exist not found"}

        assert rename_mock.mock_calls == []


def test_rename_fail_new_project_name_already_used(client_with_claimed_project):
    with patch("os.rename") as rename_mock:
        create_first_project_response = client_with_claimed_project.post(
            "/api/some-project/1.0.0", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")}
        )
        assert create_first_project_response.status_code == 201

        create_second_project_response = client_with_claimed_project.post(
            "/api/second-project/1.0.0", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")}
        )
        assert create_second_project_response.status_code == 201

        rename_response = client_with_claimed_project.put("/api/some-project/rename/second-project")
        assert rename_response.status_code == 409
        assert rename_response.json() == {"message": "New project name second-project already in use"}

        assert rename_mock.mock_calls == []


def test_rename_not_authenticated(client_with_claimed_project):
    with patch("os.rename") as rename_mock:
        create_project_response = client_with_claimed_project.post(
            "/api/some-project/1.0.0",
            files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
        )
        assert create_project_response.status_code == 201

        rename_response = client_with_claimed_project.put("/api/some-project/rename/new-project-name")
        assert rename_response.status_code == 401
        assert rename_response.json() == {"message": "Please provide a header with a valid Docat-Api-Key token for some-project"}

        assert rename_mock.mock_calls == []


def test_rename_success(client_with_claimed_project):
    with patch("os.rename") as rename_mock:
        create_project_response = client_with_claimed_project.post(
            "/api/some-project/1.0.0",
            files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
        )
        assert create_project_response.status_code == 201

        rename_response = client_with_claimed_project.put("/api/some-project/rename/new-project-name", headers={"Docat-Api-Key": "1234"})
        assert rename_response.status_code == 200
        assert rename_response.json() == {"message": "Successfully renamed project some-project to new-project-name"}

        old_path = docat.DOCAT_UPLOAD_FOLDER / Path("some-project")
        new_path = docat.DOCAT_UPLOAD_FOLDER / Path("new-project-name")
        assert rename_mock.mock_calls == [call(old_path, new_path)]

        Project = Query()
        table = docat.db.table("claims")
        claims_with_old_name = table.search(Project.name == "some-project")
        assert len(claims_with_old_name) == 0
        claims_with_new_name = table.search(Project.name == "new-project-name")
        assert len(claims_with_new_name) == 1
