const fs = require('fs');
const path = require('path');
const { GameSchema } = require('./schema');
const { getGameCover } = require('./igdbService');

let DATA_FILE = path.join(__dirname, 'games.json');

// Allow overriding data file for testing
function setDataFile(filePath) {
  DATA_FILE = filePath;
}

// Initialize data file if it doesn't exist
function initDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
  }
}

// Read and parse games data
// Note: Synchronous because it's called on server startup and by CLI
function getGamesData() {
  initDataFile();
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  const games = JSON.parse(data);
  let needsSave = false;
  
  // Ensure all games have players field (default to 1 for existing entries)
  games.forEach((game, index) => {
    if (!('players' in game)) {
      game.players = 1;
      needsSave = true;
    }
    
    // Validate against schema
    const result = GameSchema.safeParse(game);
    if (!result.success) {
      console.error(`❌ Invalid game data found at index ${index}:`, JSON.stringify(game, null, 2));
      console.error(`   Validation errors:`, result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', '));
      throw new Error(`DATA CORRUPTION: games.json contains invalid entries. Fix or reset the file.`);
    }
  });
  
  // We perform initial lazy fetching in a background task rather than blocking getGamesData
  // which is synchronous and called frequently
  setTimeout(async () => {
    let backgroundUpdated = false;
    for (const game of games) {
      if (!game.coverUrl) {
        try {
          const url = await getGameCover(game.title, game.platform);
          if (url) {
            game.coverUrl = url;
            backgroundUpdated = true;
            console.log(`[IGDB] Found cover art for: ${game.title}`);
          }
          // Sleep for 300ms to avoid hitting IGDB rate limits (4 req/sec max)
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (e) {
          // ignore errors in background sync
        }
      }
    }
    if (backgroundUpdated) {
      saveGames(games);
    }
  }, 0);
  
  if (needsSave) {
    saveGames(games);
  }
  
  return games;
}

// Save games to JSON file
function saveGames(games) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(games, null, 2));
}

// Add a new game
function addGame(title, platform, players) {
  const games = getGamesData();
  games.push({ title, platform, players: Number(players) });
  saveGames(games);
  console.log(`Added: ${title} (${platform})`);
}

// Delete games by title (case-insensitive)
function deleteGame(title) {
  const games = getGamesData();
  const lowerTitle = title.toLowerCase();
  
  // Filter out games that match the title (case-insensitive)
  const filteredGames = games.filter(game => 
    game.title.toLowerCase() !== lowerTitle
  );
  
  // Check if any games were removed
  if (filteredGames.length === games.length) {
    console.log(`No game found with title "${title}".`);
    return;
  }
  
  // Save the updated list
  saveGames(filteredGames);
  console.log(`Removed all games with title "${title}".`);
}

module.exports = {
  setDataFile,
  initDataFile,
  getGamesData,
  saveGames,
  addGame,
  deleteGame
};
