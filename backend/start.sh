#!/usr/bin/env bash
service nginx start
pipenv run -- flask run -h 0.0.0.0
