export default function StatsPage({ playlists }) {
  // Calculate stats
  const totalPlaylists = playlists.length;
  const totalSongs = playlists.reduce((sum, p) => sum + p.songs.length, 0);
  const totalFavourites = playlists.reduce(
    (sum, p) => sum + p.songs.filter((s) => s.favourite).length,
    0
  );

  // Most added artist across all playlists
  const artistCount = {};
  playlists.forEach((p) => {
    p.songs.forEach((s) => {
      if (s.artist) {
        artistCount[s.artist] = (artistCount[s.artist] || 0) + 1;
      }
    });
  });

  const topArtists = Object.entries(artistCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Playlist lengths sorted
  const playlistsBySize = [...playlists]
    .sort((a, b) => b.songs.length - a.songs.length)
    .slice(0, 5);

  if (totalPlaylists === 0) {
    return (
      <main className="stats-page">
        <h2>Stats</h2>
        <p className="empty-message">
          No data yet. Create some playlists and add songs to see your stats!
        </p>
      </main>
    );
  }

  return (
    <main className="stats-page">
      <h2>Your Stats</h2>

      {/* Summary cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-number">{totalPlaylists}</span>
          <span className="stat-label">Playlists</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{totalSongs}</span>
          <span className="stat-label">Total Songs</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{totalFavourites}</span>
          <span className="stat-label">Favourites</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {totalPlaylists > 0
              ? Math.round(totalSongs / totalPlaylists)
              : 0}
          </span>
          <span className="stat-label">Avg Songs/Playlist</span>
        </div>
      </div>

      <div className="stats-columns">
        {/* Top Artists */}
        {topArtists.length > 0 && (
          <div className="stats-section">
            <h3>Top Artists</h3>
            <ul className="stats-list">
              {topArtists.map(([artist, count], i) => (
                <li key={artist} className="stats-list-item">
                  <span className="stats-rank">#{i + 1}</span>
                  <span className="stats-name">{artist}</span>
                  <span className="stats-badge">
                    {count} {count === 1 ? 'song' : 'songs'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Biggest Playlists */}
        {playlistsBySize.length > 0 && (
          <div className="stats-section">
            <h3>Biggest Playlists</h3>
            <ul className="stats-list">
              {playlistsBySize.map((p, i) => (
                <li key={p.id} className="stats-list-item">
                  <span className="stats-rank">#{i + 1}</span>
                  <span className="stats-name">{p.name}</span>
                  <span className="stats-badge">
                    {p.songs.length} {p.songs.length === 1 ? 'song' : 'songs'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Favourite Songs */}
      {totalFavourites > 0 && (
        <div className="stats-section">
          <h3>⭐ Favourite Songs</h3>
          <ul className="stats-list">
            {playlists.flatMap((p) =>
              p.songs
                .filter((s) => s.favourite)
                .map((s) => (
                  <li key={`${p.id}-${s.id}`} className="stats-list-item">
                    {s.artwork && (
                      <img
                        src={s.artwork}
                        alt={s.title}
                        className="stats-artwork"
                      />
                    )}
                    <span className="stats-name">
                      {s.title}
                      <span className="stats-sub"> by {s.artist}</span>
                    </span>
                    <span className="stats-badge">{p.name}</span>
                  </li>
                ))
            )}
          </ul>
        </div>
      )}
    </main>
  );
}
