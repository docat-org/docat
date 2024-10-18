# docat web

## Project setup

```sh
yarn install [--pure-lockfile]
```

### Compiles and hot-reloads for development

The script for `yarn start` automatically sets `VITE_DOCAT_VERSION` to display the current version in the footer,
so you can just run:

```sh
yarn start
```

### Compiles and minifies for production

To display the current version of docat in the footer, use the following script to set `VITE_DOCAT_VERSION`.
This one liner uses the latest tag, if there is one on the current commit, and the current commit if not.

```sh
VITE_DOCAT_VERSION=$(git describe --tags --always) yarn build
```

Otherwise you can just use the following and the footer will show `unknown`.

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
{
  "headerHTML": "<h1>MyCompany</h1>",
  "footerHTML": "Contact <a href='mailto:maintainers@contact.mail'>Maintainers</a>"
}
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
