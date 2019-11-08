# backend

## development enviroment

```
virtualenv env
source env/bin/activate
pip install -r requirements.txt
```

run it:

```
FLASK_DEBUG=1 FLASK_APP=app.py flask run -h 0.0.0.0
```

## Curl magic

Upload the file `sim.zip` as version `1.1.6` for simulacrum.

```
curl -X POST -H "Content-Type: multipart/form-data" -F "file=@sim.zip" http://10.39.91.205:5000/api/add/simulacrum/1.1.6
```

Tag the version `1.1.3` as `latest` for simulacrum.

```
curl -X POST -H "Content-Type: application/json" --data '{"tag": "latest"}' http://127.1:5000/api/tag/simulacrum/1.1.3
```
