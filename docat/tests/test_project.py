import io
from datetime import datetime
from unittest.mock import patch

import httpx
from fastapi.testclient import TestClient

import docat.app as docat
from docat.models import ProjectDetail, ProjectVersion
from docat.utils import get_project_details

client = TestClient(docat.app)


@patch("docat.utils.get_version_timestamp", return_value=datetime(2000, 1, 1, 1, 1, 0))
def test_project_api(_, temp_project_version):
    docs = temp_project_version("project", "1.0")
    docs = temp_project_version("different-project", "1.0")

    with patch("docat.app.DOCAT_UPLOAD_FOLDER", docs):
        response = client.get("/api/projects")

        assert response.status_code == httpx.codes.OK
        assert response.json() == {
            "projects": [
                {
                    "name": "different-project",
                    "logo": False,
                    "versions": [
                        {"name": "1.0", "timestamp": "2000-01-01T01:01:00", "tags": ["latest"], "hidden": False},
                    ],
                },
                {
                    "name": "project",
                    "logo": False,
                    "versions": [
                        {"name": "1.0", "timestamp": "2000-01-01T01:01:00", "tags": ["latest"], "hidden": False},
                    ],
                },
            ]
        }


def test_project_api_without_any_projects():
    response = client.get("/api/projects")

    assert response.status_code == httpx.codes.OK
    assert response.json() == {"projects": []}


@patch("docat.utils.get_version_timestamp", return_value=datetime(2000, 1, 1, 1, 1, 0))
def test_project_details_api(_, temp_project_version):
    project = "project"
    docs = temp_project_version(project, "1.0")
    symlink_to_latest = docs / project / "latest"
    assert symlink_to_latest.is_symlink()

    with patch("docat.app.DOCAT_UPLOAD_FOLDER", docs):
        response = client.get(f"/api/projects/{project}")

        assert response.status_code == httpx.codes.OK
        assert response.json() == {
            "name": "project",
            "versions": [{"name": "1.0", "timestamp": "2000-01-01T01:01:00", "tags": ["latest"], "hidden": False}],
        }


def test_project_details_api_with_a_project_that_does_not_exist():
    response = client.get("/api/projects/i-do-not-exist")

    assert not response.status_code == httpx.codes.OK
    assert response.json() == {"message": "Project i-do-not-exist does not exist"}


@patch("docat.utils.get_version_timestamp", return_value=datetime(2000, 1, 1, 1, 1, 0))
def test_get_project_details_with_hidden_versions(_, client_with_claimed_project):
    """
    Make sure that get_project_details works when include_hidden is set to True.
    """
    # create a version
    create_response = client_with_claimed_project.post(
        "/api/some-project/1.0.0", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")}
    )
    assert create_response.status_code == 201

    # check detected before hiding
    details = get_project_details(docat.DOCAT_UPLOAD_FOLDER, "some-project", include_hidden=True)
    assert details == ProjectDetail(
        name="some-project", versions=[ProjectVersion(name="1.0.0", timestamp=datetime(2000, 1, 1, 1, 1, 0), tags=[], hidden=False)]
    )

    # hide the version
    hide_response = client_with_claimed_project.post("/api/some-project/1.0.0/hide", headers={"Docat-Api-Key": "1234"})
    assert hide_response.status_code == 200
    assert hide_response.json() == {"message": "Version 1.0.0 is now hidden"}

    # check hidden
    details = get_project_details(docat.DOCAT_UPLOAD_FOLDER, "some-project", include_hidden=True)
    assert details == ProjectDetail(
        name="some-project", versions=[ProjectVersion(name="1.0.0", timestamp=datetime(2000, 1, 1, 1, 1, 0), tags=[], hidden=True)]
    )


@patch("docat.utils.get_version_timestamp", return_value=datetime(2000, 1, 1, 1, 1, 0))
def test_project_details_without_hidden_versions(_, client_with_claimed_project):
    """
    Make sure that project_details works when include_hidden is set to False.
    """
    # create a version
    create_response = client_with_claimed_project.post(
        "/api/some-project/1.0.0", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")}
    )
    assert create_response.status_code == 201

    # check detected before hiding
    details = get_project_details(docat.DOCAT_UPLOAD_FOLDER, "some-project", include_hidden=False)
    assert details == ProjectDetail(
        name="some-project", versions=[ProjectVersion(name="1.0.0", timestamp=datetime(2000, 1, 1, 1, 1, 0), tags=[], hidden=False)]
    )

    # hide the version
    hide_response = client_with_claimed_project.post("/api/some-project/1.0.0/hide", headers={"Docat-Api-Key": "1234"})
    assert hide_response.status_code == 200
    assert hide_response.json() == {"message": "Version 1.0.0 is now hidden"}

    # check hidden
    details = get_project_details(docat.DOCAT_UPLOAD_FOLDER, "some-project", include_hidden=False)
    assert details == ProjectDetail(name="some-project", versions=[])


@patch("docat.utils.get_version_timestamp", return_value=datetime(2000, 1, 1, 1, 1, 0))
def test_include_hidden_parameter_for_get_projects(_, client_with_claimed_project):
    """
    Make sure that include_hidden has the desired effect on the /api/projects endpoint.
    """
    # create a version
    create_response = client_with_claimed_project.post(
        "/api/some-project/1.0.0", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")}
    )
    assert create_response.status_code == 201

    # check detected before hiding
    get_projects_response = client_with_claimed_project.get("/api/projects")
    assert get_projects_response.status_code == 200
    assert get_projects_response.json() == {
        "projects": [
            {
                "name": "some-project",
                "logo": False,
                "versions": [{"name": "1.0.0", "timestamp": "2000-01-01T01:01:00", "tags": [], "hidden": False}],
            }
        ]
    }

    # check include_hidden=True
    get_projects_response = client_with_claimed_project.get("/api/projects?include_hidden=true")
    assert get_projects_response.status_code == 200
    assert get_projects_response.json() == {
        "projects": [
            {
                "name": "some-project",
                "logo": False,
                "versions": [{"name": "1.0.0", "timestamp": "2000-01-01T01:01:00", "tags": [], "hidden": False}],
            }
        ]
    }

    # hide the version
    hide_response = client_with_claimed_project.post("/api/some-project/1.0.0/hide", headers={"Docat-Api-Key": "1234"})
    assert hide_response.status_code == 200
    assert hide_response.json() == {"message": "Version 1.0.0 is now hidden"}

    # check include_hidden=False
    get_projects_response = client_with_claimed_project.get("/api/projects?include_hidden=false")
    assert get_projects_response.status_code == 200
    assert get_projects_response.json() == {"projects": []}

    # check include_hidden=True
    get_projects_response = client_with_claimed_project.get("/api/projects?include_hidden=true")
    assert get_projects_response.status_code == 200
    assert get_projects_response.json() == {
        "projects": [
            {
                "name": "some-project",
                "logo": False,
                "versions": [{"name": "1.0.0", "timestamp": "2000-01-01T01:01:00", "tags": [], "hidden": True}],
            }
        ]
    }


@patch("docat.utils.get_version_timestamp", return_value=datetime(2000, 1, 1, 1, 1, 0))
def test_include_hidden_parameter_for_get_project_details(_, client_with_claimed_project):
    """
    Make sure that include_hidden has the desired effect on the /api/project/{project} endpoint.
    """
    # create a version
    create_response = client_with_claimed_project.post(
        "/api/some-project/1.0.0", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")}
    )
    assert create_response.status_code == 201

    # check detected before hiding
    get_projects_response = client_with_claimed_project.get("/api/projects/some-project")
    assert get_projects_response.status_code == 200
    assert get_projects_response.json() == {
        "name": "some-project",
        "versions": [{"name": "1.0.0", "timestamp": "2000-01-01T01:01:00", "tags": [], "hidden": False}],
    }

    # check include_hidden=True
    get_projects_response = client_with_claimed_project.get("/api/projects/some-project?include_hidden=true")
    assert get_projects_response.status_code == 200
    assert get_projects_response.json() == {
        "name": "some-project",
        "versions": [{"name": "1.0.0", "timestamp": "2000-01-01T01:01:00", "tags": [], "hidden": False}],
    }

    # hide the version
    hide_response = client_with_claimed_project.post("/api/some-project/1.0.0/hide", headers={"Docat-Api-Key": "1234"})
    assert hide_response.status_code == 200
    assert hide_response.json() == {"message": "Version 1.0.0 is now hidden"}

    # check include_hidden=False
    get_projects_response = client_with_claimed_project.get("/api/projects/some-project?include_hidden=false")
    assert get_projects_response.status_code == 200
    assert get_projects_response.json() == {
        "name": "some-project",
        "versions": [],
    }

    # check include_hidden=True
    get_projects_response = client_with_claimed_project.get("/api/projects/some-project?include_hidden=true")
    assert get_projects_response.status_code == 200
    assert get_projects_response.json() == {
        "name": "some-project",
        "versions": [{"name": "1.0.0", "timestamp": "2000-01-01T01:01:00", "tags": [], "hidden": True}],
    }
