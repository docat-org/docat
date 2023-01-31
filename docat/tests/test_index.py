import io
import os
import shutil
from pathlib import Path

# we need ANY because unittest.mock would check the instance of TinyDB
# which is not the same as the one the app uses
from unittest.mock import patch

from tinydb import TinyDB

import docat.app as docat
from docat.utils import (
    index_all_projects,
    insert_file_index_into_db,
    insert_version_into_version_index,
    remove_file_index_from_db,
    remove_version_from_version_index,
    update_file_index_for_project,
    update_file_index_for_project_version,
    update_version_index_for_project,
)


def test_insert_file_index_into_db(client_with_claimed_project, index_db_files_table):
    """
    Tests wether insert_file_index_into_db inserts the correct json into the database.

    client_with_claimed_project is needed to create the context with the index db.
    """
    project = "some-project"
    version = "1.0.0"

    insert_file_index_into_db(docat.index_db, project, version, "index.html", "hello world")

    assert index_db_files_table.all() == [{"path": "index.html", "content": "hello world", "project": project, "version": version}]


def test_remove_file_index_from_db(client_with_claimed_project, index_db_files_table):
    """
    Tests wether remove_file_index_from_db removes exactly the json insert_file_index_into_db wrote into the database.

    client_with_claimed_project is needed to create the context with the index db.
    """
    project = "some-project"
    version = "1.0.0"

    insert_file_index_into_db(docat.index_db, project, version, "index.html", "hello world")
    remove_file_index_from_db(docat.index_db, project, version)

    assert index_db_files_table.all() == []


def test_insert_version_into_version_index(client_with_claimed_project, index_db_project_table):
    """
    Tests wether insert_version_into_version_index inserts the correct json into the database.

    client_with_claimed_project is needed to create the context with the index db.
    """
    project = "some-project"
    version = "1.0.0"
    tag = "latest"

    insert_version_into_version_index(docat.index_db, project, version, [tag])

    assert index_db_project_table.all() == [{"name": project, "versions": [{"name": version, "tags": [tag]}]}]


def test_insert_version_into_version_index_no_duplicates(client_with_claimed_project, index_db_project_table):
    """
    Tests wether insert_version_into_version_index doesn't create a new project
    or version when the version with the same tags already exists.

    client_with_claimed_project is needed to create the context with the index db.
    """
    project = "some-project"
    version = "1.0.0"
    tag = "latest"

    insert_version_into_version_index(docat.index_db, project, version, [tag])
    insert_version_into_version_index(docat.index_db, project, version, [tag])

    assert index_db_project_table.all() == [{"name": project, "versions": [{"name": version, "tags": [tag]}]}]


def test_insert_version_into_version_index_second(client_with_claimed_project, index_db_project_table):
    """
    Tests wether insert_version_into_version_index appends the version when the project already exists.

    client_with_claimed_project is needed to create the context with the index db.
    """

    project = "some-project"
    versions = ["1.0.0", "2.0.0"]
    tags = ["latest", "stable"]

    for version, tag in zip(versions, tags):
        insert_version_into_version_index(docat.index_db, project, version, [tag])

    assert index_db_project_table.all() == [
        {"name": project, "versions": [{"name": versions[0], "tags": [tags[0]]}, {"name": versions[1], "tags": [tags[1]]}]}
    ]


def test_insert_version_into_version_index_second_with_different_tags(client_with_claimed_project, index_db_project_table):
    """
    Tests wether insert_version_into_version_index correctly overwrites tags.
    For example, when a version is tagged as "latest" and then as "stable" and "nightly" , the "latest" tag should be removed.

    client_with_claimed_project is needed to create the context with the index db.
    """
    project = "some-project"
    version = "1.0.0"
    old_tags = ["latest"]
    new_tags = ["stale", "nightly"]

    insert_version_into_version_index(docat.index_db, project, version, [old_tags])

    assert index_db_project_table.all() == [{"name": project, "versions": [{"name": version, "tags": [old_tags]}]}]

    insert_version_into_version_index(docat.index_db, project, version, [new_tags])

    assert index_db_project_table.all() == [{"name": project, "versions": [{"name": version, "tags": [new_tags]}]}]


def test_insert_version_into_version_index_second_with_overlapping_tags(client_with_claimed_project, index_db_project_table):
    """
    Tests wether insert_version_into_version_index correctly overwrites tags.
    For example, when a version is tagged as "latest" and then as "stable" and "latest", the tags should become "stable" and "latest".

    client_with_claimed_project is needed to create the context with the index db.
    """
    project = "some-project"
    version = "1.0.0"
    old_tags = ["latest"]
    new_tags = ["stable", "latest"]

    insert_version_into_version_index(docat.index_db, project, version, [old_tags])
    assert index_db_project_table.all() == [{"name": project, "versions": [{"name": version, "tags": [old_tags]}]}]

    insert_version_into_version_index(docat.index_db, project, version, [new_tags])
    assert index_db_project_table.all() == [{"name": project, "versions": [{"name": version, "tags": [new_tags]}]}]


def test_remove_version_from_version_index(client_with_claimed_project, index_db_project_table):
    """
    Tests that only the version given is removed from the database.

    client_with_claimed_project is needed to create the context with the index db.
    """
    project = "some-project"
    versions = ["1.0.0", "2.0.0"]
    tags = ["latest", "stable"]

    for version, tag in zip(versions, tags):
        insert_version_into_version_index(docat.index_db, project, version, [tag])

    assert index_db_project_table.all() == [
        {"name": project, "versions": [{"name": versions[0], "tags": [tags[0]]}, {"name": versions[1], "tags": [tags[1]]}]}
    ]

    remove_version_from_version_index(docat.index_db, project, versions[1])
    assert index_db_project_table.all() == [{"name": project, "versions": [{"name": versions[0], "tags": [tags[0]]}]}]


def test_remove_version_from_version_index_remove_last_version(client_with_claimed_project, index_db_project_table):
    """
    Tests wether remove_version_from_version_index removes the whole project from the database if the last version is removed.

    client_with_claimed_project is needed to create the context with the index db.
    """
    project = "some-project"
    version = "1.0.0"
    tag = "latest"

    insert_version_into_version_index(docat.index_db, project, version, [tag])
    remove_version_from_version_index(docat.index_db, project, version)

    assert index_db_project_table.all() == []


def test_update_version_index_for_project(client_with_claimed_project, index_db_project_table):
    """
    Tests wether update_version_index_for_project correctly handles inserting and deleting versions.

    client_with_claimed_project is needed to create the context with the index db.
    """
    project = "some-project"
    versions = ["1.0.0", "2.0.0"]

    project_folder = docat.DOCAT_UPLOAD_FOLDER / project

    # we need to create the project folders manually,
    # since the api already updates the index
    for version in versions:
        (project_folder / version).mkdir(parents=True)

        with open(project_folder / version / "index.html", "w") as f:
            f.write("<h1>Hello World</h1>")

    update_version_index_for_project(docat.DOCAT_UPLOAD_FOLDER, docat.index_db, project)
    assert index_db_project_table.all() == [
        {"name": project, "versions": [{"name": versions[1], "tags": []}, {"name": versions[0], "tags": []}]}
    ]

    shutil.rmtree(project_folder / versions[0])
    update_version_index_for_project(docat.DOCAT_UPLOAD_FOLDER, docat.index_db, project)
    assert index_db_project_table.all() == [{"name": project, "versions": [{"name": versions[1], "tags": []}]}]


def test_update_file_index_for_project_version(client_with_claimed_project, index_db_files_table):
    """
    Tests wether update_file_index_for_project_version correctly handles inserting and deleting files.

    client_with_claimed_project is needed to create the context with the index db.
    """
    project = "some-project"
    version = "1.0.0"
    files = ["index.html", "style.css"]

    # we need to create the project folders manually,
    # since the api already updates the index
    (docat.DOCAT_UPLOAD_FOLDER / project / version).mkdir(parents=True)

    for file in files:
        with open(docat.DOCAT_UPLOAD_FOLDER / project / version / file, "w") as f:
            f.write("<h1>Hello World</h1>")

    update_file_index_for_project_version(docat.DOCAT_UPLOAD_FOLDER, docat.index_db, project, version)
    assert index_db_files_table.all().sort(key=lambda e: e.get("path")) == [
        {"path": files[1], "content": "", "project": project, "version": version},
        {"path": files[0], "content": "hello world", "project": project, "version": version},
    ].sort(key=lambda e: e["path"])

    os.remove(docat.DOCAT_UPLOAD_FOLDER / project / version / files[0])
    update_file_index_for_project_version(docat.DOCAT_UPLOAD_FOLDER, docat.index_db, project, version)
    assert index_db_files_table.all() == [
        {"path": files[1], "content": "", "project": project, "version": version},
    ]


def test_update_file_index_for_project_version_folder_does_not_exist(client_with_claimed_project):
    """
    Tests wether the function just returns when the folder for
    the given project / version does not exist.
    client_with_claimed_project is needed to create the context with the index db.
    """
    project = "non-existing-project"

    with patch("docat.utils.TinyDB") as mock_tinydb:
        update_file_index_for_project_version(docat.DOCAT_UPLOAD_FOLDER, docat.index_db, project, "1.0.0")
        mock_tinydb.assert_not_called()


def test_update_file_index_for_project(client_with_claimed_project, index_db_files_table):
    """
    Tests wether update_file_index_for_project correctly handles inserting and deleting versions.

    client_with_claimed_project is needed to create the context with the index db.
    """
    project = "some-project"
    versions = ["1.0.0", "2.0.0"]

    # we need to create the project folders manually,
    # since the api already updates the index
    for version in versions:
        (docat.DOCAT_UPLOAD_FOLDER / project / version).mkdir(parents=True)

        with open(docat.DOCAT_UPLOAD_FOLDER / project / version / "index.html", "w") as f:
            f.write("<h1>Hello World</h1>")

    update_file_index_for_project(docat.DOCAT_UPLOAD_FOLDER, docat.index_db, project)
    assert index_db_files_table.all().sort(key=lambda e: e.get("version")) == [
        {"path": "index.html", "content": "hello world", "project": project, "version": versions[1]},
        {"path": "index.html", "content": "hello world", "project": project, "version": versions[0]},
    ].sort(key=lambda e: e["version"])

    shutil.rmtree(docat.DOCAT_UPLOAD_FOLDER / project / versions[0])
    update_file_index_for_project(docat.DOCAT_UPLOAD_FOLDER, docat.index_db, project)
    assert index_db_files_table.all() == [{"path": "index.html", "content": "hello world", "project": project, "version": versions[1]}]


def test_index_project_with_html_content(client_with_claimed_project):
    """
    Tests wether the function creates an index for a given project as expected.
    """
    project = "some-project"
    version = "1.0.0"
    file = "index.html"
    content = "Hello World"

    # create a project with a version and a file
    create_project_response = client_with_claimed_project.post(
        f"/api/{project}/{version}",
        files={"file": (file, io.BytesIO(f"<h1>{content}</h1>".encode()), "plain/text")},
    )
    assert create_project_response.status_code == 201

    with patch("docat.utils.insert_file_index_into_db") as mock_insert_file_index_into_db:
        update_file_index_for_project_version(docat.DOCAT_UPLOAD_FOLDER, docat.index_db, project, version)

        mock_insert_file_index_into_db.assert_called_once_with(
            docat.index_db,
            project,
            version,
            file,
            content.lower(),
        )


def test_index_project_non_html(client_with_claimed_project):
    """
    Tests wether the function ignores the content of non-html files as expected.
    """
    project = "some-project"
    version = "1.0.0"
    file = "index.txt"
    content = "Hello World"

    # create a project with a version and a file
    create_project_response = client_with_claimed_project.post(
        f"/api/{project}/{version}",
        files={"file": (file, io.BytesIO(f"<h1>{content}</h1>".encode()), "plain/text")},
    )
    assert create_project_response.status_code == 201

    with patch("docat.utils.insert_file_index_into_db") as mock_insert_file_index_into_db:
        update_file_index_for_project_version(docat.DOCAT_UPLOAD_FOLDER, docat.index_db, project, version)
        mock_insert_file_index_into_db.assert_called_once_with(
            docat.index_db,
            project,
            version,
            file,
            "",
        )


def test_index_all_projects_uses_temp_database(client_with_claimed_project):
    """
    Tests whether index_all_projects uses the tmp-index.json db and swaps it afterwards.
    (The contents are checked in other tests.)
    """
    temp_db_path = docat.DOCAT_UPLOAD_FOLDER / "tmp-index.json"
    assert temp_db_path.exists() is False

    create_project_response = client_with_claimed_project.post(
        "/api/some-project/1.0.0",
        files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
    )
    assert create_project_response.status_code == 201

    # create a spy as the tmp-index.json db should still be removed
    with patch.object(Path, "rename", wraps=temp_db_path.rename) as mock_rename:
        index_all_projects(docat.DOCAT_UPLOAD_FOLDER, docat.DOCAT_INDEX_PATH)

        mock_rename.assert_called_once_with(docat.DOCAT_INDEX_PATH)

    assert (docat.DOCAT_UPLOAD_FOLDER / "tmp-index.json").exists() is False
    assert docat.DOCAT_INDEX_PATH.exists() is True


def test_index_all_projects_returns_if_temp_index_already_exists(client_with_claimed_project):
    """
    Tests whether index_all_projects returns if the tmp-index.json db already exists.
    """
    docat.DOCAT_UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
    temp_db_path = docat.DOCAT_UPLOAD_FOLDER / "tmp-index.json"

    assert temp_db_path.exists() is False
    temp_db_path.touch()
    assert temp_db_path.exists() is True

    with patch("docat.utils.get_all_projects") as mock_get_all_projects:
        index_all_projects(docat.DOCAT_UPLOAD_FOLDER, docat.DOCAT_INDEX_PATH)

        # should return before calling get_all_projects
        assert mock_get_all_projects.called is False

    temp_db_path.unlink()


def test_index_all_projects_temp_database_removed(client_with_claimed_project):
    """
    Tests whether index_all_projects removes the tmp-index.json db after it is done.
    """
    temp_db_path = docat.DOCAT_UPLOAD_FOLDER / "tmp-index.json"
    assert temp_db_path.exists() is False

    create_project_response = client_with_claimed_project.post(
        "/api/some-project/1.0.0",
        files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
    )
    assert create_project_response.status_code == 201

    index_all_projects(docat.DOCAT_UPLOAD_FOLDER, docat.DOCAT_INDEX_PATH)

    assert (docat.DOCAT_UPLOAD_FOLDER / "tmp-index.json").exists() is False
    assert docat.DOCAT_INDEX_PATH.exists() is True


def test_index_all_projects_all_tmp_databases_removed_on_exception(client_with_claimed_project):
    """
    Tests whether the tmp-index.json db is removed even though an exception is raised.
    """
    temp_db_path = docat.DOCAT_UPLOAD_FOLDER / "tmp-index.json"
    assert temp_db_path.exists() is False

    create_project_response = client_with_claimed_project.post(
        "/api/some-project/1.0.0",
        files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
    )
    assert create_project_response.status_code == 201

    exception_raised = False

    with patch("docat.utils.index_projects_in_parallel") as mock_index_projects_in_parallel, patch.object(
        Path, "rename", wraps=temp_db_path.rename
    ) as mock_rename:
        mock_index_projects_in_parallel.side_effect = Exception("Some exception")

        try:
            index_all_projects(docat.DOCAT_UPLOAD_FOLDER, docat.DOCAT_INDEX_PATH)
        except Exception:
            # catch the exception, as the test would fail otherwise
            exception_raised = True

        assert mock_rename.called is False
        assert exception_raised is True

    assert (docat.DOCAT_UPLOAD_FOLDER / "tmp-index.json").exists() is False
    assert (docat.DOCAT_UPLOAD_FOLDER / "tmp-index-0.json").exists() is False
    assert docat.DOCAT_INDEX_PATH.exists() is True


def test_index_all_projects_creates_version_and_tag_index(client_with_claimed_project):
    """
    Tests wether index_all_projects finds all versions and creates the index accordingly.
    """
    project = "some-project"
    versions = ["1.0.0", "2.0.0"]
    tags = ["latest", "stable"]

    # create a project with two versions
    for version in versions:
        create_project_response = client_with_claimed_project.post(
            f"/api/{project}/{version}",
            files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
        )
        assert create_project_response.status_code == 201

    # tag the versions
    for i, version in enumerate(versions):
        tag_project_response = client_with_claimed_project.put(f"/api/{project}/{version}/tags/{tags[i]}")
        assert tag_project_response.status_code == 201

    index_all_projects(docat.DOCAT_UPLOAD_FOLDER, docat.DOCAT_INDEX_PATH)

    assert docat.DOCAT_INDEX_PATH.exists() is True

    with TinyDB(docat.DOCAT_INDEX_PATH) as index_db:
        projects = index_db.table("projects").all()
        files = index_db.table("files").all()

        assert len(projects) == 1
        assert len(files) == 2

        assert projects == [
            {
                "name": "some-project",
                "versions": sorted(
                    [{"name": "1.0.0", "tags": ["latest"]}, {"name": "2.0.0", "tags": ["stable"]}], key=lambda x: x["name"], reverse=True
                ),
            }
        ]

        assert files == sorted(
            [{"path": "index.html", "content": "hello world", "project": "some-project", "version": version} for version in versions],
            key=lambda x: x["version"],
            reverse=True,
        )


def test_hide_show_removes_file_index_and_adds_again_only_version(client_with_claimed_project, index_db_files_table):
    """
    Tests that the hide function removes the files of the version from the index and that
    show adds it again with only one version.
    """
    project = "some-project"
    version = "1.0.0"

    # create a project with a version
    create_project_response = client_with_claimed_project.post(
        f"/api/{project}/{version}",
        files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
    )
    assert create_project_response.status_code == 201

    # make sure we have the files in the index
    assert index_db_files_table.all().sort(key=lambda e: e.get("version")) == [
        {"path": "index.html", "content": "hello world", "project": project, "version": version},
    ].sort(key=lambda e: e["version"])

    hide_version_response = client_with_claimed_project.post(f"/api/{project}/{version}/hide", headers={"Docat-Api-Key": "1234"})
    assert hide_version_response.status_code == 200

    # make sure the files are gone from the index
    assert index_db_files_table.all() == []

    hide_version_response = client_with_claimed_project.post(f"/api/{project}/{version}/show", headers={"Docat-Api-Key": "1234"})
    assert hide_version_response.status_code == 200

    # make sure it's back
    assert index_db_files_table.all().sort(key=lambda e: e.get("version")) == [
        {"path": "index.html", "content": "hello world", "project": project, "version": version},
    ].sort(key=lambda e: e["version"])


def test_hide_show_removes_file_index_and_adds_again(client_with_claimed_project, index_db_files_table):
    """
    Tests that the hide function removes the files of the version from the index and that
    show adds it again.
    """
    project = "some-project"
    versions = ["1.0.0", "2.0.0"]

    for version in versions:
        # create a project with a version
        create_project_response = client_with_claimed_project.post(
            f"/api/{project}/{version}",
            files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
        )
        assert create_project_response.status_code == 201

    # make sure we have the files in the index
    assert index_db_files_table.all().sort(key=lambda e: e.get("version")) == [
        {"path": "index.html", "content": "hello world", "project": project, "version": version[0]},
        {"path": "index.html", "content": "hello world", "project": project, "version": version[1]},
    ].sort(key=lambda e: e["version"])

    hide_version_response = client_with_claimed_project.post(f"/api/{project}/{versions[0]}/hide", headers={"Docat-Api-Key": "1234"})
    assert hide_version_response.status_code == 200

    # make sure the files are gone from the index
    assert index_db_files_table.all().sort(key=lambda e: e.get("version")) == [
        {"path": "index.html", "content": "hello world", "project": project, "version": version[1]},
    ].sort(key=lambda e: e["version"])

    hide_version_response = client_with_claimed_project.post(f"/api/{project}/{versions[0]}/show", headers={"Docat-Api-Key": "1234"})
    assert hide_version_response.status_code == 200

    # make sure they're back
    assert index_db_files_table.all().sort(key=lambda e: e.get("version")) == [
        {"path": "index.html", "content": "hello world", "project": project, "version": version[0]},
        {"path": "index.html", "content": "hello world", "project": project, "version": version[1]},
    ].sort(key=lambda e: e["version"])


def test_hide_show_removes_project_index_and_adds_again_on_hide_and_show_of_only_version(
    client_with_claimed_project, index_db_project_table
):
    """
    Tests that the hide function removes the version and project
    from the index if the only version gets hidden and that show adds it again.
    """
    project = "some-project"
    version = "1.0.0"

    # create a project with a version
    create_project_response = client_with_claimed_project.post(
        f"/api/{project}/{version}",
        files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
    )
    assert create_project_response.status_code == 201

    # make sure we have the version in the index
    assert index_db_project_table.all().sort(key=lambda e: e.get("name")) == [
        {"name": project, "versions": [version]},
    ].sort(key=lambda e: e["name"])

    hide_version_response = client_with_claimed_project.post(f"/api/{project}/{version}/hide", headers={"Docat-Api-Key": "1234"})
    assert hide_version_response.status_code == 200

    # make sure the version and project is gone from the index
    assert index_db_project_table.all() == []

    hide_version_response = client_with_claimed_project.post(f"/api/{project}/{version}/show", headers={"Docat-Api-Key": "1234"})
    assert hide_version_response.status_code == 200

    # make sure it's back
    assert index_db_project_table.all().sort(key=lambda e: e.get("name")) == [
        {"name": project, "versions": [version]},
    ].sort(key=lambda e: e["name"])


def test_hide_show_removes_version_from_index(client_with_claimed_project, index_db_project_table):
    """
    Tests that the hide function removes the version
    from the index if it gets hidden and that show adds it again.
    """
    project = "some-project"
    versions = ["1.0.0", "2.0.0"]

    for version in versions:
        # create a project with a version
        create_project_response = client_with_claimed_project.post(
            f"/api/{project}/{version}",
            files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
        )
        assert create_project_response.status_code == 201

    # make sure we have the version in the index
    assert index_db_project_table.all().sort(key=lambda e: e.get("name")) == [
        {"name": project, "versions": [{"name": v, "tags": []} for v in versions]},
    ].sort(key=lambda e: e["name"])

    hide_version_response = client_with_claimed_project.post(f"/api/{project}/{versions[0]}/hide", headers={"Docat-Api-Key": "1234"})
    assert hide_version_response.status_code == 200

    # make sure the version is gone from the index
    assert index_db_project_table.all().sort(key=lambda e: e.get("name")) == [
        {"name": project, "versions": [{"name": versions[1], "tags": []}]},
    ].sort(key=lambda e: e["name"])

    hide_version_response = client_with_claimed_project.post(f"/api/{project}/{versions[0]}/show", headers={"Docat-Api-Key": "1234"})
    assert hide_version_response.status_code == 200

    # make sure it's back
    assert index_db_project_table.all().sort(key=lambda e: e.get("name")) == [
        {"name": project, "versions": [{"name": v, "tags": []} for v in versions]},
    ].sort(key=lambda e: e["name"])
