# building frontend
FROM node:13.1 as build-deps
COPY web ./
RUN yarn install
RUN yarn lint
RUN yarn build

# production
FROM python:3.8

# set up the system
RUN apt update && \
	apt install --yes nginx sudo dumb-init && \
	rm -rf /var/lib/apt/lists/*

RUN mkdir -p /etc/nginx/locations.d
RUN mkdir -p /var/docat/doc
RUN chown -R www-data /var/docat /etc/nginx/locations.d

# install the application
COPY --from=build-deps /dist /var/www/html
COPY backend /app
WORKDIR /app

RUN cp nginx/default /etc/nginx/sites-available/default

RUN pip install pipenv
RUN pipenv install --ignore-pipfile --deploy --system

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["sh", "-c", "nginx && pipenv run -- flask run -h 0.0.0.0"]
