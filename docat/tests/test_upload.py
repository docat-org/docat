import io
from pathlib import Path
from unittest.mock import call, patch

import docat.app as docat


def test_successfully_upload(client):
    with patch("docat.app.remove_docs"):
        response = client.post("/api/some-project/1.0.0", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")})
        response_data = response.json()

        assert response.status_code == 201
        assert response_data["message"] == "Documentation uploaded successfully"
        assert (docat.DOCAT_UPLOAD_FOLDER / "some-project" / "1.0.0" / "index.html").exists()


def test_successfully_override(client_with_claimed_project):
    with patch("docat.app.remove_docs") as remove_mock:
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
        assert response_data["message"] == "Documentation uploaded successfully"
        assert remove_mock.mock_calls == [call("some-project", "1.0.0", docat.DOCAT_UPLOAD_FOLDER)]


def test_tags_are_not_overwritten_without_api_key(client_with_claimed_project):
    with patch("docat.app.remove_docs") as remove_mock:
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


def test_successful_tag_creation(client_with_claimed_project):
    with patch("docat.app.create_symlink") as create_symlink_mock:
        create_project_response = client_with_claimed_project.post(
            "/api/some-project/1.0.0", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")}
        )
        assert create_project_response.status_code == 201

        create_tag_response = client_with_claimed_project.put("/api/some-project/1.0.0/tags/latest")

        assert create_tag_response.status_code == 201
        assert create_tag_response.json() == {"message": "Tag latest -> 1.0.0 successfully created"}

        destination_path = docat.DOCAT_UPLOAD_FOLDER / Path("some-project") / Path("latest")
        assert create_symlink_mock.mock_calls == [call("1.0.0", destination_path), call().__bool__()]


def test_create_tag_fails_when_version_does_not_exist(client_with_claimed_project):
    with patch("docat.app.create_symlink") as create_symlink_mock:
        create_project_response = client_with_claimed_project.post(
            "/api/some-project/1.0.0", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")}
        )

        assert create_project_response.status_code == 201

        create_tag_response = client_with_claimed_project.put("/api/some-project/non-existing-version/tags/new-tag")

        assert create_tag_response.status_code == 404
        assert create_tag_response.json() == {"message": "Version non-existing-version not found"}

        assert create_symlink_mock.mock_calls == []


def test_create_tag_fails_on_overwrite_of_version(client_with_claimed_project):
    """
    Create a tag with the same name as a version.
    """
    project_name = "some-project"
    version = "1.0.0"
    tag = "latest"

    create_first_project_response = client_with_claimed_project.post(
        f"/api/{project_name}/{version}", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")}
    )
    assert create_first_project_response.status_code == 201

    create_second_project_response = client_with_claimed_project.post(
        f"/api/{project_name}/{tag}", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")}
    )
    assert create_second_project_response.status_code == 201

    create_tag_response = client_with_claimed_project.put(f"/api/{project_name}/{version}/tags/{tag}")
    assert create_tag_response.status_code == 409
    assert create_tag_response.json() == {"message": f"Tag {tag} would overwrite an existing version!"}


def test_create_fails_on_overwrite_of_tag(client_with_claimed_project):
    """
    Create a version with the same name as a tag.
    """
    project_name = "some-project"
    version = "1.0.0"
    tag = "some-tag"

    create_project_response = client_with_claimed_project.post(
        f"/api/{project_name}/{version}", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")}
    )
    assert create_project_response.status_code == 201

    create_tag_response = client_with_claimed_project.put(f"/api/{project_name}/{version}/tags/{tag}")
    assert create_tag_response.status_code == 201
    assert create_tag_response.json() == {"message": f"Tag {tag} -> {version} successfully created"}

    create_project_with_name_of_tag_response = client_with_claimed_project.post(
        f"/api/{project_name}/{tag}", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")}
    )
    assert create_project_with_name_of_tag_response.status_code == 409
    assert create_project_with_name_of_tag_response.json() == {"message": "Cannot overwrite existing tag with new version."}


def test_fails_with_invalid_token(client_with_claimed_project):
    with patch("docat.app.remove_docs") as remove_mock:
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


def test_upload_rejects_forbidden_project_name(client_with_claimed_project):
    """
    Names that conflict with pages in docat web are forbidden,
    and creating a project with such a name should fail.
    """

    with patch("docat.app.remove_docs") as remove_mock:
        for project_name in ["upload", "claim", " Delete ", "help", "DOC"]:
            response = client_with_claimed_project.post(
                f"/api/{project_name}/1.0.0", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")}
            )
            assert response.status_code == 400
            assert response.json() == {"message": f'Project name "{project_name}" is forbidden, as it conflicts with pages in docat web.'}

            assert remove_mock.mock_calls == []


def test_upload_issues_warning_missing_index_file(client_with_claimed_project):
    """
    When a project is uploaded without an index.html file,
    a warning should be issued, but the upload should succeed.
    """

    response = client_with_claimed_project.post(
        "/api/some-project/1.0.0", files={"file": ("some-other-file.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")}
    )
    response_data = response.json()

    assert response.status_code == 201
    assert response_data["message"] == "Documentation uploaded successfully, but no index.html found at root of archive."
    assert (docat.DOCAT_UPLOAD_FOLDER / "some-project" / "1.0.0" / "some-other-file.html").exists()
    assert not (docat.DOCAT_UPLOAD_FOLDER / "some-project" / "1.0.0" / "index.html").exists()
