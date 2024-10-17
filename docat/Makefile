.PHONY: all
all: format lint typing pytest

format:
	poetry run ruff check --fix
	poetry run ruff format
lint:
	poetry run ruff check
typing:
	poetry run mypy .
pytest:
	poetry run pytest
