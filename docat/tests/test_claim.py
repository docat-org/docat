def test_successfully_claim_token(client):

    rv = client.get("/api/some-project/claim")
    assert b"Project some-project successfully claimed" in rv.data
    assert b"token" in rv.data


def test_already_claimed(client):

    rv = client.get("/api/some-project/claim")
    rv = client.get("/api/some-project/claim")
    assert b"Project some-project is already claimed!" in rv.data
