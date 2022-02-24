# building frontend
FROM node:17.6.0 as build-deps
COPY web ./
# fix docker not following symlinks
COPY doc/getting-started.md ./src/assets/
RUN yarn install --frozen-lockfile
RUN yarn lint
RUN yarn run test:unit
RUN yarn build

# setup Python
FROM python:3.10.2-alpine3.15 AS backend

# configure docker container
ENV PYTHONDONTWRITEBYTECODE=1 \
    # make poetry create the virtual environment in the project's root
    # it gets named `.venv`
    POETRY_VIRTUALENVS_IN_PROJECT=true \
    # do not ask any interactive question
    POETRY_NO_INTERACTION=1

RUN apk update && \
    apk add gcc musl-dev python3-dev libffi-dev openssl-dev cargo
RUN pip install poetry==1.1.13
COPY /docat/pyproject.toml /docat/poetry.lock /app/

# Install the application
WORKDIR /app/docat
RUN poetry install --no-root --no-ansi --no-dev

# production
FROM python:3.10.2-alpine3.15

# set up the system
RUN apk update && \
    apk add nginx dumb-init && \
    rm -rf /var/cache/apk/*

RUN mkdir -p /etc/nginx/locations.d
RUN mkdir -p /var/docat/doc
RUN chown -R nginx /var/docat /etc/nginx/locations.d

# install the application
RUN mkdir -p /var/www/html
COPY --from=build-deps /dist /var/www/html
COPY docat /app/docat
WORKDIR /app/docat

RUN cp docat/nginx/default /etc/nginx/http.d/default.conf

# Copy the build artifact (.venv)
COPY --from=backend /app /app/docat

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["sh", "-c", "nginx && .venv/bin/python -m uvicorn --host 0.0.0.0 --port 5000 docat.app:app"]
