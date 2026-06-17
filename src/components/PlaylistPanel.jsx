import { useState } from 'react';

export default function PlaylistPanel({
  playlists,
  activeId,
  onSelect,
  onCreate,
  onDelete,
}) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  function handleCreate(e) {
    e.preventDefault();

    const trimmed = name.trim();

    if (!trimmed) {
      setError('Playlist name cannot be empty.');
      return;
    }

    if (trimmed.length > 50) {
      setError('Name must be 50 characters or less.');
      return;
    }

    const duplicate = playlists.some(
      (p) => p.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      setError('A playlist with this name already exists.');
      return;
    }

    onCreate(trimmed);
    setName('');
    setError('');
  }

  // Filter playlists by name OR by song title/artist inside them
  const filtered = playlists.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    const nameMatch = p.name.toLowerCase().includes(q);
    const songMatch = p.songs.some(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q)
    );

    return nameMatch || songMatch;
  });

  return (
    <aside className="playlist-panel">
      <h2>Your playlists</h2>

      {/* Create form */}
      <div className="create-form-wrapper">
        <div className="input-row">
          <input
            type="text"
            placeholder="New playlist name..."
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            maxLength={50}
          />
          <button className="btn-primary" onClick={handleCreate}>
            + Create
          </button>
        </div>
        {error && <p className="error-text">{error}</p>}
      </div>

      {/* Search/filter box */}
      {playlists.length > 0 && (
        <div className="search-filter-wrapper">
          <input
            type="text"
            placeholder="Filter by playlist or song..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="filter-input"
          />
          {searchQuery && (
            <button
              className="btn-clear-filter"
              onClick={() => setSearchQuery('')}
              title="Clear filter"
            >
              ×
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {playlists.length === 0 ? (
        <p className="empty-message">
          No playlists yet. Create one to get started!
        </p>
      ) : filtered.length === 0 ? (
        <p className="empty-message">No playlists match "{searchQuery}"</p>
      ) : (
        <ul className="playlist-list">
          {filtered.map((playlist) => (
            <li
              key={playlist.id}
              className={`playlist-item ${
                playlist.id === activeId ? 'active' : ''
              }`}
              onClick={() => onSelect(playlist.id)}
            >
              <div className="playlist-item-info">
                <span className="playlist-name">{playlist.name}</span>
                <span className="playlist-count">
                  {playlist.songs.length}{' '}
                  {playlist.songs.length === 1 ? 'song' : 'songs'}
                </span>
              </div>
              <button
                className="btn-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(playlist.id);
                }}
                title="Delete playlist"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
