from pathlib import Path
from unittest.mock import MagicMock, mock_open, patch

from docat.utils import create_nginx_config, create_symlink, extract_archive, remove_docs


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


def test_create_nginx_config():
    """
    Tests the creation of the nginx config
    """
    jinja_template_mock = "{{ project }}:{{ dir_path }}"
    with patch.object(Path, "read_text", return_value=jinja_template_mock), patch.object(Path, "exists") as mock_exists, patch.object(
        Path, "open", mock_open()
    ) as mock_config, patch("subprocess.run"):
        mock_exists.return_value = False

        create_nginx_config("awesome-project", "/some/dir")

        mock_config.assert_called_once_with("w")
        mock_config().write.assert_called_once_with("awesome-project:/some/dir")


def test_not_overwrite_nginx_config():
    """
    Tests wether the nginx config does not get
    overwritten
    """
    jinja_template_mock = "{{ project }}:{{ dir_path }}"
    with patch("builtins.open", mock_open(read_data=jinja_template_mock)), patch.object(Path, "exists") as mock_exists, patch.object(
        Path, "open", mock_open()
    ) as mock_config, patch("subprocess.run"):
        mock_exists.return_value = True

        create_nginx_config("awesome-project", "/some/dir")

        assert not mock_config.called


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
    docs, config = temp_project_version("project", "1.0")
    with patch("docat.utils.UPLOAD_FOLDER", docs), patch("docat.utils.NGINX_CONFIG_PATH", config):
        remove_docs("project", "1.0")

        assert docs.exists()
        assert not (docs / "project").exists()
        assert config.exists()
        assert not (config / "project-doc.conf").exists()


def test_remove_symlink_version(temp_project_version):
    project = "project"
    docs, config = temp_project_version(project, "1.0")
    symlink_to_latest = docs / project / "latest"
    assert symlink_to_latest.is_symlink()

    with patch("docat.utils.UPLOAD_FOLDER", docs), patch("docat.utils.NGINX_CONFIG_PATH", config):
        remove_docs(project, "latest")

        assert not symlink_to_latest.exists()
