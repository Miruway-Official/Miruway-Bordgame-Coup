// Persistent player ID stored in localStorage
export function getPlayerId(): string {
  if (typeof window === 'undefined') return 'server';
  let id = localStorage.getItem('coup_player_id');
  if (!id) {
    id = `player_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem('coup_player_id', id);
  }
  return id;
}

export function getPlayerName(): string {
  return localStorage.getItem('coup_player_name') || 'Player';
}

export function setPlayerName(name: string) {
  localStorage.setItem('coup_player_name', name);
}

// Generate a 6-char room code
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
