# ---------- Python server (FastAPI + uv) ----------
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS server

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install Python dependencies first (cached unless the lockfile changes)
COPY src/py-pr/server/pyproject.toml src/py-pr/server/uv.lock src/py-pr/server/.python-version ./
RUN uv sync --locked --no-install-project --no-dev

COPY src/py-pr/server/src ./src

ENV PATH="/app/.venv/bin:$PATH"

# main.py imports `utils` relative to src/, so run from there
WORKDIR /app/src
EXPOSE 8000
CMD ["fastapi", "run", "main.py", "--host", "0.0.0.0", "--port", "8000"]

# ----------- Go Server -------------
FROM golang:1.26-alpine as goserver

WORKDIR /app

COPY src/go-pr/go.mod src/go-pr/go.sum ./

COPY src/go-pr ./

RUN go mod download

RUN go build -o app

EXPOSE 8085

ENTRYPOINT ["./app"]


# ---------- Bun client ----------
FROM oven/bun:1 AS client

WORKDIR /app

COPY client/package.json client/bun.lock ./
RUN bun install --frozen-lockfile

COPY client/ ./

EXPOSE 9000
CMD ["bun", "run", "index.ts"]
