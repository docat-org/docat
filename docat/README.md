# docat backend

The backend hosts the documentation and an api to push documentation and
tag versions of the documentation.

## development enviroment

You will need to install [poetry](https://python-poetry.org/docs/#installation) `pip install poetry==1.7.1`.

Install the dependencies and run the application:

```sh
# install dependencies
poetry install
# run the app
[DOCAT_SERVE_FILES=1] [FLASK_DEBUG=1] [PORT=8888] poetry run python -m docat
```

### Config Options

* **DOCAT_SERVE_FILES**: Serve static documentation instead of a nginx (for testing)
* **DOCAT_STORAGE_PATH**: Upload directory for static files (needs to match nginx config)
* **FLASK_DEBUG**: Start flask in debug mode
* **DOCAT_GLOBAL_CLAIM_TOKEN**: If set, all uploaded projects are being claimed automatically with that token.
* **DOCAT_GLOBAL_CLAIM_SALT**: If set, all claims will be made with this salt.

## Usage

See [getting-started.md](../doc/getting-started.md)
