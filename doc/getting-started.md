## Getting started with DOCAT

### Upload your documentation

You can upload any static html site by zipping it and
then posting the file to the backend.

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

After this you can tag a version, this can be usefull when
the latest version should be available as `http://localhost:8000/docs/awesome-project/latest`

If you want to tag the version `1.0.0` as `latest` for awesome-project.

```sh
curl -X PUT http://localhost:8000/api/awesome-project/1.0.0/tags/latest
```
