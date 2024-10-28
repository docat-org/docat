# building frontend
FROM node:22-slim AS frontend
WORKDIR /app/frontend

COPY web/package.json web/yarn.lock ./
RUN yarn install --frozen-lockfile

# fix docker not following symlinks
COPY web ./
COPY doc/getting-started.md ./src/assets/

ARG DOCAT_VERSION=unknown
ENV VITE_DOCAT_VERSION=$DOCAT_VERSION

RUN yarn build

# setup Python
FROM python:3.12-slim AS backend

# configure docker container
ENV PYTHONDONTWRITEBYTECODE=1 \
    # make poetry create the virtual environment in the project's root
    # it gets named `.venv`
    POETRY_VIRTUALENVS_IN_PROJECT=true \
    # do not ask any interactive question
    POETRY_NO_INTERACTION=1

RUN python -m pip install --upgrade pip
RUN python -m pip install poetry==1.7.1
COPY /docat/pyproject.toml /docat/poetry.lock /app/

# Install the application
WORKDIR /app/docat
RUN poetry install --no-root --no-ansi --only main

# production
FROM python:3.12-slim

# defaults
ENV MAX_UPLOAD_SIZE=100M

# set up the system
RUN apt-get update && \
    apt-get install --yes nginx dumb-init libmagic1 gettext && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /var/docat/doc

# install the application
RUN mkdir -p /var/www/html
COPY --from=frontend /app/frontend/dist /var/www/html
COPY docat /app/docat
WORKDIR /app/docat

# Copy the build artifact (.venv)
COPY --from=backend /app /app/docat

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["sh", "-c", "envsubst '$MAX_UPLOAD_SIZE' < /app/docat/docat/nginx/default > /etc/nginx/sites-enabled/default && nginx && .venv/bin/python -m uvicorn --host 0.0.0.0 --port 5000 docat.app:app"]
