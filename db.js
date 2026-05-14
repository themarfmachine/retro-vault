const fs = require('fs');
const path = require('path');

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
function getGamesData() {
  initDataFile();
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  const games = JSON.parse(data);
  
  // Ensure all games have players field (default to 1 for existing entries)
  games.forEach(game => {
    if (!('players' in game)) {
      game.players = 1;
    }
  });
  
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
