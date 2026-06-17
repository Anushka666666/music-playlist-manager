import { Router } from 'express';
import pool from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// PATCH /api/songs/:id/favourite
router.patch('/:id/favourite', async (req, res) => {
  try {
    const { id } = req.params;
    const { favourite } = req.body;

    if (typeof favourite !== 'boolean')
      return res.status(400).json({ error: 'favourite must be a boolean.' });

    // Verify song belongs to a playlist owned by the user
    const ownerCheck = await pool.query(
      `SELECT s.id FROM songs s
       JOIN playlists p ON s.playlist_id = p.id
       WHERE s.id = $1 AND p.user_id = $2`,
      [id, req.userId]
    );

    if (ownerCheck.rows.length === 0)
      return res.status(404).json({ error: 'Song not found.' });

    const result = await pool.query(
      'UPDATE songs SET favourite = $1 WHERE id = $2 RETURNING id, favourite',
      [favourite, id]
    );

    res.json({ id: String(result.rows[0].id), favourite: result.rows[0].favourite });
  } catch (err) {
    console.error('Error toggling favourite:', err);
    res.status(500).json({ error: 'Failed to update favourite.' });
  }
});

export default router;
