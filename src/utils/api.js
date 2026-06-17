// In Docker, nginx proxies /api/* to backend
// In dev, we talk directly to localhost:3001
const API_URL = import.meta.env.PROD
  ? '/api'
  : 'http://localhost:3001/api';

function getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

async function handleResponse(res) {
  if (res.status === 401) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_username');
    window.location.reload();
    return;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function fetchPlaylists() {
  const res = await fetch(`${API_URL}/playlists`, { headers: getAuthHeaders() });
  return handleResponse(res);
}

export async function createPlaylist(name) {
  const res = await fetch(`${API_URL}/playlists`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name }),
  });
  return handleResponse(res);
}

export async function deletePlaylist(id) {
  const res = await fetch(`${API_URL}/playlists/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export async function addSong(playlistId, song) {
  const res = await fetch(`${API_URL}/playlists/${playlistId}/songs`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      title: song.title,
      artist: song.artist,
      album: song.album,
      artwork: song.artwork,
      itunesId: song.itunesId || song.id,
      preview: song.preview,
    }),
  });
  return handleResponse(res);
}

export async function removeSong(playlistId, songId) {
  const res = await fetch(
    `${API_URL}/playlists/${playlistId}/songs/${songId}`,
    { method: 'DELETE', headers: getAuthHeaders() }
  );
  return handleResponse(res);
}

export async function reorderSongs(playlistId, songIds) {
  const res = await fetch(
    `${API_URL}/playlists/${playlistId}/songs/reorder`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ songIds }),
    }
  );
  return handleResponse(res);
}

export async function toggleFavourite(songId, favourite) {
  const res = await fetch(`${API_URL}/songs/${songId}/favourite`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ favourite }),
  });
  return handleResponse(res);
}
