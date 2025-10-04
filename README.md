# Manager Suite MVP

## What this is
- FastAPI backend (Docker) at http://localhost:8001
- Vite React frontend (Docker/Nginx) at http://localhost:5173
- Demo upload to /transcribe + mock metrics at /metrics/overview

## Run (both services)
cd infra
docker compose up --build   # first time (builds images)
# later: docker compose up   # starts without rebuilding

## Stop
# in the terminal running compose: press Ctrl+C
# or from anywhere:
cd infra
docker compose down

## Notes
- If frontend can’t reach the API, ensure API_BASE in `frontend/src/App.tsx`
  is "http://localhost:8001"
- If a port is busy, change `ports:` in infra/docker-compose.yml and update App.tsx.
