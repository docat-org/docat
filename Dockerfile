# building frontend
FROM node:13.6 as build-deps
COPY web ./
# fix docker not following symlinks
COPY doc/getting-started.md ./src/assets/
RUN yarn install --frozen-lockfile
RUN yarn lint
RUN yarn build

# production
FROM python:3.8-alpine

# set up the system
RUN apk update && \
    apk add nginx dumb-init && \
    mkdir /run/nginx

RUN mkdir -p /etc/nginx/locations.d
RUN mkdir -p /var/docat/doc
RUN chown -R nginx /var/docat /etc/nginx/locations.d

# install the application
RUN mkdir -p /var/www/html
COPY --from=build-deps /dist /var/www/html
COPY docat /app/docat
WORKDIR /app/docat

RUN cp nginx/default /etc/nginx/conf.d/default.conf

RUN pip install pipenv
RUN pipenv install --ignore-pipfile --deploy --system

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["sh", "-c", "nginx && pipenv run -- flask run -h 0.0.0.0"]
