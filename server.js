const express = require('express');
const cors = require('cors');
const { getGamesData, saveGames } = require('./db');
const { getGameCover } = require('./igdbService');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// API Routes
app.get('/api/games', (req, res) => {
  try {
    const games = getGamesData();
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read games' });
  }
});

app.post('/api/games', (req, res) => {
  const { title, platform, players } = req.body;
  if (!title || !platform || isNaN(players) || players <= 0) {
    return res.status(400).json({ error: 'Valid title, platform, and positive player count required' });
  }

  try {
    const games = getGamesData();
    const newGame = { title, platform, players: Number(players) };
    games.push(newGame);
    saveGames(games);
    res.status(201).json(newGame);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save game' });
  }
});

app.delete('/api/games/:title', (req, res) => {
  const targetTitle = req.params.title.toLowerCase();
  try {
    const games = getGamesData();
    const filteredGames = games.filter(g => g.title.toLowerCase() !== targetTitle);
    
    if (filteredGames.length === games.length) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const deletedCount = games.length - filteredGames.length;
    saveGames(filteredGames);
    res.json({ deleted: deletedCount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete game' });
  }
});

app.get('/api/media/:title', async (req, res) => {
  const targetTitle = req.params.title;
  
  try {
    // Attempt to fetch from IGDB
    const coverUrl = await getGameCover(targetTitle);
    
    // If a cover was found, optionally update the database
    if (coverUrl) {
       const games = getGamesData();
       let updated = false;
       
       for (const game of games) {
          if (game.title.toLowerCase() === targetTitle.toLowerCase() && !game.coverUrl) {
             game.coverUrl = coverUrl;
             updated = true;
          }
       }
       
       if (updated) {
         saveGames(games);
       }
    }
    
    res.json({ coverUrl });
  } catch (error) {
    console.error('Error fetching media route:', error);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

try {
  // Eagerly load and validate games data on startup
  getGamesData();
  app.listen(PORT, () => {
    console.log(`Retro Vault API running at http://localhost:${PORT}`);
  });
} catch (err) {
  console.error('\nFATAL ERROR DURING STARTUP:');
  console.error(err.message);
  process.exit(1);
}
