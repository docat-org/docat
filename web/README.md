# docat web

## Project setup

```sh
yarn install [--pure-lockfile]
```

### Compiles and hot-reloads for development

Configure the backend connection by setting
port and host in `.env.development.local`.
Like this configuration for the host `127.0.0.1`
and the port `1337`.

```sh
VUE_APP_BACKEND_PORT=1337
VUE_APP_BACKEND_HOST=127.0.0.1
```

```sh
yarn serve
```

### Compiles and minifies for production

```sh
yarn build
```

### Lints and fixes files

```sh
yarn lint
```

### Basic Header Theeming

Not happy with the default Docat logo and header?
Just add your custom html header to the `/var/www/html/config.json` file.

```json
{ "headerHTML": "<h1>MyCompany</h1>" }
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).


## Development

To mount the development `dist/` folder while working on the
web frontend, you can mount the `dist/` folder as a docker volume:

```sh
sudo docker run \
  --detach \
  --volume /path/to/doc:/var/docat/doc/ \
  --volume /path/to/locations:/etc/nginx/locations.d/ \
  --volume /path/to/docat/web/dist:/var/www/html/ \
  --publish 8000:80 \
  docat
```
