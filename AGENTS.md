# StarStadium — Base44 Dev Environment

## Overview
Vite + React 19 + Express single-server app. The dev server (`tsx server.ts`) starts Express on port 3000 with Vite in middleware mode, serving live source with HMR. No database — all data is in-memory mock data from `src/data/sportsDataMock.ts`.

## Running
- `docker compose -f docker-compose.base44.yml up -d` — starts the app on port 3000
- Container runs `npm install && npx tsx server.ts`
- Health check: `GET /api/health`
- `node_modules` is in a named volume (not bind-mounted) to avoid host conflicts

## Secrets (all optional — app boots without them)
- `GEMINI_API_KEY` — Google Gemini API key. Without it, AI chat uses simulated responses. Get from aistudio.google.com.
- `SPORTSDATA_API_KEY` — SportsData.io API key. Without it, app uses mock NFL data. Get from sportsdata.io.
- Placeholders in `.env.base44-defaults` are recognized by the code as "not configured" (values `MY_GEMINI_API_KEY`, `MY_SPORTSDATA_KEY`). Real values from `/run/base44/app.env` override them.

## Architecture Notes
- Single `server.ts` (~1500 lines) contains all Express API routes and Vite middleware setup
- `vite.config.ts` supports `DISABLE_HMR=true` env var to disable HMR/file watching
- Server binds `0.0.0.0:3000` — compatible with the preview proxy
- Package manager: Bun (bun.lock) but npm works fine for installs
- No build step needed in dev — Vite middleware serves source directly
