#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'games.json');

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
  return JSON.parse(data);
}

// Save games to JSON file
function saveGames(games) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(games, null, 2));
}

// Add a new game
function addGame(title, platform) {
  const games = getGamesData();
  games.push({ title, platform });
  saveGames(games);
  console.log(`Added: ${title} (${platform})`);
}

// Display games with duplicate prevention
function displayGames(games, header) {
  if (games.length === 0) {
    console.log('No games found.');
    return;
  }
  
  // Filter out duplicates based on title+platform combination
  const seen = new Set();
  const uniqueGames = games.filter(game => {
    const key = `${game.title.toLowerCase()}|${game.platform.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  console.log(header);
  console.log('-'.repeat(header.length));
  uniqueGames.forEach((game, index) => {
    console.log(`${index + 1}. ${game.title} - ${game.platform}`);
  });
}

// List all games
function listGames() {
  const games = getGamesData();
  displayGames(games, 'Saved Games');
}

// Search games: exact platform match first, then partial title search
function searchGames(term) {
  const games = getGamesData();
  const lowerTerm = term.toLowerCase();
  
  // First, try exact platform match (case-insensitive)
  const platformMatches = games.filter(game => 
    game.platform.toLowerCase() === lowerTerm
  );
  
  if (platformMatches.length > 0) {
    displayGames(platformMatches, `Search results for "${term}" (platform match)`);
    return;
  }
  
  // If no exact platform match, try partial title match (case-insensitive)
  const titleMatches = games.filter(game => 
    game.title.toLowerCase().includes(lowerTerm)
  );
  
  displayGames(titleMatches, `Search results for "${term}" (title match)`);
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

// Handle command line arguments
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage:');
    console.log('  node cli.js add <title> <platform>');
    console.log('  node cli.js list');
    console.log('  node cli.js search <term>');
    console.log('  node cli.js delete <title>');
    process.exit(1);
  }
  
  const command = args[0];
  
  switch (command) {
    case 'add':
      if (args.length < 3) {
        console.log('Error: Please provide both title and platform');
        console.log('Usage: node cli.js add <title> <platform>');
        process.exit(1);
      }
      const title = args[1];
      const platform = args[2];
      addGame(title, platform);
      break;
      
    case 'list':
      listGames();
      break;
      
    case 'search':
      if (args.length < 2) {
        console.log('Error: Please provide a search term');
        console.log('Usage: node cli.js search <term>');
        process.exit(1);
      }
      const term = args.slice(1).join(' ');
      searchGames(term);
      break;
      
    case 'delete':
      if (args.length < 2) {
        console.log('Error: Please provide a game title to delete');
        console.log('Usage: node cli.js delete <title>');
        process.exit(1);
      }
      const gameTitle = args.slice(1).join(' ');
      deleteGame(gameTitle);
      break;
      
    default:
      console.log('Error: Unknown command');
      console.log('Available commands: add, list, search, delete');
      process.exit(1);
  }
}

main();