# docat web

## Project setup

```sh
yarn install [--pure-lockfile]
```

### Compiles and hot-reloads for development

Configure both the frontend port and the backend connection
by setting them in `.env.development.local`.
```sh
PORT=8080
BACKEND_HOST=127.0.0.1
BACKEND_PORT=5000
```

```sh
yarn start
```

### Compiles and minifies for production

```sh
yarn build
```

### Lints and fixes files

```sh
yarn lint
```

### Tests

```sh
yarn test
```

### Basic Header Theming

Not happy with the default Docat logo and header?
Just add your custom html header to the `/var/www/html/config.json` file.

```json
{ "headerHTML": "<h1>MyCompany</h1>" }
```


## Development

```sh
sudo docker run \
  --detach \
  --volume /path/to/doc:/var/docat/doc/ \
  --publish 8000:80 \
  docat
```

## Errors

If you get a 403 response when trying to read a version,
try changing the permissions of your docs folder on your host.

```sh
sudo chmod 777 /path/to/doc -r
```