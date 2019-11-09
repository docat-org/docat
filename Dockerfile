# building frontend
FROM node:13.1 as build-deps
COPY web ./
RUN yarn install
RUN yarn build

# production
FROM python:3.7

# set up the system
RUN apt update
RUN apt install --yes nginx sudo

RUN mkdir -p /etc/nginx/locations.d
RUN mkdir -p /var/docat/doc
RUN chown -R www-data /var/docat /etc/nginx/locations.d

# install the application
COPY --from=build-deps /dist /var/www/html
COPY backend /app
WORKDIR /app

RUN cp nginx/default /etc/nginx/sites-available/default

RUN pip install pipenv
RUN pipenv install --ignore-pipfile

CMD ["./start.sh"]
