## Getting started with DOCAT

### Upload your documentation

You can upload any static HTML site by zipping it and
then posting the file to the backend.

> Note: if a `index.html` file is present in the root of the zip file
  most web server will serve the file by default.

For example to upload the file `docs.zip` as version `1.0.0` for `awesome-project`.

```sh
curl -X POST -F "file=@docs.zip" http://localhost:8000/api/awesome-project/1.0.0
```

Any other file type is uploaded as well.
An uploaded pdf could be viewed like this:

`http://localhost:8000/#/awesome-project/1.0.0/my_awesome.pdf`

You can also manually upload your documentation.
A very simple web form can be found under [upload](#/upload).

### Tag documentation

After this you can tag a version, this can be useful when
the latest version should be available as `http://localhost:8000/docs/awesome-project/latest`

If you want to tag the version `1.0.0` as `latest` for awesome-project.

```sh
curl -X PUT http://localhost:8000/api/awesome-project/1.0.0/tags/latest
```

### Claim Project

Claiming a Project returns a `token` which can be used for actions
which require a authentication (for example deleting a version).
Each Project can be claimed exactly once.

```sh
curl -X GET http://localhost:8000/api/awesome-project/claim
```

### Authentication

To make an authenticated call a header with the key `Docat-Api-Key` and your token is required.

```sh
curl -X DELETE --header "Docat-Api-Key: <token>" http://localhost:8000/api/awesome-project/1.0.0
```

### Delete Version

To delete a Project version you need to be authenticated.

If you want to remove the version `1.0.0` from awesome-project.

```sh
curl -X DELETE --header "Docat-Api-Key: <token>" http://localhost:8000/api/awesome-project/1.0.0
```
