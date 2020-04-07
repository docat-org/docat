# web

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development

Configure the backend connection by setting 
port and host in `.env.development.local`.
Like this configuration for the host `127.0.0.1`
and the port `1337`.

```
VUE_APP_BACKEND_PORT=1337
VUE_APP_BACKEND_HOST=127.0.0.1
```

```
yarn serve [--mode development]
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Basic Header Theeming

Not happy with the default Docat logo and header?
Just add your custom html header to the `/var/www/html/config.json` file.

```
{"headerHTML": "<h1>MyCompany</h1>"}
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
