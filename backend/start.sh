#!/usr/bin/env bash
service nginx start
uwsgi --http 127.0.0.1:5000 --wsgi-file app.py --callable app --need-app --die-on-term --uid www-data
