import tempfile
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from tinydb import TinyDB

import docat.app as docat
from docat.utils import create_symlink


@pytest.fixture(autouse=True)
def setup_docat_paths():
    """
    Set up the temporary paths for the docat app.
    """

    temp_dir = tempfile.TemporaryDirectory()
    docat.DOCAT_STORAGE_PATH = Path(temp_dir.name)
    docat.DOCAT_DB_PATH = Path(temp_dir.name) / "db.json"
    docat.DOCAT_UPLOAD_FOLDER = Path(temp_dir.name) / "doc"

    yield

    temp_dir.cleanup()


@pytest.fixture
def client():
    docat.db = TinyDB(docat.DOCAT_DB_PATH)

    yield TestClient(docat.app)

    docat.app.db = None


@pytest.fixture
def client_with_claimed_project(client):
    table = docat.db.table("claims")
    token_hash_1234 = b"\xe0\x8cS\xa3)\xb4\xb5\xa5\xda\xc3K\x96\xf6).\xdd-\xacR\x8e3Q\x17\x87\xfb\x94\x0c-\xc2h\x1c\xf3"
    table.insert({"name": "some-project", "token": token_hash_1234.hex(), "salt": ""})
    yield client


@pytest.fixture
def temp_project_version():
    def __create(project, version):
        version_docs = docat.DOCAT_UPLOAD_FOLDER / project / version
        version_docs.mkdir(parents=True)
        (version_docs / "index.html").touch()

        create_symlink(version_docs, docat.DOCAT_UPLOAD_FOLDER / project / "latest")

        return docat.DOCAT_UPLOAD_FOLDER

    yield __create
