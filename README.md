# Retro Vault

A retro game collection manager with both a command-line interface and a professional web UI. Add, search, list, and remove games with metadata like platform and player count — all stored in a local JSON database.

## Prerequisites

- [Node.js](https://nodejs.org/) v14.0.0 or higher

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   cd client && npm install && cd ..
   ```
2. Start both the API server and the web frontend:
   ```bash
   npm run dev
   ```
3. Open **http://localhost:5173** in your browser.

## Deployment with Docker

Retro Vault can be deployed using Docker, which is ideal for arcade cabinet hardware.

1. **Build and Start**:
   ```bash
   docker compose up --build -d
   ```
2. **Access**:
   - Web UI: **http://localhost:8080**
   - API: **http://localhost:3001/api/games**

The `games.json` file is mounted as a volume, ensuring your collection persists between container restarts.

## Web App

The web interface provides a retro-themed browser experience for managing your vault.

### Features

- **Card View** — Each game displayed as a card with title, platform, and player count.
- **Cabinet Ready Filter** — Instantly filter for 4-player titles, highlighted with a golden neon glow.
- **Add Game Form** — Add new entries directly from the browser.
- **Delete Button** — Remove games from your collection with a single click.

### API Endpoints

The Express server (port 3001) provides a simple REST API:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/games` | GET | Returns all games in the collection |
| `/api/games` | POST | Adds a new game (`{ title, platform, players }`) |
| `/api/games/:title` | DELETE | Removes games matching the title (case-insensitive) |

## CLI Commands

The original CLI tool is still available for terminal-based management.

### Add a game

```bash
node cli.js add <title> <platform> <players>
```

### List all games

```bash
node cli.js list
```

### List games by player count

```bash
node cli.js list --players <number>
```

### Search games

```bash
node cli.js search <term>
```

### Delete a game

```bash
node cli.js delete <title>
```

## Data Storage

All games are saved in `games.json` in the project root. This file is shared between the CLI and the Web App:

```json
{
  "title": "Super Mario Bros.",
  "platform": "NES",
  "players": 2
}
```

Existing entries missing a `players` field automatically default to `1` when loaded.

## Project Structure

```
retro-vault/
├── cli.js              ← Terminal-based management
├── server.js           ← Express API server
├── games.json          ← Shared game database
├── package.json        ← API dependencies & scripts
└── client/             ← React frontend (Vite)
    └── src/            ← Components, styles, and logic
```

## Arcade Cabinet Compatibility

Retro Vault is designed with arcade cabinet setups in mind. Both the CLI and the web UI provide lightweight, low-resource ways to manage your collection. The predictable JSON backend is easy to script into frontends like LaunchBox, RetroArch, or Batocera for custom metadata management.

## License

ISC
