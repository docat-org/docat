import pytest
from tinydb import TinyDB
from tinydb.storages import MemoryStorage

from app import app


@pytest.fixture
def client():
    app.config["TESTING"] = True
    app.db = TinyDB(storage=MemoryStorage)
    yield app.test_client()
    app.db = None

