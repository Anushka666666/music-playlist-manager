-- Auth tables - runs automatically on first Docker startup

CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    username        VARCHAR(30) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE playlists ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE playlists DROP CONSTRAINT IF EXISTS playlists_name_key;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'playlists_user_name_unique'
  ) THEN
    ALTER TABLE playlists ADD CONSTRAINT playlists_user_name_unique UNIQUE (user_id, name);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON playlists(user_id);
