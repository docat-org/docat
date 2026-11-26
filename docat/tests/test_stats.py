import io
from datetime import datetime
from unittest.mock import patch

import pytest

from docat.app import update_stats


@patch("docat.utils.get_version_timestamp", return_value=datetime(2000, 1, 1, 1, 1, 0))
@pytest.mark.parametrize(
    ("project_config", "n_projects", "n_versions", "storage"),
    [
        ([("some-project", ["1.0.0"])], 1, 1, "20 bytes"),
        ([("some-project", ["1.0.0", "2.0.0"])], 1, 2, "40 bytes"),
        ([("some-project", ["1.0.0", "2.0.0"])], 1, 2, "40 bytes"),
        ([("some-project", ["1.0.0", "2.0.0"]), ("another-project", ["1"])], 2, 3, "60 bytes"),
    ],
)
def test_get_stats(_, project_config, n_projects, n_versions, storage, client_with_claimed_project):
    """
    Make sure that get_stats works.
    """
    # create a version
    for project_name, versions in project_config:
        for version in versions:
            create_response = client_with_claimed_project.post(
                f"/api/{project_name}/{version}", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")}
            )
            assert create_response.status_code == 201

    # Force a sync update
    update_stats()

    # get system stats
    response = client_with_claimed_project.get("/api/stats")
    assert response.status_code == 200
    assert response.json() == {"n_projects": n_projects, "n_versions": n_versions, "storage": storage}


def test_background_start(client):
    with patch("docat.app.update_stats") as mock_update:
        response = client.get("/api/stats")

    assert response.status_code == 200
    mock_update.assert_called_once_with()


def test_background_refresh_is_throttled(client):
    with patch("docat.app.update_stats") as mock_update:
        client.get("/api/stats")
        client.get("/api/stats")

    mock_update.assert_called_once_with()


def test_background_refresh_after_interval(client):
    with patch("docat.app.update_stats") as mock_update, patch("docat.app.STATS_REFRESH_INTERVAL_SECONDS", 0):
        client.get("/api/stats")
        client.get("/api/stats")

    assert mock_update.call_count == 2
