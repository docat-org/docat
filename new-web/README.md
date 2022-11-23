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

### Basic Header Theeming

Not happy with the default Docat logo and header?
Just add your custom html header to the `/var/www/html/config.json` file.

```json
{ "headerHTML": "<h1>MyCompany</h1>" }
```