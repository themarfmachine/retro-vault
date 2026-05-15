# Retro Vault — Agent Context

**Project:** retro-vault — A full-stack library for curating a 4-player arcade cabinet collection.

## Source of Truth

- `db.js` — Data access layer (reads/writes `games.json`)
- `server.js` — Express API server (GET/POST/DELETE `/api/games`)
- `client/` — React frontend built with Vite

## Current Milestone

Testing Suite implemented and Dockerized.

## Development Flow

- `npm run dev` — concurrent API server (`:3001`) + Vite dev server (`:5173`)
- `npm test` — run Vitest suite (db logic, player defaults, 4-player filtering)
- `docker compose up --build -d` — production deployment (Nginx → backend)

## Key Conventions

- All game data lives in `games.json` (volume-mounted in Docker)
- CLI tool (`cli.js`) and web app share the same `db.js` module
- Missing `players` fields default to `1` on load
