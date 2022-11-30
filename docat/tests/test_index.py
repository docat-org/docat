import io
import os
import shutil
from unittest.mock import patch

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

    insert_file_index_into_db(docat.DOCAT_INDEX_PATH, project, version, "index.html", "hello world")

    assert index_db_files_table.all() == [{"path": "index.html", "content": "hello world", "project": project, "version": version}]


def test_remove_file_index_from_db(client_with_claimed_project, index_db_files_table):
    """
    Tests wether remove_file_index_from_db removes exactly the json insert_file_index_into_db wrote into the database.

    client_with_claimed_project is needed to create the context with the index db.
    """
    project = "some-project"
    version = "1.0.0"

    insert_file_index_into_db(docat.DOCAT_INDEX_PATH, project, version, "index.html", "hello world")
    remove_file_index_from_db(docat.DOCAT_INDEX_PATH, project, version)

    assert index_db_files_table.all() == []


def test_insert_version_into_version_index(client_with_claimed_project, index_db_project_table):
    """
    Tests wether insert_version_into_version_index inserts the correct json into the database.

    client_with_claimed_project is needed to create the context with the index db.
    """
    project = "some-project"
    version = "1.0.0"
    tag = "latest"

    insert_version_into_version_index(docat.DOCAT_INDEX_PATH, project, version, [tag])

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

    insert_version_into_version_index(docat.DOCAT_INDEX_PATH, project, version, [tag])
    insert_version_into_version_index(docat.DOCAT_INDEX_PATH, project, version, [tag])

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
        insert_version_into_version_index(docat.DOCAT_INDEX_PATH, project, version, [tag])

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

    insert_version_into_version_index(docat.DOCAT_INDEX_PATH, project, version, [old_tags])

    assert index_db_project_table.all() == [{"name": project, "versions": [{"name": version, "tags": [old_tags]}]}]

    insert_version_into_version_index(docat.DOCAT_INDEX_PATH, project, version, [new_tags])

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

    insert_version_into_version_index(docat.DOCAT_INDEX_PATH, project, version, [old_tags])
    assert index_db_project_table.all() == [{"name": project, "versions": [{"name": version, "tags": [old_tags]}]}]

    insert_version_into_version_index(docat.DOCAT_INDEX_PATH, project, version, [new_tags])
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
        insert_version_into_version_index(docat.DOCAT_INDEX_PATH, project, version, [tag])

    assert index_db_project_table.all() == [
        {"name": project, "versions": [{"name": versions[0], "tags": [tags[0]]}, {"name": versions[1], "tags": [tags[1]]}]}
    ]

    remove_version_from_version_index(docat.DOCAT_INDEX_PATH, project, versions[1])
    assert index_db_project_table.all() == [{"name": project, "versions": [{"name": versions[0], "tags": [tags[0]]}]}]


def test_remove_version_from_version_index_remove_last_version(client_with_claimed_project, index_db_project_table):
    """
    Tests wether remove_version_from_version_index removes the whole project from the database if the last version is removed.

    client_with_claimed_project is needed to create the context with the index db.
    """
    project = "some-project"
    version = "1.0.0"
    tag = "latest"

    insert_version_into_version_index(docat.DOCAT_INDEX_PATH, project, version, [tag])
    remove_version_from_version_index(docat.DOCAT_INDEX_PATH, project, version)

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

    update_version_index_for_project(docat.DOCAT_UPLOAD_FOLDER, docat.DOCAT_INDEX_PATH, project)
    assert index_db_project_table.all() == [
        {"name": project, "versions": [{"name": versions[1], "tags": []}, {"name": versions[0], "tags": []}]}
    ]

    shutil.rmtree(project_folder / versions[0])
    update_version_index_for_project(docat.DOCAT_UPLOAD_FOLDER, docat.DOCAT_INDEX_PATH, project)
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

    update_file_index_for_project_version(docat.DOCAT_UPLOAD_FOLDER, docat.DOCAT_INDEX_PATH, project, version)
    assert index_db_files_table.all().sort(key=lambda e: e.get("path")) == [
        {"path": files[1], "content": "", "project": project, "version": version},
        {"path": files[0], "content": "hello world", "project": project, "version": version},
    ].sort(key=lambda e: e["path"])

    os.remove(docat.DOCAT_UPLOAD_FOLDER / project / version / files[0])
    update_file_index_for_project_version(docat.DOCAT_UPLOAD_FOLDER, docat.DOCAT_INDEX_PATH, project, version)
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
        update_file_index_for_project_version(docat.DOCAT_UPLOAD_FOLDER, docat.DOCAT_INDEX_PATH, project, "1.0.0")
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

    update_file_index_for_project(docat.DOCAT_UPLOAD_FOLDER, docat.DOCAT_INDEX_PATH, project)
    assert index_db_files_table.all().sort(key=lambda e: e.get("version")) == [
        {"path": "index.html", "content": "hello world", "project": project, "version": versions[1]},
        {"path": "index.html", "content": "hello world", "project": project, "version": versions[0]},
    ].sort(key=lambda e: e["version"])

    shutil.rmtree(docat.DOCAT_UPLOAD_FOLDER / project / versions[0])
    update_file_index_for_project(docat.DOCAT_UPLOAD_FOLDER, docat.DOCAT_INDEX_PATH, project)
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
        update_file_index_for_project_version(docat.DOCAT_UPLOAD_FOLDER, docat.DOCAT_INDEX_PATH, project, version)

        mock_insert_file_index_into_db.assert_called_once_with(
            docat.DOCAT_INDEX_PATH,
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
        update_file_index_for_project_version(docat.DOCAT_UPLOAD_FOLDER, docat.DOCAT_INDEX_PATH, project, version)
        mock_insert_file_index_into_db.assert_called_once_with(
            docat.DOCAT_INDEX_PATH,
            project,
            version,
            file,
            "",
        )


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
    for (i, version) in enumerate(versions):
        tag_project_response = client_with_claimed_project.put(f"/api/{project}/{version}/tags/{tags[i]}")
        assert tag_project_response.status_code == 201

    with patch("docat.utils.insert_version_into_version_index") as mock_insert_version_into_version_index:
        index_all_projects(docat.DOCAT_UPLOAD_FOLDER, docat.DOCAT_INDEX_PATH)
        mock_insert_version_into_version_index.assert_any_call(docat.DOCAT_INDEX_PATH, project, versions[0], [tags[0]])
        mock_insert_version_into_version_index.assert_any_call(docat.DOCAT_INDEX_PATH, project, versions[1], [tags[1]])


def test_index_all_projects_creates_file_and_version_index(client_with_claimed_project):
    """
    Tests wether index_all_projects finds all projects and versions and creates the index accordingly.
    """
    projects = ["some-project", "another-project"]
    versions = ["1.0.0", "2.0.0"]

    # create two projects with two versions each
    for project in projects:
        for version in versions:
            create_project_response = client_with_claimed_project.post(
                f"/api/{project}/{version}",
                files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
            )
            assert create_project_response.status_code == 201

    with patch("docat.utils.insert_version_into_version_index") as mock_insert_version_into_version_index, patch(
        "docat.utils.insert_file_index_into_db"
    ) as mock_insert_file_index_into_db:
        index_all_projects(docat.DOCAT_UPLOAD_FOLDER, docat.DOCAT_INDEX_PATH)
        for project in projects:
            for version in versions:
                mock_insert_version_into_version_index.assert_any_call(docat.DOCAT_INDEX_PATH, project, version, [])
                mock_insert_file_index_into_db.assert_any_call(docat.DOCAT_INDEX_PATH, project, version, "index.html", "hello world")


def test_index_all_projects_creates_file_and_version_index_api(client_with_claimed_project):
    """
    Tests via the API wether index_all_projects finds all projects and versions and creates the index accordingly.
    """
    projects = ["some-project", "another-project"]
    versions = ["1.0.0", "2.0.0"]

    # create two projects with two versions each
    for project in projects:
        for version in versions:
            create_project_response = client_with_claimed_project.post(
                f"/api/{project}/{version}",
                files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
            )
            assert create_project_response.status_code == 201

    with patch("docat.utils.insert_version_into_version_index") as mock_insert_version_into_version_index, patch(
        "docat.utils.insert_file_index_into_db"
    ) as mock_insert_file_index_into_db:
        index_all_projects_response = client_with_claimed_project.post("/api/index/update")
        assert index_all_projects_response.status_code == 200

        for project in projects:
            for version in versions:
                mock_insert_version_into_version_index.assert_any_call(docat.DOCAT_INDEX_PATH, project, version, [])
                mock_insert_file_index_into_db.assert_any_call(docat.DOCAT_INDEX_PATH, project, version, "index.html", "hello world")


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