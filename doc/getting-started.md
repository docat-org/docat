## Getting started with DOCAT

### docatl, the docat CLI 🙀

The most convenient way to interact with docat is with it's official CLI
tool, [docatl](https://github.com/docat-org/docatl).

You can download a standalone binary of the latest release
for your platform [here](https://github.com/docat-org/docatl/releases/latest)
or [use go](https://github.com/docat-org/docatl#using-go) or [use docker](https://github.com/docat-org/docatl#using-docker).

After you've obtained `docatl` just point it to your docs folder, which will be packaged and pushed to `docat`:

```sh
docatl push --host http://localhost:8000 ./docs/ awesome-project 1.0.0
```

Use `docatl --help` to discover all other commands to manage your docat documentation!

### Raw API endpoints

The following sections document the RAW API endpoints you can `curl`.

The API specification is exposed as OpenAPI at http://localhost:8000/api/v1/openapi.json
and available with Swagger UI at http://localhost:8000/api/docs and a pure documentation
is available with redoc at http://localhost:8000/api/redoc.

#### Upload your documentation

You can upload any static HTML site by zipping it and
then posting the file to the backend.

> Note: if a `index.html` file is present in the root of the zip file
  it will be server automatically.

For example to upload the file `docs.zip` as version `1.0.0` for `awesome-project`.

```sh
curl -X POST -F "file=@docs.zip" http://localhost:8000/api/awesome-project/1.0.0
```

Any other file type is uploaded as well.
An uploaded pdf could be viewed like this:

`http://localhost:8000/#/awesome-project/1.0.0/my_awesome.pdf`

You can also manually upload your documentation.
A very simple web form can be found under [upload](#/upload).

#### Tag documentation

After this you can tag a version, this can be useful when
the latest version should be available as `http://localhost:8000/docs/awesome-project/latest`

If you want to tag the version `1.0.0` as `latest` for awesome-project.

```sh
curl -X PUT http://localhost:8000/api/awesome-project/1.0.0/tags/latest
```

#### Claim Project

Claiming a Project returns a `token` which can be used for actions
which require a authentication (for example deleting a version).
Each Project can be claimed **exactly once**, so best store the token safely.

```sh
curl -X GET http://localhost:8000/api/awesome-project/claim
```

#### Authentication

To make an authenticated call a header with the key `Docat-Api-Key` and your token is required.

```sh
curl -X DELETE --header "Docat-Api-Key: <token>" http://localhost:8000/api/awesome-project/1.0.0
```

#### Delete Version

To delete a Project version you need to be authenticated.

If you want to remove the version `1.0.0` from awesome-project.

```sh
curl -X DELETE --header "Docat-Api-Key: <token>" http://localhost:8000/api/awesome-project/1.0.0
```

#### Upload Project Icon

To upload a icon, you don't need a token, except if 
a project icon already exists.

If you want to upload `example-image.png` to awesome-project, that already has a project icon.

```sh
curl -X POST -F "file=@example-image.png" --header "Docat-Api-Key: <token>" http://localhost:8000/api/awesome-project/icon
```
