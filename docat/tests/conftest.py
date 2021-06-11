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
def client_with_claimed_project(client):
    table = app.db.table("claims")
    token_hash_1234 = b"\xe0\x8cS\xa3)\xb4\xb5\xa5\xda\xc3K\x96\xf6).\xdd-\xacR\x8e3Q\x17\x87\xfb\x94\x0c-\xc2h\x1c\xf3"
    table.insert({"name": "some-project", "token": token_hash_1234, "salt": b""})
    return app.test_client()


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
