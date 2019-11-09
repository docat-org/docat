# building frontend
FROM node:13.1 as build-deps
COPY web ./
RUN yarn install
RUN yarn build

# production
FROM python:3.7
COPY --from=build-deps /dist /var/www/html
COPY backend /app
WORKDIR /app

RUN pip install -r requirements.txt

RUN apt-get update && apt-get install -y \
        nginx \
        sudo
RUN cp nginx/default /etc/nginx/sites-available/default

RUN mkdir -p /etc/nginx/locations.d
RUN mkdir -p /var/docat/doc
RUN chown -R www-data /var/docat /etc/nginx/locations.d

CMD ["./start.sh"]
