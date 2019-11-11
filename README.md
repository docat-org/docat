![docat](web/src/assets/docat-teaser.png)

**Host your docs. Simple. Versioned. Fancy.**

## Getting started

The simplest way is to build and run the docker container,
you can optionaly use volumes to save state:

```sh
docker build -t docat .
docker run [-d -v /path/to/doc:/var/docat/doc -v /path/to/locations:/etc/nginx/locations.d/] -p 8000:80 docat
```

If you want to run the application otherwise look at the
[backend](backend/README.md) and [web](web/README.md) docs.

