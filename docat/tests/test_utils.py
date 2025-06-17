from pathlib import Path
from unittest.mock import MagicMock, patch

import docat.app as docat
from docat.utils import create_symlink, extract_archive, get_dir_size, remove_docs


def test_symlink_creation():
    """
    Tests the creation of a symlink
    """
    source = MagicMock()
    destination = MagicMock()
    destination.exists.return_value = False
    destination.symlink_to.return_value = MagicMock()

    assert create_symlink(source, destination)

    destination.symlink_to.assert_called_once_with(source)


def test_symlink_creation_overwrite_destination():
    """
    Tests the creation of a symlink and overwriting
    of existing symlink
    """
    source = MagicMock()
    destination = MagicMock()
    destination.exists.return_value = True
    destination.is_symlink.return_value = True
    destination.unlink.return_value = MagicMock()
    destination.symlink_to.return_value = MagicMock()

    assert create_symlink(source, destination)

    destination.unlink.assert_called_once()
    destination.symlink_to.assert_called_once_with(source)


def test_symlink_creation_do_not_overwrite_destination():
    """
    Tests wether a symlinc is not created when it
    would overwrite an existing version
    """
    source = MagicMock()
    destination = MagicMock()
    destination.exists.return_value = True
    destination.is_symlink.return_value = False
    destination.unlink.return_value = MagicMock()
    destination.symlink_to.return_value = MagicMock()

    assert not create_symlink(source, destination)

    destination.unlink.assert_not_called()
    destination.symlink_to.assert_not_called()


def test_archive_artifact():
    target_file = Path("/some/zipfile.zip")
    destination = "/tmp/null"
    with patch.object(Path, "unlink") as mock_unlink, patch("docat.utils.ZipFile") as mock_zip:
        mock_zip_open = MagicMock()
        mock_zip.return_value.__enter__.return_value.extractall = mock_zip_open

        extract_archive(target_file, destination)

        mock_zip.assert_called_once_with(target_file, "r")
        mock_zip_open.assert_called_once()
        mock_unlink.assert_called_once()


def test_remove_version(temp_project_version):
    docs = temp_project_version("project", "1.0")
    remove_docs("project", "1.0", docat.DOCAT_UPLOAD_FOLDER)

    assert docs.exists()
    assert not (docs / "project").exists()


def test_remove_symlink_version(temp_project_version):
    project = "project"
    docs = temp_project_version(project, "1.0")
    symlink_to_latest = docs / project / "latest"
    assert symlink_to_latest.is_symlink()

    remove_docs(project, "latest", docat.DOCAT_UPLOAD_FOLDER)

    assert not symlink_to_latest.exists()


def test_broken_symlinks_in_projects(temp_project_version):
    project = "project"
    docs = temp_project_version(project, "1.0")

    create_symlink(docs / project / "broken", docs / project / "latest")

    get_dir_size(docs / project)
