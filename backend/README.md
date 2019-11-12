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

### Add documentation

You can uppload any static html site by zipping it and 
then posting the file to the backend. 

For example to upload the file `docs.zip` as version `1.0.0` for awesome-project.

```sh
curl -X POST -F "file=@docs.zip" http://docat.host:5000/api/awesome-project/1.0.0
```

Any other file type is uploaded as well. 
An uploaded pdf would be available as 
`http://docat.host:5000/api/awesome-project/1.0.0/my_awesome.pdf` 

### Tag documentation

After this you can tag a version, this can be usefull when
the latest version should be available as `http://docat.host:5000/docs/awesome-project/latest`

If you want to tag the version `1.0.0` as `latest` for awesome-project.

```sh
curl -X PUT http://docat.host:5000/api/awesome-project/1.0.0/tags/latest
```
