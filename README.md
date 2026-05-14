# Retro Vault

A lightweight CLI tool for managing your retro game collection. Add, search, list, and remove games with metadata like platform and player count — all stored in a local JSON file.

## Prerequisites

- [Node.js](https://nodejs.org/) v14.0.0 or higher

## Usage

```bash
node cli.js <command> [options]
```

## Commands

### Add a game

```bash
node cli.js add <title> <platform> <players>
```

Adds a new game to the collection. Multi-word titles and platforms must be quoted.

```bash
node cli.js add "Super Mario Bros." "NES" 2
node cli.js add "Gauntlet" "Arcade" 4
node cli.js add "Metal Gear Solid" "PlayStation" 1
```

### List all games

```bash
node cli.js list
```

Displays every game in the collection with its platform and player count.

### List games by player count

```bash
node cli.js list --players <number>
```

Filters the collection to only show games with the given player count.

```bash
node cli.js list --players 4
```

```
Saved Games (4 players)
-----------------------
1. Gauntlet - Arcade (4 players)
2. Mario Kart 64 - N64 (4 players)
3. GoldenEye 007 - N64 (4 players)
...
```

Singular and plural wording is handled automatically — "1 player" vs "4 players".

### Search games

```bash
node cli.js search <term>
```

Searches by platform first (exact match, case-insensitive). If no platform match is found, falls back to a partial title search.

```bash
node cli.js search NES
node cli.js search "zelda"
```

### Delete a game

```bash
node cli.js delete <title>
```

Removes all games matching the given title (case-insensitive).

```bash
node cli.js delete "Galaga"
```

## Data Storage

All games are saved in `games.json` in the project root:

```json
{
  "title": "Super Mario Bros.",
  "platform": "NES",
  "players": 2
}
```

The file is created automatically on first run. Existing entries missing a `players` field default to `1`.

## Arcade Cabinet Compatibility

Retro Vault is designed with arcade cabinet setups in mind. Its lightweight JSON backend and zero-dependency CLI make it easy to script into frontends like LaunchBox, RetroArch, or Batocera for quick metadata lookups and collection management on low-resource hardware.

## License

ISC
