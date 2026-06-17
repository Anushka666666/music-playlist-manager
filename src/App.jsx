import { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import PlaylistPanel from './components/PlaylistPanel';
import SongPanel from './components/SongPanel';
import StatsPage from './components/StatsPage';
import {
  fetchPlaylists,
  createPlaylist,
  deletePlaylist,
  addSong,
  removeSong,
  reorderSongs,
  toggleFavourite,
} from './utils/api';
import './App.css';

export default function App() {
  const [username, setUsername] = useState(() => localStorage.getItem('auth_username'));
  const [playlists, setPlaylists] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [view, setView] = useState('playlists');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load playlists when user logs in
  useEffect(() => {
    if (!username) return;

    setLoading(true);
    fetchPlaylists()
      .then((data) => {
        setPlaylists(data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Could not connect to the server. Is the backend running?');
        setLoading(false);
        console.error(err);
      });
  }, [username]);

  function handleLoginSuccess(name) {
    setUsername(name);
    setError('');
  }

  function handleLogout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_username');
    setUsername(null);
    setPlaylists([]);
    setActiveId(null);
    setView('playlists');
  }

  const activePlaylist = playlists.find((p) => p.id === activeId) || null;

  async function handleCreatePlaylist(name) {
    try {
      const newPlaylist = await createPlaylist(name);
      setPlaylists((prev) => [newPlaylist, ...prev]);
      setActiveId(newPlaylist.id);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDeletePlaylist(id) {
    try {
      await deletePlaylist(id);
      setPlaylists((prev) => prev.filter((p) => p.id !== id));
      if (activeId === id) setActiveId(null);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleAddSong(song) {
    try {
      const savedSong = await addSong(activeId, song);
      setPlaylists((prev) =>
        prev.map((p) =>
          p.id === activeId ? { ...p, songs: [...p.songs, savedSong] } : p
        )
      );
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleRemoveSong(songId) {
    try {
      await removeSong(activeId, songId);
      setPlaylists((prev) =>
        prev.map((p) =>
          p.id === activeId
            ? { ...p, songs: p.songs.filter((s) => s.id !== songId) }
            : p
        )
      );
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleReorderSongs(reorderedSongs) {
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === activeId ? { ...p, songs: reorderedSongs } : p
      )
    );
    try {
      await reorderSongs(activeId, reorderedSongs.map((s) => s.id));
    } catch (err) {
      console.error('Reorder failed:', err);
    }
  }

  async function handleToggleFavourite(playlistId, songId, currentValue) {
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId
          ? { ...p, songs: p.songs.map((s) => s.id === songId ? { ...s, favourite: !currentValue } : s) }
          : p
      )
    );
    try {
      await toggleFavourite(songId, !currentValue);
    } catch (err) {
      // Revert on failure
      setPlaylists((prev) =>
        prev.map((p) =>
          p.id === playlistId
            ? { ...p, songs: p.songs.map((s) => s.id === songId ? { ...s, favourite: currentValue } : s) }
            : p
        )
      );
      console.error('Failed to toggle favourite:', err);
    }
  }

  // Show login page if not authenticated
  if (!username) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  if (loading) {
    return (
      <div className="app">
        <p style={{ textAlign: 'center', padding: '60px', color: '#6b6b80' }}>
          Loading...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ color: '#e74c3c', fontWeight: 600 }}>{error}</p>
          <p style={{ color: '#6b6b80', marginTop: '8px', fontSize: '0.9rem' }}>
            Make sure the backend is running: <code>npm run server</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <div>
            <h1>Music Playlist Manager</h1>
            <p className="app-subtitle">Create playlists and add songs from iTunes</p>
          </div>
          <div className="user-info">
            <span className="user-greeting">Hi, <strong>{username}</strong></span>
            <button className="btn-logout" onClick={handleLogout}>Log out</button>
          </div>
        </div>

        <nav className="app-nav">
          <button
            className={`nav-tab ${view === 'playlists' ? 'nav-tab--active' : ''}`}
            onClick={() => setView('playlists')}
          >
            🎵 Playlists
          </button>
          <button
            className={`nav-tab ${view === 'stats' ? 'nav-tab--active' : ''}`}
            onClick={() => setView('stats')}
          >
            📊 Stats
          </button>
        </nav>
      </header>

      {view === 'stats' ? (
        <StatsPage playlists={playlists} />
      ) : (
        <div className="app-body">
          <PlaylistPanel
            playlists={playlists}
            activeId={activeId}
            onSelect={setActiveId}
            onCreate={handleCreatePlaylist}
            onDelete={handleDeletePlaylist}
          />
          <SongPanel
            playlist={activePlaylist}
            onAddSong={handleAddSong}
            onRemoveSong={handleRemoveSong}
            onReorderSongs={handleReorderSongs}
            onToggleFavourite={(songId, currentValue) =>
              handleToggleFavourite(activeId, songId, currentValue)
            }
          />
        </div>
      )}
    </div>
  );
}
