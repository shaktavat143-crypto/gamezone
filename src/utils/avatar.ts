// Avatar utility with curated options & username-based avatar generators

export const DEFAULT_AVATARS = [
  '🎮', '🦊', '⚡', '🚀', '🔥', '👑', '💎', '🐯',
  '🌟', '🦄', '🎯', '👾', '🦁', '🐼', '🤖', '🥷',
  '🐉', '🧙‍♂️', '🎸', '🕹️', '🏆', '🍕', '💣', '🐱'
];

export const AVATAR_COLOR_PALETTES = [
  { bg: '#8B5CF6', text: '#FFFFFF', border: '#A78BFA', name: 'Violet' },
  { bg: '#EC4899', text: '#FFFFFF', border: '#F472B6', name: 'Pink' },
  { bg: '#3B82F6', text: '#FFFFFF', border: '#60A5FA', name: 'Blue' },
  { bg: '#10B981', text: '#FFFFFF', border: '#34D399', name: 'Emerald' },
  { bg: '#F59E0B', text: '#FFFFFF', border: '#FBBF24', name: 'Amber' },
  { bg: '#06B6D4', text: '#FFFFFF', border: '#22D3EE', name: 'Cyan' },
  { bg: '#EF4444', text: '#FFFFFF', border: '#F87171', name: 'Rose' },
  { bg: '#6366F1', text: '#FFFFFF', border: '#818CF8', name: 'Indigo' }
];

/**
 * Generate a deterministic avatar based on the username hash
 */
export function generateAvatarFromUsername(username: string): string {
  if (!username || !username.trim()) return DEFAULT_AVATARS[0];
  
  let hash = 0;
  const clean = username.trim().toLowerCase();
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % DEFAULT_AVATARS.length;
  return DEFAULT_AVATARS[index];
}

/**
 * Generate player color palette based on username or ID hash
 */
export function getPlayerColorFromId(id: string): string {
  if (!id) return AVATAR_COLOR_PALETTES[0].bg;
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % AVATAR_COLOR_PALETTES.length;
  return AVATAR_COLOR_PALETTES[index].bg;
}
