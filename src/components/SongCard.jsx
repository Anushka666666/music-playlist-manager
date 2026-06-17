import { useState, useRef } from 'react';

export default function SongCard({ song, onRemove, onToggleFavourite, dragHandleProps }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  function togglePlay() {
    if (!song.preview) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  }

  function handleEnded() {
    setPlaying(false);
  }

  return (
    <div className={`song-card ${song.favourite ? 'song-card--favourite' : ''}`}>
      {/* Drag handle */}
      <span className="drag-handle" {...dragHandleProps} title="Drag to reorder">
        ⠿
      </span>

      {song.artwork && (
        <img
          src={song.artwork}
          alt={`${song.title} artwork`}
          className="song-artwork"
        />
      )}

      {song.preview && (
        <button
          className="btn-play"
          onClick={togglePlay}
          title={playing ? 'Pause preview' : 'Play 30s preview'}
        >
          {playing ? '⏸' : '▶'}
        </button>
      )}

      <div className="song-info">
        <span className="song-title">{song.title}</span>
        <span className="song-artist">{song.artist}</span>
        {song.album && <span className="song-album">{song.album}</span>}
      </div>

      {/* Favourite button */}
      <button
        className={`btn-favourite ${song.favourite ? 'btn-favourite--active' : ''}`}
        onClick={onToggleFavourite}
        title={song.favourite ? 'Remove from favourites' : 'Add to favourites'}
      >
        {song.favourite ? '★' : '☆'}
      </button>

      <button className="btn-remove" onClick={onRemove} title="Remove song">
        ×
      </button>

      {song.preview && (
        <audio ref={audioRef} src={song.preview} onEnded={handleEnded} />
      )}
    </div>
  );
}
