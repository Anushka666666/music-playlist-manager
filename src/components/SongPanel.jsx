import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import SongCard from './SongCard';

function SortableSongCard({ song, onRemove, onToggleFavourite }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: song.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <SongCard
        song={song}
        onRemove={onRemove}
        onToggleFavourite={onToggleFavourite}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

export default function SongPanel({
  playlist,
  onAddSong,
  onRemoveSong,
  onReorderSongs,
  onToggleFavourite,
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleSearch(e) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setError('Enter a song name to search.');
      return;
    }

    setSearching(true);
    setError('');
    setResults([]);
    setSearched(false);

    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(trimmed)}&media=music&limit=6`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Search failed. Please try again.');
      const data = await response.json();

      setResults(
        data.results.map((item) => ({
          id: String(item.trackId),
          title: item.trackName,
          artist: item.artistName,
          album: item.collectionName || '',
          artwork: item.artworkUrl100 || '',
          itunesId: String(item.trackId),
          preview: item.previewUrl || '',
        }))
      );
      setSearched(true);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSearching(false);
    }
  }

  function handleAdd(song) {
    const duplicate = playlist.songs.some((s) => s.itunesId === song.itunesId);
    if (duplicate) {
      setError('This song is already in the playlist.');
      setTimeout(() => setError(''), 2500);
      return;
    }
    onAddSong(song);
    setError('');
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = playlist.songs.findIndex((s) => s.id === active.id);
    const newIndex = playlist.songs.findIndex((s) => s.id === over.id);
    onReorderSongs(arrayMove(playlist.songs, oldIndex, newIndex));
  }

  if (!playlist) {
    return (
      <main className="song-panel">
        <div className="no-playlist-selected">
          <h2>No playlist selected</h2>
          <p>Select a playlist from the left, or create a new one.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="song-panel">
      <h2>{playlist.name}</h2>

      <div className="search-section">
        <div className="input-row">
          <input
            type="text"
            placeholder="Search for a song..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); if (error) setError(''); }}
          />
          <button className="btn-primary" onClick={handleSearch} disabled={searching}>
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>
        {error && <p className="error-text">{error}</p>}
      </div>

      {results.length > 0 && (
        <div className="search-results">
          <h3>Search results</h3>
          <div className="results-grid">
            {results.map((song) => (
              <div key={song.id} className="result-card">
                {song.artwork && (
                  <img src={song.artwork} alt={song.title} className="result-artwork" />
                )}
                <div className="result-info">
                  <span className="song-title">{song.title}</span>
                  <span className="song-artist">{song.artist}</span>
                </div>
                <button className="btn-add" onClick={() => handleAdd(song)}>
                  + Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {searched && results.length === 0 && (
        <p className="empty-message">No songs found. Try a different search.</p>
      )}

      <div className="playlist-songs">
        <h3>
          Songs in this playlist ({playlist.songs.length})
          {playlist.songs.length > 1 && (
            <span className="drag-hint"> — drag to reorder</span>
          )}
        </h3>

        {playlist.songs.length === 0 ? (
          <p className="empty-message">
            This playlist is empty. Search for songs above to add them!
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={playlist.songs.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="songs-list">
                {playlist.songs.map((song) => (
                  <SortableSongCard
                    key={song.id}
                    song={song}
                    onRemove={() => onRemoveSong(song.id)}
                    onToggleFavourite={() =>
                      onToggleFavourite(song.id, song.favourite)
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </main>
  );
}
