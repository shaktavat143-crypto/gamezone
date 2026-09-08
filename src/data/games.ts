import { GameMetadata } from '../types.js';

export const AVAILABLE_GAMES: GameMetadata[] = [
  {
    id: 'word_battle',
    title: 'Word Battle',
    tagline: 'Race your friends to find the best words matching a letter & category.',
    minPlayers: 2,
    maxPlayers: 10,
    estimatedTime: '5–8 min',
    icon: '🔤',
    accentColor: '#EC4899',
    description: 'A random letter and 4 categories are selected each round. Score +10 for unique valid words, +5 for shared words!'
  },
  {
    id: 'secret_battle',
    title: 'Secret Battle',
    tagline: 'One player has a different secret word. Find the impostor!',
    minPlayers: 3,
    maxPlayers: 12,
    estimatedTime: '6–10 min',
    icon: '🕵️',
    accentColor: '#8B5CF6',
    description: 'Everyone gets the same secret word except ONE player. Give one clue, vote on the suspect, and let the impostor guess the majority word!'
  },
  {
    id: 'most_likely_to',
    title: 'Most Likely To',
    tagline: 'Who in the room fits the question best? Vote secretly & tally!',
    minPlayers: 3,
    maxPlayers: 20,
    estimatedTime: '4–8 min',
    icon: '🗳️',
    accentColor: '#3B82F6',
    description: 'A hilarious, safe question is revealed. Everyone votes for someone in the party. Points awarded for winning and voting with majority!'
  },
  {
    id: 'memory_battle',
    title: 'Memory Battle',
    tagline: '8 intense memory mini-games! No elimination, pure point frenzy.',
    minPlayers: 2,
    maxPlayers: 12,
    estimatedTime: '5–10 min',
    icon: '🧠',
    accentColor: '#10B981',
    description: 'Sequence memory, position memory, reverse recall, what’s missing, speed flash, and chaotic rounds with speed bonuses!'
  },
  {
    id: 'solah_chits',
    title: 'Solah Chits',
    tagline: 'Pass royal chits in a circle, complete 4 matching cards & slam BINGO!',
    minPlayers: 2,
    maxPlayers: 12,
    estimatedTime: '4–8 min',
    icon: '🃏',
    accentColor: '#F59E0B',
    description: 'Each player receives 4 chits. Pass chits in a circle to collect 4 of the same type (e.g. 4x Raja, 4x Rani). The first player to finish slams BINGO, triggering a high-speed reaction race for all players!'
  },
  {
    id: 'who_said_it',
    title: 'Who Said It?',
    tagline: 'Write secret answers, shuffle them, and guess who wrote each one!',
    minPlayers: 3,
    maxPlayers: 20,
    estimatedTime: '6–12 min',
    icon: '🎭',
    accentColor: '#06B6D4',
    description: 'Answer juicy prompts anonymously. Guess which friend wrote what and earn points for correct detective work and clever bluffs!'
  },
  {
    id: 'wordle',
    title: 'Wordle',
    tagline: 'Guess the hidden 5-letter word in 6 tries. Solo & multiplayer battle!',
    minPlayers: 1,
    maxPlayers: 20,
    estimatedTime: '3–6 min',
    icon: '🟩',
    accentColor: '#22C55E',
    description: 'Crack the secret 5-letter word! Green means right spot, yellow means wrong spot. Private boards during play, fewer guesses earn huge points!'
  }
];
