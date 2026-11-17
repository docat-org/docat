import io
import time
from datetime import datetime
from unittest.mock import patch

import pytest


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

    # get system stats
    # the first call returns a dummy response and refreshes the cache in the background
    dummy_response = client_with_claimed_project.get("/api/stats")
    assert dummy_response.status_code == 200
    assert dummy_response.json() == {"n_projects": 0, "n_versions": 0, "storage": "0 bytes"}

    expected = {"n_projects": n_projects, "n_versions": n_versions, "storage": storage}
    for _ in range(100):
        response = client_with_claimed_project.get("/api/stats")
        assert response.status_code == 200
        if response.json() == expected:
            break
        time.sleep(0.05)
    assert response.json() == expected
