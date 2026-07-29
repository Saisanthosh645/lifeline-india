# Production readiness checklist

## Step 1: Container/Docker readiness
- [ ] Remove/adjust obsolete compose fields if they cause build/runtime confusion
- [ ] Align environment variables between `docker-compose.yml` and `apps/api/app/core/config.py`
- [ ] Ensure dependencies (db/redis) are reachable before API/Web start (healthchecks or waits)

## Step 2: FastAPI correctness
- [ ] Fix any Python/TypeScript errors surfaced by `docker compose up --build`
- [ ] Fix FastAPI import/model/router issues
- [ ] Fix JWT/Redis auth/session handling issues

## Step 3: React/Next.js correctness
- [ ] Fix all TypeScript errors
- [ ] Fix Next build/runtime errors (middleware/cookies/routes)

## Step 4: Database + Docker stability
- [ ] Ensure DB migrations/metadata create does not crash
- [ ] Ensure containers stay running (no restart loops)

## Step 5: Auth (login/signup) working end-to-end
- [ ] Synchronize access token between localStorage and cookies so Next middleware + API calls both work
- [ ] Make cookie parsing resilient (no JSON parse crashes / missing cookies)

