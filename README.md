![docat](doc/assets/docat-teaser.png)

**Host your docs. Simple. Versioned. Fancy.**

[![build](https://github.com/docat-org/docat/workflows/docat%20ci/badge.svg)](https://github.com/docat-org/docat/actions)
[![Gitter](https://badges.gitter.im/docat-docs-hosting/community.svg)](https://gitter.im/docat-docs-hosting/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

## Getting started

The simplest way is to build and run the docker container,
you can optionally use volumes to persist state:

```sh
# run container in background and persist data (docs, nginx configs and tokens database as well as the content index)
# use 'ghcr.io/docat-org/docat:unstable' to get the latest changes
mkdir -p docat-run/
docker run \
  --detach \
  --volume $PWD/docat-run/doc:/var/docat/ \
  --publish 8000:80 \
  ghcr.io/docat-org/docat
```

Go to [localhost:8000](http://localhost:8000) to view your docat instance:

![docat screenshot](doc/assets/docat-screenshot.png)

### Local Development

For local development, first configure and start the backend (inside the `docat/` folder):

```sh
# create a folder for local development (uploading docs)
DEV_DOCAT_PATH="$(mktemp -d)"

# install dependencies
poetry install

# run the local development version
DOCAT_SERVE_FILES=1 DOCAT_STORAGE_PATH="$DEV_DOCAT_PATH" poetry run python -m docat
```

After this you need to start the frontend (inside the `web/` folder):

```sh
# install dependencies
yarn install --frozen-lockfile

# run the web app
yarn serve
```

For more advanced options, have a look at the
[backend](docat/README.md) and [web](web/README.md) docs.

### Push Documentation to docat

The preferred way to push documentation to a docat server is using the [docatl](https://github.com/docat-org/docatl)
command line application:

```sh
docatl push --host http://localhost:8000 /path/to/your/docs PROJECT VERSION
```

There are also docker images available for CI systems.

#### Using Standard UNIX Command Line Tools

If you have static html documentation or use something like
[mkdocs](https://www.mkdocs.org/), [sphinx](http://www.sphinx-doc.org/en/master/), ...
to generate your documentation, you can push it to docat:

```sh
# create a zip of your docs
zip -r docs.zip /path/to/your-docs
# upload them to the docat server (replace PROJECT/VERSION with your projectname and the version of the docs)
curl -X POST -F "file=@docs.zip" http://localhost:8000/api/PROJECT/VERSION
```

When you have multiple versions you may want to tag some version as **latest**:

```sh
# tag the version VERSION of project PROJECT as latest
curl -X PUT http://localhost:8000/api/PROJECT/VERSION/tags/latest
```

Same thing with `docatl`:

```sh
# tag the version VERSION of project PROJECT as latest
docatl tag --host http://localhost:8000 PROJECT VERSION
```

## Advanced `config.json`

It is possible to configure some things after the fact.

1. Create a `config.json` file
2. Mount it inside your docker container `--volume /path/to/config.json:/var/www/html/config.json`

Supported config options:

- headerHTML

## Advanced Usage

### Hide Controls

If you would like to send link to a specific version of the documentation without the option to change the version, you can do so by clicking on the `Hide Controls` button. This will hide the control buttons and change the link, which can then be copied as usual.

### Indexing

Docat uses indexing for better search performance. The index is automatically updated when you upload, modify or delete a project. However, this means that if you already have existing projects, these need to be initially indexed. There are two ways to do this:

#### Using an Environment Variable:

When the **DOCAT_INDEX_FILES** is set, docat forces creation of the index on startup. See [local development](#local-development) for examples.

> Note: This will increase startup time substantially, depending on how many projects you have.

#### Using the API:

You can force the index re-creation using the following request:

```sh
curl -X POST http://localhost:8000/api/index/update
```

Using `docatl`:

```sh
docatl update-index --host http://localhost:8000
```

Don't worry if it takes some time :)

## Adding a prefix path

It is possible to run docat on a subpath, for example `/docat/...`. To do this, you will need to perform different steps depending on how you want to run docat.

### Common Configuration

The first thing you will have to do no matter how you start docat, is to specify the prefix path in the `package.json` file (underneath the `version` tag):

> Important: The prefix path must start with a slash and end without one. (eg. `/docat`)

```json
"homepage": "/docat",
```

### Docker

To run docat with a prefix path in docker, you will need to rebuild the container with the build argument **PREFIX_PATH_ARG** set to your prefix path:

```sh
docker build . --no-cache --tag docat:with_prefix --build-arg PREFIX_PATH_ARG="/docat"

docker run --volume $DEV_DOCAT_PATH:/var/docat/ --publish 80:80 docat:with_prefix
```

### Local

To run docat locally with a prefix path, you have to specify the prefix path in environment variables for both the backend and the frontend:

#### Backend

You can run the backend directly with the **PREFIX_PATH** argument:

```sh
DOCAT_SERVE_FILES=1 DOCAT_STORAGE_PATH="$DEV_DOCAT_PATH" PREFIX_PATH="/docat" poetry run python -m docat
```

#### Frontend

For the frontend, you can just add the **REACT_APP_PREFIX_PATH** environment variable into the `.env` file:

```
REACT_APP_PREFIX_PATH=/docat
```