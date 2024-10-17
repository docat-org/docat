import io
from datetime import datetime
from unittest.mock import patch

import pytest


@patch("docat.utils.get_version_timestamp", return_value=datetime(2000, 1, 1, 1, 1, 0))
@pytest.mark.parametrize(
    ("project_config", "n_projects", "n_versions", "storage"),
    [
        ([("some-project", ["1.0.0"])], 1, 1, "22 bytes"),
        ([("some-project", ["1.0.0", "2.0.0"])], 1, 2, "44 bytes"),
        ([("some-project", ["1.0.0", "2.0.0"])], 1, 2, "44 bytes"),
        ([("some-project", ["1.0.0", "2.0.0"]), ("another-project", ["1"])], 2, 3, "66 bytes"),
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
    hide_response = client_with_claimed_project.get("/api/stats")
    assert hide_response.status_code == 200
    assert hide_response.json() == {"n_projects": n_projects, "n_versions": n_versions, "storage": storage}
