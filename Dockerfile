# building frontend
FROM node:19.4 as frontend
WORKDIR /app/frontend
COPY web ./

# fix docker not following symlinks
COPY doc/getting-started.md ./src/assets/

RUN yarn install --frozen-lockfile
RUN yarn lint

# fix test not exiting by default
ARG CI=true
RUN yarn test

RUN yarn build

# setup Python
FROM python:3.11.0-alpine3.15 AS backend

# configure docker container
ENV PYTHONDONTWRITEBYTECODE=1 \
    # make poetry create the virtual environment in the project's root
    # it gets named `.venv`
    POETRY_VIRTUALENVS_IN_PROJECT=true \
    # do not ask any interactive question
    POETRY_NO_INTERACTION=1

RUN apk update && \
    apk add gcc musl-dev python3-dev libffi-dev openssl-dev cargo
RUN pip install poetry==1.2.1
COPY /docat/pyproject.toml /docat/poetry.lock /app/

# Install the application
WORKDIR /app/docat
RUN poetry install --no-root --no-ansi --only main

# production
FROM python:3.11.0-alpine3.15

# set up the system
RUN apk update && \
    apk add nginx dumb-init libmagic && \
    rm -rf /var/cache/apk/*

RUN mkdir -p /var/docat/doc

# install the application
RUN mkdir -p /var/www/html
COPY --from=frontend /app/frontend/build /var/www/html
COPY docat /app/docat
WORKDIR /app/docat

RUN cp docat/nginx/default /etc/nginx/http.d/default.conf

# Copy the build artifact (.venv)
COPY --from=backend /app /app/docat

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["sh", "-c", "nginx && .venv/bin/python -m uvicorn --host 0.0.0.0 --port 5000 docat.app:app"]
