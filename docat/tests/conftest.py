import pytest
from tinydb import TinyDB
from tinydb.storages import MemoryStorage

from app import app
from docat.docat.utils import create_symlink


@pytest.fixture
def client():
    app.config["TESTING"] = True
    app.db = TinyDB(storage=MemoryStorage)
    yield app.test_client()
    app.db = None


@pytest.fixture
def temp_project_version(tmp_path):
    docs = tmp_path / "doc"
    config = tmp_path / "location.d"

    docs.mkdir()
    config.mkdir()

    def __create(project, version):
        (config / f"{project}-doc.conf").touch()
        version_docs = docs / project / version
        version_docs.mkdir(parents=True)
        (version_docs / "index.html").touch()

        create_symlink(version_docs, docs / project / "latest")

        return docs, config

    yield __create
