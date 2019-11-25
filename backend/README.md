# Backend

The backend hosts the documentation and an api to push documentation and
tag versions of the documentation.

## development enviroment

You will need to install [pipenv](https://github.com/pypa/pipenv) `pip install pipenv`.

Install the dependencies and run the application:

```sh
# install dependencies
pipenv install
# run the app
[FLASK_DEBUG=1] pipenv run -- flask run -h 0.0.0.0
```

## Usage

See [getting-started.md](../doc/getting-started.md)
