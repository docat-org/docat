# docat backend

The backend hosts the documentation and an api to push documentation and
tag versions of the documentation.

## development enviroment

You will need to install [uv](https://docs.astral.sh/uv/#installation) `curl -LsSf https://astral.sh/uv/install.sh | sh
`.

Install the dependencies and run the application:

```sh
# install dependencies
uv venv .venv
uv sync
# run the app
[DOCAT_SERVE_FILES=1] [DOCAT_STORAGE_PATH=/tmp] [FLASK_DEBUG=1] [PORT=8888] uv run python -m docat
```

### Config Options

* **DOCAT_SERVE_FILES**: Serve static documentation instead of a nginx (for testing)
* **DOCAT_STORAGE_PATH**: Upload directory for static files (needs to match nginx config)
* **FLASK_DEBUG**: Start flask in debug mode

## Usage

See [getting-started.md](../doc/getting-started.md)
