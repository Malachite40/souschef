FROM python:3.13-slim

WORKDIR /app

# Install uv for fast dependency management
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Install curl for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Install dependencies only (without the project itself)
COPY apps/scraper/pyproject.toml apps/scraper/uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

# Copy app code and install the project
COPY apps/scraper/app/ app/
RUN uv sync --frozen --no-dev

EXPOSE 8001

# Hello world!
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
