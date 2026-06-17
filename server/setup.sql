CREATE TABLE IF NOT EXISTS playlists (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS songs (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(200) NOT NULL,
    artist      VARCHAR(200) NOT NULL,
    album       VARCHAR(200) DEFAULT '',
    artwork_url TEXT DEFAULT '',
    itunes_id   VARCHAR(50) DEFAULT '',
    preview_url TEXT DEFAULT '',
    favourite   BOOLEAN DEFAULT FALSE,
    position    INTEGER DEFAULT 0,
    playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    added_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_songs_playlist_id ON songs(playlist_id);
