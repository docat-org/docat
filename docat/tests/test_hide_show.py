import io
from unittest.mock import patch

import docat.app as docat


def test_hide(client_with_claimed_project):
    """
    Tests that the version is marked as hidden when getting the details after hiding
    """
    # create a version
    create_response = client_with_claimed_project.post(
        "/api/some-project/1.0.0", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")}
    )
    assert create_response.status_code == 201

    # check detected before hiding
    project_details_response = client_with_claimed_project.get("/api/projects/some-project")
    assert project_details_response.status_code == 200
    assert project_details_response.json() == {
        "name": "some-project",
        "versions": [{"name": "1.0.0", "tags": [], "hidden": False}],
    }

    # hide the version
    hide_response = client_with_claimed_project.post("/api/some-project/1.0.0/hide", headers={"Docat-Api-Key": "1234"})
    assert hide_response.status_code == 200
    assert hide_response.json() == {"message": "Version 1.0.0 is now hidden"}

    # check hidden
    project_details_response = client_with_claimed_project.get("/api/projects/some-project")
    assert project_details_response.status_code == 200
    assert project_details_response.json() == {
        "name": "some-project",
        "versions": [],
    }


def test_hide_only_version_not_listed_in_projects(client_with_claimed_project):
    """
    Test that the project is not listed in the projects endpoint when the only version is hidden
    """
    # create a version
    create_response = client_with_claimed_project.post(
        "/api/some-project/1.0.0", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")}
    )
    assert create_response.status_code == 201

    # check detected before hiding
    projects_response = client_with_claimed_project.get("/api/projects")
    assert projects_response.status_code == 200
    assert projects_response.json() == {
        "projects": [{"name": "some-project", "logo": False, "versions": [{"name": "1.0.0", "tags": [], "hidden": False}]}],
    }

    # hide the only version
    hide_response = client_with_claimed_project.post("/api/some-project/1.0.0/hide", headers={"Docat-Api-Key": "1234"})
    assert hide_response.status_code == 200
    assert hide_response.json() == {"message": "Version 1.0.0 is now hidden"}

    # check hidden
    projects_response = client_with_claimed_project.get("/api/projects")
    assert projects_response.status_code == 200
    assert projects_response.json() == {
        "projects": [],
    }

    # check versions hidden
    project_details_response = client_with_claimed_project.get("/api/projects/some-project")
    assert project_details_response.status_code == 200
    assert project_details_response.json() == {"name": "some-project", "versions": []}


def test_hide_creates_hidden_file(client_with_claimed_project):
    """
    Tests that the hidden file is created when hiding a version
    """
    hidden_file_path = docat.DOCAT_UPLOAD_FOLDER / "some-project" / "1.0.0" / ".hidden"

    # create a version
    create_response = client_with_claimed_project.post(
        "/api/some-project/1.0.0", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")}
    )
    assert create_response.status_code == 201

    # check open was called at least once with the correct path
    with patch("docat.app.open") as open_file_mock:
        # hide
        hide_response = client_with_claimed_project.post("/api/some-project/1.0.0/hide", headers={"Docat-Api-Key": "1234"})
        assert hide_response.status_code == 200
        assert hide_response.json() == {"message": "Version 1.0.0 is now hidden"}

        open_file_mock.assert_called_once_with(hidden_file_path, "w")


def test_hide_fails_project_does_not_exist(client_with_claimed_project):
    """
    Tests that hiding a version fails when the project does not exist
    """
    with patch("docat.app.open") as open_file_mock:
        hide_response = client_with_claimed_project.post("/api/does-not-exist/1.0.0/hide", headers={"Docat-Api-Key": "1234"})
        assert hide_response.status_code == 404
        assert hide_response.json() == {"message": "Project does-not-exist not found"}

        open_file_mock.assert_not_called()


def test_hide_fails_version_does_not_exist(client_with_claimed_project):
    """
    Tests that hiding a version fails when the version does not exist
    """
    with patch("docat.app.open") as open_file_mock:

        # create a version
        create_response = client_with_claimed_project.post(
            "/api/some-project/1.0.0", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")}
        )
        assert create_response.status_code == 201

        # hide different version
        hide_response = client_with_claimed_project.post("/api/some-project/2.0.0/hide", headers={"Docat-Api-Key": "1234"})
        assert hide_response.status_code == 404
        assert hide_response.json() == {"message": "Version 2.0.0 not found"}

        open_file_mock.assert_not_called()


def test_hide_fails_already_hidden(client_with_claimed_project):
    """
    Tests that hiding a version fails when the version is already hidden
    """
    # create a version
    create_response = client_with_claimed_project.post(
        "/api/some-project/1.0.0", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")}
    )
    assert create_response.status_code == 201

    # hide version
    hide_response = client_with_claimed_project.post("/api/some-project/1.0.0/hide", headers={"Docat-Api-Key": "1234"})
    assert hide_response.status_code == 200
    assert hide_response.json() == {"message": "Version 1.0.0 is now hidden"}

    with patch("docat.app.open") as open_file_mock:
        # hide version again
        hide_response = client_with_claimed_project.post("/api/some-project/1.0.0/hide", headers={"Docat-Api-Key": "1234"})
        assert hide_response.status_code == 400
        assert hide_response.json() == {"message": "Version 1.0.0 is already hidden"}

        open_file_mock.assert_not_called()


def test_hide_fails_no_token(client_with_claimed_project):
    """
    Tests that hiding a version fails when no token is provided
    """
    with patch("docat.app.open") as open_file_mock:
        # create a version
        create_response = client_with_claimed_project.post(
            "/api/some-project/1.0.0", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")}
        )
        assert create_response.status_code == 201

        # hide version
        hide_response = client_with_claimed_project.post("/api/some-project/1.0.0/hide")
        assert hide_response.status_code == 401
        assert hide_response.json() == {"message": "Please provide a header with a valid Docat-Api-Key token for some-project"}

        open_file_mock.assert_not_called()


def test_hide_fails_invalid_token(client_with_claimed_project):
    """
    Tests that hiding a version fails when an invalid token is provided
    """
    with patch("docat.app.open") as open_file_mock:
        # create a version
        create_response = client_with_claimed_project.post(
            "/api/some-project/1.0.0", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")}
        )
        assert create_response.status_code == 201

        # hide version
        hide_response = client_with_claimed_project.post("/api/some-project/1.0.0/hide", headers={"Docat-Api-Key": "invalid"})
        assert hide_response.status_code == 401
        assert hide_response.json() == {"message": "Docat-Api-Key token is not valid for some-project"}

        open_file_mock.assert_not_called()


def test_show(client_with_claimed_project):
    """
    Tests that the version is no longer marked as hidden after requesting show.
    """
    # create a version
    create_response = client_with_claimed_project.post(
        "/api/some-project/1.0.0", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")}
    )
    assert create_response.status_code == 201

    # hide the version
    hide_response = client_with_claimed_project.post("/api/some-project/1.0.0/hide", headers={"Docat-Api-Key": "1234"})
    assert hide_response.status_code == 200
    assert hide_response.json() == {"message": "Version 1.0.0 is now hidden"}

    # check hidden
    project_details_response = client_with_claimed_project.get("/api/projects/some-project")
    assert project_details_response.status_code == 200
    assert project_details_response.json() == {
        "name": "some-project",
        "versions": [],
    }

    # show the version
    show_response = client_with_claimed_project.post("/api/some-project/1.0.0/show", headers={"Docat-Api-Key": "1234"})
    assert show_response.status_code == 200
    assert show_response.json() == {"message": "Version 1.0.0 is now shown"}

    # check detected again
    project_details_response = client_with_claimed_project.get("/api/projects/some-project")
    assert project_details_response.status_code == 200
    assert project_details_response.json() == {
        "name": "some-project",
        "versions": [{"name": "1.0.0", "tags": [], "hidden": False}],
    }


def test_show_deletes_hidden_file(client_with_claimed_project):
    """
    Tests that the hidden file is deleted when requesting show.
    """
    hidden_file_path = docat.DOCAT_UPLOAD_FOLDER / "some-project" / "1.0.0" / ".hidden"

    # create a version
    create_response = client_with_claimed_project.post(
        "/api/some-project/1.0.0", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")}
    )
    assert create_response.status_code == 201

    # hide the version
    hide_response = client_with_claimed_project.post("/api/some-project/1.0.0/hide", headers={"Docat-Api-Key": "1234"})
    assert hide_response.status_code == 200
    assert hide_response.json() == {"message": "Version 1.0.0 is now hidden"}

    # check os.remove was called at least once with the correct path
    with patch("os.remove") as remove_file_mock:
        # show again
        show_response = client_with_claimed_project.post("/api/some-project/1.0.0/show", headers={"Docat-Api-Key": "1234"})
        assert show_response.status_code == 200
        assert show_response.json() == {"message": "Version 1.0.0 is now shown"}

        remove_file_mock.assert_called_once_with(hidden_file_path)


def test_show_fails_project_does_not_exist(client_with_claimed_project):
    """
    Tests that showing a version fails when the project does not exist
    """
    with patch("os.remove") as delete_file_mock:
        show_response = client_with_claimed_project.post("/api/does-not-exist/1.0.0/hide", headers={"Docat-Api-Key": "1234"})
        assert show_response.status_code == 404
        assert show_response.json() == {"message": "Project does-not-exist not found"}

        delete_file_mock.assert_not_called()


def test_show_fails_version_does_not_exist(client_with_claimed_project):
    """
    Tests that showing a version fails when the version does not exist
    """
    # create a version
    create_response = client_with_claimed_project.post(
        "/api/some-project/1.0.0", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")}
    )
    assert create_response.status_code == 201

    # hide the version
    hide_response = client_with_claimed_project.post("/api/some-project/1.0.0/hide", headers={"Docat-Api-Key": "1234"})
    assert hide_response.status_code == 200
    assert hide_response.json() == {"message": "Version 1.0.0 is now hidden"}

    with patch("os.remove") as delete_file_mock:
        # show different version
        show_response = client_with_claimed_project.post("/api/some-project/2.0.0/show", headers={"Docat-Api-Key": "1234"})
        assert show_response.status_code == 404
        assert show_response.json() == {"message": "Version 2.0.0 not found"}

        delete_file_mock.assert_not_called()


def test_show_fails_already_shown(client_with_claimed_project):
    """
    Tests that showing a version fails when the version is already shown
    """
    # create a version
    create_response = client_with_claimed_project.post(
        "/api/some-project/1.0.0", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")}
    )
    assert create_response.status_code == 201

    with patch("os.remove") as delete_file_mock:
        # show version
        show_response = client_with_claimed_project.post("/api/some-project/1.0.0/show", headers={"Docat-Api-Key": "1234"})
        assert show_response.status_code == 400
        assert show_response.json() == {"message": "Version 1.0.0 is not hidden"}

        delete_file_mock.assert_not_called()


def test_show_fails_no_token(client_with_claimed_project):
    """
    Tests that showing a version fails when no token is provided
    """
    with patch("os.remove") as remove_file_mock:
        # create a version
        create_response = client_with_claimed_project.post(
            "/api/some-project/1.0.0", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")}
        )
        assert create_response.status_code == 201

        # hide version
        hide_response = client_with_claimed_project.post("/api/some-project/1.0.0/hide", headers={"Docat-Api-Key": "1234"})
        assert hide_response.status_code == 200
        assert hide_response.json() == {"message": "Version 1.0.0 is now hidden"}

        # try to show without token
        show_response = client_with_claimed_project.post("/api/some-project/1.0.0/show")
        assert show_response.status_code == 401
        assert show_response.json() == {"message": "Please provide a header with a valid Docat-Api-Key token for some-project"}

        remove_file_mock.assert_not_called()


def test_show_fails_invalid_token(client_with_claimed_project):
    """
    Tests that showing a version fails when an invalid token is provided
    """
    with patch("os.remove") as remove_file_mock:
        # create a version
        create_response = client_with_claimed_project.post(
            "/api/some-project/1.0.0", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")}
        )
        assert create_response.status_code == 201

        # hide version
        hide_response = client_with_claimed_project.post("/api/some-project/1.0.0/hide", headers={"Docat-Api-Key": "1234"})
        assert hide_response.status_code == 200
        assert hide_response.json() == {"message": "Version 1.0.0 is now hidden"}

        # try to show without token
        show_response = client_with_claimed_project.post("/api/some-project/1.0.0/show", headers={"Docat-Api-Key": "invalid"})
        assert show_response.status_code == 401
        assert show_response.json() == {"message": "Docat-Api-Key token is not valid for some-project"}

        remove_file_mock.assert_not_called()


def test_hide_and_show_with_tag(client_with_claimed_project):
    """
    Tests that the version is no longer marked as hidden after requesting show on a tag.
    """
    # create a version
    create_response = client_with_claimed_project.post(
        "/api/some-project/1.0.0", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")}
    )
    assert create_response.status_code == 201

    # create a tag
    create_tag_response = client_with_claimed_project.put("/api/some-project/1.0.0/tags/latest")
    assert create_tag_response.status_code == 201
    assert create_tag_response.json() == {"message": "Tag latest -> 1.0.0 successfully created"}

    # hide the tag
    hide_response = client_with_claimed_project.post("/api/some-project/latest/hide", headers={"Docat-Api-Key": "1234"})
    assert hide_response.status_code == 200
    assert hide_response.json() == {"message": "Version latest is now hidden"}

    # check hidden
    project_details_response = client_with_claimed_project.get("/api/projects/some-project")
    assert project_details_response.status_code == 200
    assert project_details_response.json() == {
        "name": "some-project",
        "versions": [],
    }

    # show the version
    show_response = client_with_claimed_project.post("/api/some-project/latest/show", headers={"Docat-Api-Key": "1234"})
    assert show_response.status_code == 200
    assert show_response.json() == {"message": "Version latest is now shown"}

    # check detected again
    project_details_response = client_with_claimed_project.get("/api/projects/some-project")
    assert project_details_response.status_code == 200
    assert project_details_response.json() == {
        "name": "some-project",
        "versions": [{"name": "1.0.0", "tags": ["latest"], "hidden": False}],
    }
