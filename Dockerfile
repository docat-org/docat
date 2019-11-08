FROM python:3.7

ADD . /app
WORKDIR /app/backend

RUN apt-get update && apt-get install -y \
        nginx
RUN cp nginx/default /etc/nginx/sites-available/default

RUN pip install -r requirements.txt

CMD ["./start.sh"]
