#!/bin/bash
set -e

# ── Lifeline India API — Docker Entrypoint ────────────────────────────────
# This script runs on every container start. It:
#   1. Waits for PostgreSQL to be reachable
#   2. Waits for Redis to be reachable
#   3. Runs Alembic migrations (idempotent)
#   4. Starts the application server
# ──────────────────────────────────────────────────────────────────────────

# ── Wait for PostgreSQL ──────────────────────────────────────────────────
wait_for_db() {
  local host="${1:-db}"
  local port="${2:-5432}"
  local retries=30
  local wait=2

  echo "[entrypoint] Waiting for PostgreSQL at ${host}:${port} ..."
  for i in $(seq 1 $retries); do
    if python -c "
import socket, sys
try:
    s = socket.create_connection(('${host}', ${port}), timeout=3)
    s.close()
    sys.exit(0)
except OSError:
    sys.exit(1)
" 2>/dev/null; then
      echo "[entrypoint] PostgreSQL is ready (attempt ${i})"
      return 0
    fi
    echo "[entrypoint] PostgreSQL not ready yet (attempt ${i}/${retries})"
    sleep "$wait"
  done

  echo "[entrypoint] ERROR: PostgreSQL did not become ready in time"
  exit 1
}

# ── Wait for Redis ───────────────────────────────────────────────────────
wait_for_redis() {
  local host="${1:-redis}"
  local port="${2:-6379}"
  local retries=30
  local wait=2

  echo "[entrypoint] Waiting for Redis at ${host}:${port} ..."
  for i in $(seq 1 $retries); do
    if python -c "
import socket, sys
try:
    s = socket.create_connection(('${host}', ${port}), timeout=3)
    s.close()
    sys.exit(0)
except OSError:
    sys.exit(1)
" 2>/dev/null; then
      echo "[entrypoint] Redis is ready (attempt ${i})"
      return 0
    fi
    echo "[entrypoint] Redis not ready yet (attempt ${i}/${retries})"
    sleep "$wait"
  done

  echo "[entrypoint] ERROR: Redis did not become ready in time"
  exit 1
}

# ── Read PostgreSQL host and port from DATABASE_URL ─────────────────────
DB_HOST_PORT=$(python - <<'PY'
import os
from urllib.parse import urlparse

url = os.environ.get("DATABASE_URL")
if not url:
    raise SystemExit("DATABASE_URL is not configured")

url = url.replace("postgresql+asyncpg://", "postgresql://", 1)
parsed = urlparse(url)

if not parsed.hostname:
    raise SystemExit("DATABASE_URL is invalid")

print(parsed.hostname, parsed.port or 5432)
PY
)

read -r DB_HOST DB_PORT <<< "$DB_HOST_PORT"

# ── Read Redis host and port from REDIS_URL ─────────────────────────────
REDIS_HOST_PORT=$(python - <<'PY'
import os
from urllib.parse import urlparse

url = os.environ.get("REDIS_URL")
if not url:
    raise SystemExit("REDIS_URL is not configured")

parsed = urlparse(url)

if not parsed.hostname:
    raise SystemExit("REDIS_URL is invalid")

print(parsed.hostname, parsed.port or 6379)
PY
)

read -r REDIS_HOST REDIS_PORT <<< "$REDIS_HOST_PORT"

# ── Wait for dependencies ────────────────────────────────────────────────
wait_for_db "$DB_HOST" "$DB_PORT"
wait_for_redis "$REDIS_HOST" "$REDIS_PORT"

# ── Run Alembic migrations (idempotent) ──────────────────────────────────
echo "[entrypoint] Running Alembic migrations..."
alembic upgrade head
echo "[entrypoint] Migrations complete."

# ── Start application ────────────────────────────────────────────────────
echo "[entrypoint] Starting application server..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}" --log-level info