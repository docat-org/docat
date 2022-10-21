import tempfile
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from tinydb import TinyDB
from tinydb.storages import MemoryStorage

import docat.app as docat
from docat.utils import create_symlink


@pytest.fixture
def client():
    temp_dir = tempfile.TemporaryDirectory()
    docat.DOCAT_UPLOAD_FOLDER = Path(temp_dir.name)
    docat.db = TinyDB(storage=MemoryStorage)
    yield TestClient(docat.app)
    docat.app.db = None
    temp_dir.cleanup()


@pytest.fixture
def upload_folder_path():
    return docat.DOCAT_UPLOAD_FOLDER


@pytest.fixture
def client_with_claimed_project(client):
    table = docat.db.table("claims")
    token_hash_1234 = b"\xe0\x8cS\xa3)\xb4\xb5\xa5\xda\xc3K\x96\xf6).\xdd-\xacR\x8e3Q\x17\x87\xfb\x94\x0c-\xc2h\x1c\xf3"
    table.insert({"name": "some-project", "token": token_hash_1234.hex(), "salt": ""})
    yield client


@pytest.fixture
def temp_project_version(tmp_path):
    docs = tmp_path / "doc"

    docs.mkdir()

    def __create(project, version):
        version_docs = docs / project / version
        version_docs.mkdir(parents=True)
        (version_docs / "index.html").touch()

        create_symlink(version_docs, docs / project / "latest")

        return docs

    yield __create
