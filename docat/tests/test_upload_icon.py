import io
from unittest.mock import call, patch

import docat.app as docat


def test_successful_icon_upload(client_with_claimed_project):
    upload_folder_response = client_with_claimed_project.post(
        "/api/some-project/1.0.0", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")}
    )
    assert upload_folder_response.status_code == 201

    with patch("shutil.copyfileobj") as copyfileobj_mock, patch("os.remove") as remove_file_mock:
        upload_response = client_with_claimed_project.post(
            "/api/some-project/icon",
            files={"file": ("icon.jpg", io.BytesIO(b"some image data"), "image/jpeg")},
        )

        assert upload_response.status_code == 200
        assert upload_response.json() == {"message": "Icon successfully uploaded"}
        assert remove_file_mock.mock_calls == []
        assert len(copyfileobj_mock.mock_calls) == 1


def test_icon_upload_fails_with_no_project(client_with_claimed_project):
    with patch("shutil.copyfileobj") as copyfileobj_mock, patch("os.remove") as remove_file_mock:
        upload_response = client_with_claimed_project.post(
            "/api/non-existing-project/icon",
            files={"file": ("icon.png", io.BytesIO(b"some image data"), "image/png")},
        )

        assert upload_response.status_code == 404
        assert upload_response.json() == {"message": "Project non-existing-project not found"}
        assert remove_file_mock.mock_calls == []
        assert copyfileobj_mock.mock_calls == []


def test_icon_upload_fails_no_token_and_existing_icon(client):
    """
    upload twice, first time should be successful (nothing replaced),
    second time should fail (would need token to replace)
    """

    upload_folder_response = client.post(
        "/api/some-project/1.0.0", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")}
    )
    assert upload_folder_response.status_code == 201

    with patch("shutil.copyfileobj") as copyfileobj_mock, patch("os.remove") as remove_file_mock:
        upload_response_1 = client.post(
            "/api/some-project/icon",
            files={"file": ("icon.png", io.BytesIO(b"some image data"), "image/png")},
        )
        assert upload_response_1.status_code == 200
        assert upload_response_1.json() == {"message": "Icon successfully uploaded"}
        assert remove_file_mock.mock_calls == []
        assert len(copyfileobj_mock.mock_calls) == 1

    with patch("shutil.copyfileobj") as copyfileobj_mock, patch("os.remove") as remove_file_mock:
        upload_response_2 = client.post(
            "/api/some-project/icon",
            files={"file": ("icon.png", io.BytesIO(b"some other image data"), "image/png")},
        )
        assert upload_response_2.status_code == 401
        assert upload_response_2.json() == {"message": "Please provide a header with a valid Docat-Api-Key token for some-project"}
        assert remove_file_mock.mock_calls == []
        assert len(copyfileobj_mock.mock_calls) == 0


def test_icon_upload_successful_replacement_with_token(client_with_claimed_project):
    """
    upload twice, both times should be successful (token provided)
    """

    icon_path = docat.DOCAT_UPLOAD_FOLDER / "some-project" / "logo"

    upload_folder_response = client_with_claimed_project.post(
        "/api/some-project/1.0.0", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")}
    )
    assert upload_folder_response.status_code == 201

    with patch("shutil.copyfileobj") as copyfileobj_mock, patch("os.remove") as remove_file_mock:
        upload_response_1 = client_with_claimed_project.post(
            "/api/some-project/icon",
            files={"file": ("icon.png", io.BytesIO(b"some image data"), "image/png")},
            headers={"Docat-Api-Key": "1234"},
        )
        assert upload_response_1.status_code == 200
        assert upload_response_1.json() == {"message": "Icon successfully uploaded"}
        assert remove_file_mock.mock_calls == []
        assert len(copyfileobj_mock.mock_calls) == 1

    with patch("shutil.copyfileobj") as copyfileobj_mock, patch("os.remove") as remove_file_mock:
        upload_response_1 = client_with_claimed_project.post(
            "/api/some-project/icon",
            files={"file": ("icon.png", io.BytesIO(b"some other image data"), "image/png")},
            headers={"Docat-Api-Key": "1234"},
        )
        assert upload_response_1.status_code == 200
        assert upload_response_1.json() == {"message": "Icon successfully uploaded"}
        assert remove_file_mock.mock_calls == [call(icon_path)]
        assert len(copyfileobj_mock.mock_calls) == 1


def test_icon_upload_successful_no_token_no_existing_icon(client):
    upload_folder_response = client.post(
        "/api/some-project/1.0.0", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")}
    )
    assert upload_folder_response.status_code == 201

    with patch("shutil.copyfileobj") as copyfileobj_mock, patch("os.remove") as remove_file_mock:
        upload_response = client.post(
            "/api/some-project/icon",
            files={"file": ("icon.png", io.BytesIO(b"some image data"), "image/png")},
        )

        assert upload_response.status_code == 200
        assert upload_response.json() == {"message": "Icon successfully uploaded"}
        assert remove_file_mock.mock_calls == []
        assert len(copyfileobj_mock.mock_calls) == 1


def test_icon_upload_fails_no_image(client_with_claimed_project):
    upload_folder_response = client_with_claimed_project.post(
        "/api/some-project/1.0.0", files={"file": ("index.html", io.BytesIO(b"<h1>Hello World</h1>"), "plain/text")}
    )
    assert upload_folder_response.status_code == 201

    with patch("shutil.copyfileobj") as copyfileobj_mock, patch("os.remove") as remove_file_mock:
        upload_response = client_with_claimed_project.post(
            "/api/some-project/icon",
            files={"file": ("file.zip", io.BytesIO(b"not image data"), "application/zip")},
        )

        assert upload_response.status_code == 400
        assert upload_response.json() == {"message": "Icon must be an image"}
        assert remove_file_mock.mock_calls == []
        assert copyfileobj_mock.mock_calls == []
