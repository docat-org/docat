import io


def test_search_finds_project_by_name(client_with_claimed_project):
    """
    Search should find a project by name. (Partial match)
    """
    create_project_response = client_with_claimed_project.post(
        "/api/some-project/1.0.0",
        files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
    )
    assert create_project_response.status_code == 201

    search_response = client_with_claimed_project.get("/api/search?query=some")
    assert search_response.status_code == 200
    assert search_response.json() == {"projects": [{"name": "some-project"}], "versions": [], "files": []}


def test_search_finds_project_by_name_full_match(client_with_claimed_project):
    """
    Search should find a project by name. (Full match)
    """
    create_project_response = client_with_claimed_project.post(
        "/api/some-project/1.0.0",
        files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
    )
    assert create_project_response.status_code == 201

    search_response = client_with_claimed_project.get("/api/search?query=some-project")
    assert search_response.status_code == 200
    assert search_response.json() == {"projects": [{"name": "some-project"}], "versions": [], "files": []}


def test_search_project_by_name_negative(client_with_claimed_project):
    """
    Search should not find a project by an unrelated name.
    """
    create_project_response = client_with_claimed_project.post(
        "/api/some-project/1.0.0",
        files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
    )
    assert create_project_response.status_code == 201

    search_response = client_with_claimed_project.get("/api/search?query=other")
    assert search_response.status_code == 200
    assert search_response.json() == {"projects": [], "versions": [], "files": []}


def test_search_ignores_empty_query(client_with_claimed_project):
    """
    Search should return an empty result if the query is empty.
    """
    create_project_response = client_with_claimed_project.post(
        "/api/some-project/1.0.0",
        files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
    )
    assert create_project_response.status_code == 201

    search_response = client_with_claimed_project.get("/api/search?query=%20")
    assert search_response.status_code == 200
    assert search_response.json() == {"projects": [], "versions": [], "files": []}

    search_response = client_with_claimed_project.get("/api/search?query=&")
    assert search_response.status_code == 200
    assert search_response.json() == {"projects": [], "versions": [], "files": []}


def test_search_finds_tag(client_with_claimed_project):
    """
    Search should find a tag by name. (Partial match)
    """
    create_project_response = client_with_claimed_project.post(
        "/api/some-project/1.0.0",
        files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
    )
    assert create_project_response.status_code == 201

    create_tag_response = client_with_claimed_project.put("/api/some-project/1.0.0/tags/latest")
    assert create_tag_response.status_code == 201

    search_response = client_with_claimed_project.get("/api/search?query=lat")
    assert search_response.status_code == 200
    assert search_response.json() == {"projects": [], "versions": [{"project": "some-project", "version": "latest"}], "files": []}


def test_search_finds_tag_full_match(client_with_claimed_project):
    """
    Search should find a tag by name. (Full match)
    """
    create_project_response = client_with_claimed_project.post(
        "/api/some-project/1.0.0",
        files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
    )
    assert create_project_response.status_code == 201

    create_tag_response = client_with_claimed_project.put("/api/some-project/1.0.0/tags/latest")
    assert create_tag_response.status_code == 201

    search_response = client_with_claimed_project.get("/api/search?query=latest")
    assert search_response.status_code == 200
    assert search_response.json() == {"projects": [], "versions": [{"project": "some-project", "version": "latest"}], "files": []}


def test_search_finds_tag_negative(client_with_claimed_project):
    """
    Search should not find a tag by an unrelated name.
    """
    create_project_response = client_with_claimed_project.post(
        "/api/some-project/1.0.0",
        files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
    )
    assert create_project_response.status_code == 201

    create_tag_response = client_with_claimed_project.put("/api/some-project/1.0.0/tags/latest")
    assert create_tag_response.status_code == 201

    search_response = client_with_claimed_project.get("/api/search?query=other")
    assert search_response.status_code == 200
    assert search_response.json() == {"projects": [], "versions": [], "files": []}


def test_search_finds_version(client_with_claimed_project):
    """
    Search should find a version by name. (Partial match)
    """
    create_project_response = client_with_claimed_project.post(
        "/api/some-project/1.0.0",
        files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
    )
    assert create_project_response.status_code == 201

    search_response = client_with_claimed_project.get("/api/search?query=1.0")
    assert search_response.status_code == 200
    assert search_response.json() == {"projects": [], "versions": [{"project": "some-project", "version": "1.0.0"}], "files": []}


def test_search_finds_version_full_match(client_with_claimed_project):
    """
    Search should find a version by name. (Full match)
    """
    create_project_response = client_with_claimed_project.post(
        "/api/some-project/1.0.0",
        files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
    )
    assert create_project_response.status_code == 201

    search_response = client_with_claimed_project.get("/api/search?query=1.0.0")
    assert search_response.status_code == 200
    assert search_response.json() == {"projects": [], "versions": [{"project": "some-project", "version": "1.0.0"}], "files": []}


def test_search_finds_version_negative(client_with_claimed_project):
    """
    Search should not find a version by an unrelated name.
    """
    create_project_response = client_with_claimed_project.post(
        "/api/some-project/1.0.0",
        files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
    )
    assert create_project_response.status_code == 201

    search_response = client_with_claimed_project.get("/api/search?query=0.1.0")
    assert search_response.status_code == 200
    assert search_response.json() == {"projects": [], "versions": [], "files": []}


def test_search_finds_both_project_and_version(client_with_claimed_project):
    """
    Search should find both the version and the project itself, if the names contain the query.
    """
    create_project_response = client_with_claimed_project.post(
        "/api/test/test",
        files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
    )
    assert create_project_response.status_code == 201

    search_response = client_with_claimed_project.get("/api/search?query=test")
    assert search_response.status_code == 200
    assert search_response.json() == {"projects": [{"name": "test"}], "versions": [{"project": "test", "version": "test"}], "files": []}


def test_search_is_case_insensitive(client_with_claimed_project):
    """
    Search should find the project even when the case doesn't match.
    """
    create_project_response = client_with_claimed_project.post(
        "/api/test/1.0.0",
        files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
    )
    assert create_project_response.status_code == 201

    search_response = client_with_claimed_project.get("/api/search?query=Test")
    assert search_response.status_code == 200
    assert search_response.json() == {"projects": [{"name": "test"}], "versions": [], "files": []}


def test_index_updated_on_tag(client_with_claimed_project):
    """
    The tag should automatically be recongnized by search after creation.
    """
    project = "some-project"
    version = "1.0.0"
    tag = "latest"

    create_project_response = client_with_claimed_project.post(
        f"/api/{project}/{version}",
        files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
    )
    assert create_project_response.status_code == 201

    search_response = client_with_claimed_project.get("/api/search?query=latest")
    assert search_response.status_code == 200
    assert search_response.json() == {"projects": [], "versions": [], "files": []}

    create_tag_response = client_with_claimed_project.put(f"/api/{project}/{version}/tags/{tag}")
    assert create_tag_response.status_code == 201

    search_response = client_with_claimed_project.get("/api/search?query=latest")
    assert search_response.status_code == 200
    assert search_response.json() == {"projects": [], "versions": [{"project": project, "version": tag}], "files": []}


def test_index_updated_on_rename(client_with_claimed_project):
    """
    The tag should automatically be recongnized by search after creation.
    """
    old_project_name = "some-project"
    new_project_name = "my-project"
    version = "1.0.0"

    create_project_response = client_with_claimed_project.post(
        f"/api/{old_project_name}/{version}",
        files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
    )
    assert create_project_response.status_code == 201

    search_response_1 = client_with_claimed_project.get("/api/search?query=some-project")
    assert search_response_1.status_code == 200
    assert search_response_1.json() == {"projects": [{"name": old_project_name}], "versions": [], "files": []}

    rename_response = client_with_claimed_project.put(
        f"/api/{old_project_name}/rename/{new_project_name}", headers={"Docat-Api-Key": "1234"}
    )
    assert rename_response.status_code == 200

    search_response_2 = client_with_claimed_project.get("/api/search?query=some")
    assert search_response_2.status_code == 200
    assert search_response_2.json() == {"projects": [], "versions": [], "files": []}

    search_response_3 = client_with_claimed_project.get("/api/search?query=my")
    assert search_response_3.status_code == 200
    assert search_response_3.json() == {"projects": [{"name": new_project_name}], "versions": [], "files": []}

    search_response_4 = client_with_claimed_project.get("/api/search?query=1.0")
    assert search_response_4.status_code == 200
    assert search_response_4.json() == {"projects": [], "versions": [{"project": new_project_name, "version": version}], "files": []}

    search_response_5 = client_with_claimed_project.get("/api/search?query=index")
    assert search_response_5.status_code == 200
    assert search_response_5.json() == {
        "projects": [],
        "versions": [],
        "files": [{"project": new_project_name, "version": version, "path": "index.html"}],
    }


def test_search_updated_on_delete(client_with_claimed_project):
    """
    The version and it's files should be removed from the index when deleted
    """
    project = "some-project"
    version = "1.0.0"
    version_to_delete = "1.0.1"

    create_project_response = client_with_claimed_project.post(
        f"/api/{project}/{version}",
        files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
    )
    assert create_project_response.status_code == 201

    create_project_response = client_with_claimed_project.post(
        f"/api/{project}/{version_to_delete}",
        files={"file": ("about.html", io.BytesIO(b"<h1>Other Content</h1>"), "plain/text")},
    )
    assert create_project_response.status_code == 201

    search_response_1 = client_with_claimed_project.get("/api/search?query=1.0")
    assert search_response_1.status_code == 200
    assert search_response_1.json() == {
        "projects": [],
        "versions": [{"project": project, "version": version_to_delete}, {"project": project, "version": version}],
        "files": [],
    }
    search_response_2 = client_with_claimed_project.get("/api/search?query=about.html")
    assert search_response_2.status_code == 200
    assert search_response_2.json() == {
        "projects": [],
        "versions": [],
        "files": [{"project": project, "version": version_to_delete, "path": "about.html"}],
    }

    delete_project_response = client_with_claimed_project.delete(f"/api/{project}/{version_to_delete}", headers={"Docat-Api-Key": "1234"})
    assert delete_project_response.status_code == 200
    search_response_3 = client_with_claimed_project.get("/api/search?query=1.0")
    assert search_response_3.status_code == 200
    assert search_response_3.json() == {
        "projects": [],
        "versions": [{"project": project, "version": version}],
        "files": [],
    }

    search_response_4 = client_with_claimed_project.get("/api/search?query=about")
    assert search_response_4.status_code == 200
    assert search_response_4.json() == {
        "projects": [],
        "versions": [],
        "files": [],
    }


def test_search_finds_files_by_name(client_with_claimed_project):
    """
    The search should find files by name.
    """
    project = "some-project"
    version = "1.0.0"

    create_project_response = client_with_claimed_project.post(
        f"/api/{project}/{version}",
        files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
    )
    assert create_project_response.status_code == 201

    search_response = client_with_claimed_project.get("/api/search?query=index")
    assert search_response.status_code == 200
    assert search_response.json() == {
        "projects": [],
        "versions": [],
        "files": [{"project": project, "version": version, "path": "index.html"}],
    }


def test_search_finds_files_by_content_html(client_with_claimed_project):
    """
    The search should find html files by content.
    """
    project = "some-project"
    version = "1.0.0"

    create_project_response = client_with_claimed_project.post(
        f"/api/{project}/{version}",
        files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
    )
    assert create_project_response.status_code == 201

    search_response = client_with_claimed_project.get("/api/search?query=hello%20world")
    assert search_response.status_code == 200
    assert search_response.json() == {
        "projects": [],
        "versions": [],
        "files": [{"project": project, "version": version, "path": "index.html"}],
    }


def test_search_ignores_content_for_non_html_files(client_with_claimed_project):
    """
    The search should not find content of non-html files.
    (Should be impossible anyways because indexing should already ignore the content.)
    """

    project = "some-project"
    version = "1.0.0"

    create_project_response = client_with_claimed_project.post(
        f"/api/{project}/{version}",
        files={"file": ("index.txt", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
    )
    assert create_project_response.status_code == 201

    search_response = client_with_claimed_project.get("/api/search?query=hello%20world")
    assert search_response.status_code == 200
    assert search_response.json() == {
        "projects": [],
        "versions": [],
        "files": [],
    }


def test_search_ignores_files_of_hidden_versions_by_name(client_with_claimed_project):
    """
    After a version was hidden, it's files should not be found by name anymore.
    """
    project = "some-project"
    version = "1.0.0"

    create_project_response = client_with_claimed_project.post(
        f"/api/{project}/{version}",
        files={"file": ("index.txt", io.BytesIO(b"Lorem ipsum dolor sit..."), "plain/text")},
    )
    assert create_project_response.status_code == 201

    search_response_1 = client_with_claimed_project.get("/api/search?query=index")
    assert search_response_1.status_code == 200
    assert search_response_1.json() == {
        "projects": [],
        "versions": [],
        "files": [{"project": project, "version": version, "path": "index.txt"}],
    }

    hide_version_response = client_with_claimed_project.post(f"/api/{project}/{version}/hide", headers={"Docat-Api-Key": "1234"})
    assert hide_version_response.status_code == 200

    search_response_2 = client_with_claimed_project.get("/api/search?query=index")
    assert search_response_2.status_code == 200
    assert search_response_2.json() == {
        "projects": [],
        "versions": [],
        "files": [],
    }


def test_search_ignores_files_of_hidden_versions_by_content(client_with_claimed_project):
    """
    After a version was hidden, it's files should not be found by html content anymore.
    """
    project = "some-project"
    version = "1.0.0"

    create_project_response = client_with_claimed_project.post(
        f"/api/{project}/{version}",
        files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
    )
    assert create_project_response.status_code == 201

    search_response_1 = client_with_claimed_project.get("/api/search?query=hello%20world")
    assert search_response_1.status_code == 200
    assert search_response_1.json() == {
        "projects": [],
        "versions": [],
        "files": [{"project": project, "version": version, "path": "index.html"}],
    }

    hide_version_response = client_with_claimed_project.post(f"/api/{project}/{version}/hide", headers={"Docat-Api-Key": "1234"})
    assert hide_version_response.status_code == 200

    search_response_2 = client_with_claimed_project.get("/api/search?query=hello%20world")
    assert search_response_2.status_code == 200
    assert search_response_2.json() == {
        "projects": [],
        "versions": [],
        "files": [],
    }


def test_search_ignores_project_with_only_hidden_versions(client_with_claimed_project):
    """
    The project should not be found when all it's versions are hidden.
    """
    project = "some-project"
    version = "1.0.0"

    create_project_response = client_with_claimed_project.post(
        f"/api/{project}/{version}",
        files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
    )
    assert create_project_response.status_code == 201

    search_response_1 = client_with_claimed_project.get("/api/search?query=some-project")
    assert search_response_1.status_code == 200
    assert search_response_1.json() == {
        "projects": [{"name": project}],
        "versions": [],
        "files": [],
    }

    hide_version_response = client_with_claimed_project.post(f"/api/{project}/{version}/hide", headers={"Docat-Api-Key": "1234"})
    assert hide_version_response.status_code == 200

    search_response_2 = client_with_claimed_project.get("/api/search?query=some-project")
    assert search_response_2.status_code == 200
    assert search_response_2.json() == {
        "projects": [],
        "versions": [],
        "files": [],
    }


def test_search_finds_project_with_only_hidden_versions_after_showing(client_with_claimed_project):
    """
    The project should be found again when all it's versions are hidden and then shown again.
    """
    project = "some-project"
    version = "1.0.0"

    create_project_response = client_with_claimed_project.post(
        f"/api/{project}/{version}",
        files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
    )
    assert create_project_response.status_code == 201

    search_response_1 = client_with_claimed_project.get("/api/search?query=some-project")
    assert search_response_1.status_code == 200
    assert search_response_1.json() == {
        "projects": [{"name": project}],
        "versions": [],
        "files": [],
    }

    hide_version_response = client_with_claimed_project.post(f"/api/{project}/{version}/hide", headers={"Docat-Api-Key": "1234"})
    assert hide_version_response.status_code == 200

    search_response_2 = client_with_claimed_project.get("/api/search?query=some-project")
    assert search_response_2.status_code == 200
    assert search_response_2.json() == {
        "projects": [],
        "versions": [],
        "files": [],
    }

    hide_version_response = client_with_claimed_project.post(f"/api/{project}/{version}/show", headers={"Docat-Api-Key": "1234"})
    assert hide_version_response.status_code == 200

    search_response_1 = client_with_claimed_project.get("/api/search?query=some-project")
    assert search_response_1.status_code == 200
    assert search_response_1.json() == {
        "projects": [{"name": project}],
        "versions": [],
        "files": [],
    }


def test_search_ignores_hidden_versions(client_with_claimed_project):
    """
    The version should not be found when it's hidden.
    """
    project = "some-project"
    version = "1.0.0"

    create_project_response = client_with_claimed_project.post(
        f"/api/{project}/{version}",
        files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
    )
    assert create_project_response.status_code == 201

    search_response_1 = client_with_claimed_project.get("/api/search?query=1.0")
    assert search_response_1.status_code == 200
    assert search_response_1.json() == {
        "projects": [],
        "versions": [{"project": project, "version": version}],
        "files": [],
    }

    hide_version_response = client_with_claimed_project.post(f"/api/{project}/{version}/hide", headers={"Docat-Api-Key": "1234"})
    assert hide_version_response.status_code == 200

    search_response_2 = client_with_claimed_project.get("/api/search?query=1.0.0")
    assert search_response_2.status_code == 200
    assert search_response_2.json() == {
        "projects": [],
        "versions": [],
        "files": [],
    }


def test_search_finds_shown_versions_after_hide(client_with_claimed_project):
    """
    The version should be found again after it's hidden and shown again.
    """
    project = "some-project"
    version = "1.0.0"

    create_project_response = client_with_claimed_project.post(
        f"/api/{project}/{version}",
        files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
    )
    assert create_project_response.status_code == 201

    search_response_1 = client_with_claimed_project.get("/api/search?query=1.0")
    assert search_response_1.status_code == 200
    assert search_response_1.json() == {
        "projects": [],
        "versions": [{"project": project, "version": version}],
        "files": [],
    }

    hide_version_response = client_with_claimed_project.post(f"/api/{project}/{version}/hide", headers={"Docat-Api-Key": "1234"})
    assert hide_version_response.status_code == 200

    search_response_2 = client_with_claimed_project.get("/api/search?query=1.0")
    assert search_response_2.status_code == 200
    assert search_response_2.json() == {
        "projects": [],
        "versions": [],
        "files": [],
    }

    hide_version_response = client_with_claimed_project.post(f"/api/{project}/{version}/show", headers={"Docat-Api-Key": "1234"})
    assert hide_version_response.status_code == 200

    search_response_1 = client_with_claimed_project.get("/api/search?query=1.0")
    assert search_response_1.status_code == 200
    assert search_response_1.json() == {
        "projects": [],
        "versions": [{"project": project, "version": version}],
        "files": [],
    }


def test_search_project_version_and_file_match(client_with_claimed_project):
    """
    Test that the search finds the project, the version and a file with a matching name at the same time.
    """
    project = "some-project"
    version = "some-version"
    file = "some-file.html"

    create_project_response = client_with_claimed_project.post(
        f"/api/{project}/{version}",
        files={"file": (file, io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
    )
    assert create_project_response.status_code == 201

    search_response = client_with_claimed_project.get("/api/search?query=some")
    assert search_response.status_code == 200
    assert search_response.json() == {
        "projects": [{"name": project}],
        "versions": [{"project": project, "version": version}],
        "files": [{"project": project, "version": version, "path": file}],
    }


def test_search_project_version_content_match(client_with_claimed_project):
    """
    Test that the search finds the project, the version and the file with matching content at the same time.
    """
    project = "some-project"
    version = "some-version"
    file = "index.html"

    create_project_response = client_with_claimed_project.post(
        f"/api/{project}/{version}",
        files={"file": (file, io.BytesIO(b"<h1>some content</h1>"), "plain/text")},
    )
    assert create_project_response.status_code == 201

    search_response = client_with_claimed_project.get("/api/search?query=some")
    assert search_response.status_code == 200
    assert search_response.json() == {
        "projects": [{"name": project}],
        "versions": [{"project": project, "version": version}],
        "files": [{"project": project, "version": version, "path": file}],
    }


def test_search_file_and_content_match_no_duplicates(client_with_claimed_project):
    """
    Test that the search only returns the file once when the file name and the content match.
    """
    project = "some-project"
    version = "1.0.0"
    file = "hello-world.html"

    create_project_response = client_with_claimed_project.post(
        f"/api/{project}/{version}",
        files={"file": (file, io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")},
    )
    assert create_project_response.status_code == 201

    search_response = client_with_claimed_project.get("/api/search?query=hello")
    assert search_response.status_code == 200
    assert search_response.json() == {
        "projects": [],
        "versions": [],
        "files": [{"project": project, "version": version, "path": file}],
    }
