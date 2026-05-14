const express = require('express');
const cors = require('cors');
const { getGamesData, saveGames } = require('./db');

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

app.listen(PORT, () => {
  console.log(`Retro Vault API running at http://localhost:${PORT}`);
});
