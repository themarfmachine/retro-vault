import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cabinetOnly, setCabinetOnly] = useState(false);
  const [formData, setFormData] = useState({ title: '', platform: '', players: '' });
  const [error, setError] = useState(null);

  const fetchGames = async () => {
    try {
      const response = await fetch('/api/games');
      const data = await response.json();
      setGames(data);
    } catch (err) {
      console.error('Failed to fetch games:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleAddGame = async (e) => {
    e.preventDefault();
    setError(null);
    if (!formData.title || !formData.platform || !formData.players) {
      setError('Fill all fields!');
      return;
    }

    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, players: parseInt(formData.players) }),
      });
      if (response.ok) {
        setFormData({ title: '', platform: '', players: '' });
        fetchGames();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to add game');
      }
    } catch (err) {
      setError('Network error!');
    }
  };

  const handleDelete = async (title) => {
    if (!confirm(`Delete all entries for "${title}"?`)) return;
    try {
      const response = await fetch(`/api/games/${encodeURIComponent(title)}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchGames();
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const filteredGames = cabinetOnly ? games.filter(g => g.players === 4) : games;

  return (
    <div className="App">
      <h1>RETRO VAULT</h1>

      <form className="add-game-form" onSubmit={handleAddGame}>
        <input 
          placeholder="TITLE" 
          value={formData.title} 
          onChange={e => setFormData({ ...formData, title: e.target.value })}
        />
        <input 
          placeholder="PLATFORM" 
          value={formData.platform} 
          onChange={e => setFormData({ ...formData, platform: e.target.value })}
        />
        <input 
          placeholder="PLAYERS" 
          type="number" 
          value={formData.players} 
          onChange={e => setFormData({ ...formData, players: e.target.value })}
        />
        <button type="submit">ADD GAME</button>
        {error && <div style={{ color: 'var(--accent)', fontSize: '8px', width: '100%', textAlign: 'center', marginTop: '0.5rem' }}>{error}</div>}
      </form>

      <div className="controls">
        <div className="toggle-container">
          <button 
            className={`toggle-btn ${cabinetOnly ? 'active' : ''}`}
            onClick={() => setCabinetOnly(!cabinetOnly)}
          >
            CABINET READY (4P)
          </button>
        </div>
        <div style={{ fontSize: '8px' }}>
          SHOWING {filteredGames.length} OF {games.length} GAMES
        </div>
      </div>

      <div className="game-grid">
        {filteredGames.map((game, i) => (
          <div key={`${game.title}-${i}`} className={`game-card ${game.players === 4 ? 'cabinet-ready' : ''}`}>
            <button className="delete-btn" onClick={() => handleDelete(game.title)}>X</button>
            <h3 className="game-title">{game.title}</h3>
            <div className="game-platform">{game.platform}</div>
            <div className={`player-count ${game.players === 4 ? 'cabinet-badge' : ''}`}>
              {game.players} PLAYER{game.players === 1 ? '' : 'S'}
            </div>
          </div>
        ))}
      </div>

      {loading && <div style={{ textAlign: 'center', marginTop: '2rem' }}>LOADING COLLECTION...</div>}
    </div>
  );
}

export default App;
