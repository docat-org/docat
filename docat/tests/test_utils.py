from mock import MagicMock

from docat.utils import create_nginx_config, create_symlink, extract_archive


def test_symlink_creation():
    """
    Tests the creation of a symlink
    """
    source = MagicMock()
    destination = MagicMock()
    destination.exists.return_value = False
    destination.symlink_to.return_value = MagicMock()

    assert create_symlink(source, destination)

    destination.symlink_to.assert_called_once_with(
        source
    )


def test_symlink_creation_overwrite_destination():
    """
    Tests the creation of a symlink
    """
    source = MagicMock()
    destination = MagicMock()
    destination.exists.return_value = True
    destination.is_symlink.return_value = True
    destination.unlink.return_value = MagicMock()
    destination.symlink_to.return_value = MagicMock()

    assert create_symlink(source, destination)

    destination.unlink.assert_called_once()
    destination.symlink_to.assert_called_once_with(
        source
    )


def test_symlink_creation_do_not_overwrite_destination():
    """
    Tests the creation of a symlink
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