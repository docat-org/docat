.PHONY: all
all: format lint typing pytest

format:
	uv run ruff check --fix
	uv run ruff format
lint:
	uv run ruff check
typing:
	uv run mypy .
pytest:
	uv run pytest
