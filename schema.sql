-- Music Playlist Manager - PostgreSQL Schema
-- This is the same schema used by the running application.
-- See server/setup.sql for the setup script.

CREATE TABLE IF NOT EXISTS playlists (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS songs (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(200) NOT NULL,
    artist      VARCHAR(200) NOT NULL,
    album       VARCHAR(200) DEFAULT '',
    artwork_url TEXT DEFAULT '',
    itunes_id   VARCHAR(50) DEFAULT '',
    playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    added_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_songs_playlist_id ON songs(playlist_id);

-- Example queries:

-- Get all playlists with song count
SELECT p.id, p.name, COUNT(s.id) AS song_count
FROM playlists p
LEFT JOIN songs s ON s.playlist_id = p.id
GROUP BY p.id, p.name
ORDER BY p.created_at DESC;

-- Get all songs in a playlist
SELECT s.title, s.artist, s.album
FROM songs s
WHERE s.playlist_id = 1
ORDER BY s.added_at;

-- Delete a song from a playlist
DELETE FROM songs WHERE id = 5 AND playlist_id = 1;
