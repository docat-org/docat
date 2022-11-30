## Getting started with DOCAT

### docatl, the docat CLI 🙀

The most convenient way to interact with docat is with it's official CLI tool, [docatl](https://github.com/docat-org/docatl).

You can download a standalone binary of the latest release for your platform [here](https://github.com/docat-org/docatl/releases/latest) or [use go](https://github.com/docat-org/docatl#using-go) or [docker](https://github.com/docat-org/docatl#using-docker) to install it.

The commands below contain examples both using `curl` and `docatl`. Do note that the host address and api-key can be omitted if specified in a `.docatl.yml` file. See the [docatl documentation](https://github.com/docat-org/docatl/blob/main/README.md) for more information.

Use `docatl --help` to discover all commands available to manage your `docat` documentation!

### Raw API endpoints

The following sections document the RAW API endpoints you can `curl`.

The API specification is exposed as an OpenAPI Documentation at http://localhost:8000/api/v1/openapi.json, 
via Swagger UI at http://localhost:8000/api/docs and 
as a pure documentation with redoc at http://localhost:8000/api/redoc.

#### Upload your documentation

You can upload any static HTML page by zipping it and uploading the zip file.

> Note: if an `index.html` file is present in the root of the zip file
  it will be served automatically.

For example to upload the file `docs.zip` as version `1.0.0` for `awesome-project` using `curl`:

```sh
curl -X POST -F "file=@docs.zip" http://localhost:8000/api/awesome-project/1.0.0
```

Using `docatl`: 

```sh
docatl push docs.zip awesome-project 1.0.0 --host http://localhost:8000
```

Any file type can be uploaded. To view an uploaded pdf, specify it's full path:

`http://localhost:8000/#/awesome-project/1.0.0/my_awesome.pdf`

You can also manually upload your documentation.
A very simple web form can be found under [upload](#/upload).

#### Tag documentation

After uploading you can tag a specific version. This can be useful when
the latest version should be available as `http://localhost:8000/docs/awesome-project/latest`

To tag the version `1.0.0` as `latest` for `awesome-project`:

```sh
curl -X PUT http://localhost:8000/api/awesome-project/1.0.0/tags/latest
```

Using `docatl`: 

```sh
docatl tag awesome-project 1.0.0 latest --host http://localhost:8000
```

#### Claim Project

Claiming a Project returns a `token` which can be used for actions
which require authentication (for example for deleting a version).
Each Project can be claimed **exactly once**, so best store the token safely.

```sh
curl -X GET http://localhost:8000/api/awesome-project/claim
```

Using `docatl`: 

```sh
docatl claim awesome-project --host http://localhost:8000
```

#### Authentication

To make an authenticated call, specify a header with the key `Docat-Api-Key` and your token as the value:

```sh
curl -X DELETE --header "Docat-Api-Key: <token>" http://localhost:8000/api/awesome-project/1.0.0
```

Using `docatl`: 

```sh
docatl delete awesome-project 1.0.0 --host http://localhost:8000 --api-key <token>
```

#### Delete Version

To delete a Project version you need to be authenticated.

To remove the version `1.0.0` from `awesome-project`:

```sh
curl -X DELETE --header "Docat-Api-Key: <token>" http://localhost:8000/api/awesome-project/1.0.0
```

Using `docatl`: 

```sh
docatl delete awesome-project 1.0.0 --host http://localhost:8000 --api-key <token>
```

#### Upload Project Icon

To upload a icon, you don't need a token, except if you want to replace an existing icon.

To set `example-image.png` as the icon for `awesome-project`, which already has an icon:

```sh
curl -X POST -F "file=@example-image.png" --header "Docat-Api-Key: <token>" http://localhost:8000/api/awesome-project/icon
```

Using `docatl`: 

```sh
docatl push-icon awesome-project example-image.png --host http://localhost:8000 --api-key <token>
```

#### Rename a Project

To rename a Project, you need a token.

To rename `awesome-project` to `new-awesome-project`:

```sh
curl -X PUT --header "Docat-Api-Key: <token>" http://localhost:8000/api/awesome-project/rename/new-awesome-project
```

Using `docatl`:

```sh
docatl rename awesome-project new-awesome-project --host http://localhost:8000 --api-key <token>
```

#### Hide a Version

If you want to hide a version from the version select as well as the search results,
you can hide it. You need to be authenticated to do this.

To hide version `0.0.1` of `awesome-project`:

```sh
curl -X POST --header "Docat-Api-Key: <token>" http://localhost:8000/api/awesome-project/0.0.1/hide
```

Using `docatl`:

```sh
docatl hide awesome-project 0.0.1 --host http://localhost:8000 --api-key <token>
```

#### Show a Version

This is the reverse of `hide`, and also requires a token.

To show version `0.0.1` of `awesome-project` again:

```sh
curl -X POST --header "Docat-Api-Key: <token>" http://localhost:8000/api/awesome-project/0.0.1/show
```

Using `docatl`:

```sh
docatl show awesome-project 0.0.1 --host http://localhost:8000 --api-key <token>
```
### Force Index Re-creation

To force the re-creation of the search index, you can use the following command:

```sh
curl -X POST http://localhost:8000/api/index/update
```

Using `docatl`:

```sh
docatl update-index --host http://localhost:8000
```

Note that this can take some time.