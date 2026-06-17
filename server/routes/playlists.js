import { Router } from 'express';
import pool from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Apply authentication to all routes in this router
router.use(authenticate);

// GET /api/playlists — only the current user's playlists
router.get('/', async (req, res) => {
  try {
    const playlistResult = await pool.query(
      'SELECT id, name, created_at FROM playlists WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );

    const playlists = [];
    for (const row of playlistResult.rows) {
      const songResult = await pool.query(
        `SELECT id, title, artist, album, artwork_url, itunes_id, preview_url, favourite
         FROM songs WHERE playlist_id = $1
         ORDER BY position ASC, added_at ASC`,
        [row.id]
      );

      playlists.push({
        id: String(row.id),
        name: row.name,
        songs: songResult.rows.map((s) => ({
          id: String(s.id),
          title: s.title,
          artist: s.artist,
          album: s.album || '',
          artwork: s.artwork_url || '',
          itunesId: s.itunes_id || '',
          preview: s.preview_url || '',
          favourite: s.favourite || false,
        })),
      });
    }

    res.json(playlists);
  } catch (err) {
    console.error('Error fetching playlists:', err);
    res.status(500).json({ error: 'Failed to fetch playlists.' });
  }
});

// POST /api/playlists
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim())
      return res.status(400).json({ error: 'Playlist name cannot be empty.' });

    const trimmed = name.trim();
    if (trimmed.length > 50)
      return res.status(400).json({ error: 'Name must be 50 characters or less.' });

    // Duplicate check scoped to the user
    const existing = await pool.query(
      'SELECT id FROM playlists WHERE user_id = $1 AND LOWER(name) = LOWER($2)',
      [req.userId, trimmed]
    );
    if (existing.rows.length > 0)
      return res.status(409).json({ error: 'You already have a playlist with this name.' });

    const result = await pool.query(
      'INSERT INTO playlists (name, user_id) VALUES ($1, $2) RETURNING id, name',
      [trimmed, req.userId]
    );

    res.status(201).json({
      id: String(result.rows[0].id),
      name: result.rows[0].name,
      songs: [],
    });
  } catch (err) {
    console.error('Error creating playlist:', err);
    res.status(500).json({ error: 'Failed to create playlist.' });
  }
});

// DELETE /api/playlists/:id — must belong to user
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM playlists WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Playlist not found.' });
    res.json({ message: 'Playlist deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete playlist.' });
  }
});

// Helper to verify a playlist belongs to the user
async function userOwnsPlaylist(userId, playlistId) {
  const result = await pool.query(
    'SELECT id FROM playlists WHERE id = $1 AND user_id = $2',
    [playlistId, userId]
  );
  return result.rows.length > 0;
}

// POST /api/playlists/:id/songs
router.post('/:id/songs', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, artist, album, artwork, itunesId, preview } = req.body;

    if (!title || !title.trim())
      return res.status(400).json({ error: 'Song title is required.' });
    if (!artist || !artist.trim())
      return res.status(400).json({ error: 'Song artist is required.' });

    if (!(await userOwnsPlaylist(req.userId, id)))
      return res.status(404).json({ error: 'Playlist not found.' });

    if (itunesId) {
      const dupCheck = await pool.query(
        'SELECT id FROM songs WHERE playlist_id = $1 AND itunes_id = $2',
        [id, itunesId]
      );
      if (dupCheck.rows.length > 0)
        return res.status(409).json({ error: 'This song is already in the playlist.' });
    }

    const posResult = await pool.query(
      'SELECT COALESCE(MAX(position), 0) + 1 AS next_pos FROM songs WHERE playlist_id = $1', [id]
    );
    const position = posResult.rows[0].next_pos;

    const result = await pool.query(
      `INSERT INTO songs (title, artist, album, artwork_url, itunes_id, preview_url, playlist_id, position)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id, title, artist, album, artwork_url, itunes_id, preview_url, favourite`,
      [title.trim(), artist.trim(), album||'', artwork||'', itunesId||'', preview||'', id, position]
    );

    const s = result.rows[0];
    res.status(201).json({
      id: String(s.id), title: s.title, artist: s.artist,
      album: s.album||'', artwork: s.artwork_url||'',
      itunesId: s.itunes_id||'', preview: s.preview_url||'',
      favourite: s.favourite||false,
    });
  } catch (err) {
    console.error('Error adding song:', err);
    res.status(500).json({ error: 'Failed to add song.' });
  }
});

// PUT /api/playlists/:id/songs/reorder
router.put('/:id/songs/reorder', async (req, res) => {
  try {
    const { id } = req.params;
    const { songIds } = req.body;

    if (!Array.isArray(songIds) || songIds.length === 0)
      return res.status(400).json({ error: 'songIds must be a non-empty array.' });

    if (!(await userOwnsPlaylist(req.userId, id)))
      return res.status(404).json({ error: 'Playlist not found.' });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (let i = 0; i < songIds.length; i++) {
        await client.query(
          'UPDATE songs SET position = $1 WHERE id = $2 AND playlist_id = $3',
          [i + 1, songIds[i], id]
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    res.json({ message: 'Songs reordered.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reorder songs.' });
  }
});

// DELETE /api/playlists/:playlistId/songs/:songId
router.delete('/:playlistId/songs/:songId', async (req, res) => {
  try {
    const { playlistId, songId } = req.params;

    if (!(await userOwnsPlaylist(req.userId, playlistId)))
      return res.status(404).json({ error: 'Playlist not found.' });

    const result = await pool.query(
      'DELETE FROM songs WHERE id = $1 AND playlist_id = $2 RETURNING id',
      [songId, playlistId]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Song not found.' });
    res.json({ message: 'Song removed.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove song.' });
  }
});

export default router;
