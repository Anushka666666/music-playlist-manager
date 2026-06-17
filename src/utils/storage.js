const STORAGE_KEY = 'music-playlist-manager';

export function loadPlaylists() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function savePlaylists(playlists) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
  } catch (error) {
    console.error('Failed to save playlists:', error);
  }
}
