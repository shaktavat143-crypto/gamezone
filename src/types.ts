export type GameType =
  | 'word_battle'
  | 'secret_battle'
  | 'most_likely_to'
  | 'memory_battle'
  | 'number_guess'
  | 'who_said_it';

export type PartyStatus = 'lobby' | 'in_game' | 'round_reveal' | 'game_results';

export type ConnectionStatus = 'connected' | 'connecting' | 'reconnecting' | 'disconnected';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  color: string;
  isHost: boolean;
  isOnline: boolean;
  joinedAt: number;
  lastSeenAt: number;
  totalScore: number;
  gameScore: number;
  wins: number;
  sessionToken: string;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  playerAvatar: string;
  playerColor: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface GameMetadata {
  id: GameType;
  title: string;
  tagline: string;
  minPlayers: number;
  maxPlayers: number;
  estimatedTime: string;
  icon: string;
  accentColor: string;
  description: string;
}

export interface GameSettings {
  rounds: number;
  timeLimit: number; // in seconds
  difficulty: 'easy' | 'normal' | 'hard';
  categoryFilter?: string;
  gameSpecific?: Record<string, any>;
  customParam?: string | number | boolean;
}

// ----------------------------------------------------
// Specific Game State Definitions
// ----------------------------------------------------

// 1. WORD BATTLE
export interface WordBattleRoundData {
  letter: string;
  categories: string[];
  durationSeconds: number;
  submissions: Record<string, Record<string, string>>; // playerId -> categoryIndex/name -> word
  validatedResults?: Record<string, {
    scores: Record<string, number>; // category -> score
    totalRoundScore: number;
    words: Record<string, { word: string; valid: boolean; unique: boolean; points: number }>;
  }>;
}

// 2. SECRET BATTLE
export interface SecretBattleRoundData {
  category: string;
  majorityWord: string;
  secretWord: string;
  secretPlayerId: string;
  phase: 'clues' | 'voting' | 'reveal_guess' | 'scores';
  clues: Record<string, string>; // playerId -> clue text
  votes: Record<string, string>; // voterId -> targetPlayerId
  impostorGuess?: string; // Guess submitted by impostor
  impostorGuessCorrect?: boolean;
  roundScoreSummary?: Record<string, { points: number; reason: string }>;
}

// 3. MOST LIKELY TO
export interface MostLikelyToRoundData {
  questionId: string;
  questionText: string;
  category: string;
  votes: Record<string, string>; // voterId -> targetPlayerId
  results?: {
    voteCounts: Record<string, number>; // playerId -> vote count
    winners: string[]; // playerIds with highest votes
    pointsEarned: Record<string, number>;
  };
}

// 4. MEMORY BATTLE
export type MemoryChallengeType =
  | 'sequence'
  | 'position'
  | 'number_match'
  | 'reverse_sequence'
  | 'whats_missing'
  | 'speed_flash'
  | 'what_changed'
  | 'chaos_round';

export interface MemoryChallenge {
  challengeType: MemoryChallengeType;
  title: string;
  instruction: string;
  memorizeDurationSeconds: number;
  answerDurationSeconds: number;
  // Payload shown during memorize phase
  displayItems: string[];
  gridItems?: (string | null)[];
  numberPairs?: { symbol: string; num: number }[];
  // Question asked during answer phase
  questionPrompt: string;
  options?: string[];
  correctAnswer: string | string[];
  playerSpecificChaos?: Record<string, {
    prompt: string;
    options: string[];
    correctAnswer: string;
  }>;
}

export interface MemoryBattleRoundData {
  challenge: MemoryChallenge;
  phase: 'memorize' | 'answer' | 'reveal';
  submissions: Record<string, {
    answer: any;
    timeTakenMs: number;
    isCorrect?: boolean;
    pointsEarned?: number;
  }>;
}

// 5. NUMBER GUESS
export interface NumberGuessRoundData {
  min: number;
  max: number;
  targetNumber: number;
  currentRange: [number, number];
  guesses: Array<{
    id: string;
    playerId: string;
    playerName: string;
    playerColor: string;
    guess: number;
    result: 'HIGHER' | 'LOWER' | 'CORRECT';
    timestamp: number;
  }>;
  winnerPlayerId?: string;
  roundWinnerPoints?: Record<string, number>;
}

// 6. WHO SAID IT?
export interface WhoSaidItRoundData {
  promptId: string;
  promptText: string;
  category: string;
  phase: 'writing' | 'guessing' | 'reveal';
  submissions: Record<string, string>; // playerId -> answerText
  anonymizedAnswers: Array<{ id: string; text: string }>;
  guesses: Record<string, Record<string, string>>; // guesserPlayerId -> answerId -> guessedPlayerId
  roundScores?: Record<string, { points: number; correctGuesses: number; fooledOthers: number }>;
}

export type AnyGameRoundData =
  | WordBattleRoundData
  | SecretBattleRoundData
  | MostLikelyToRoundData
  | MemoryBattleRoundData
  | NumberGuessRoundData
  | WhoSaidItRoundData;

export interface GameResultItem {
  playerId: string;
  playerName: string;
  playerAvatar: string;
  playerColor: string;
  score: number;
  rank: number;
  previousTotalScore: number;
  newTotalScore: number;
}

export interface Party {
  id: string;
  code: string;
  name: string;
  hostId: string;
  isLocked: boolean;
  createdAt: number;
  lastActivityAt: number;
  players: Record<string, Player>;
  chatMessages: ChatMessage[];
  currentGame: GameType | null;
  gameStatus: PartyStatus;
  gameSettings: GameSettings;
  currentRound: number;
  totalRounds: number;
  roundTimeRemaining: number;
  gameState: AnyGameRoundData | null;
  gameResults: GameResultItem[] | null;
  overallScoreboard: Array<{
    playerId: string;
    playerName: string;
    playerAvatar: string;
    playerColor: string;
    totalScore: number;
    wins: number;
    isOnline: boolean;
  }>;
}

// Client sanitized Party View (e.g. hiding secret impostor word from other players)
export interface ClientPartyView extends Omit<Party, 'gameState'> {
  gameState: any;
  myPlayerId: string;
  isHost: boolean;
  privatePlayerData?: any; // e.g. private role/secret word
}

// Client-to-Server WS messages
export type ClientWsMessage =
  | { type: 'create_party'; payload: { playerName: string; partyName: string; avatar?: string } }
  | { type: 'join_party'; payload: { partyCode: string; playerName: string; avatar?: string } }
  | { type: 'rejoin_party'; payload: { partyCode: string; playerName?: string; sessionToken?: string; playerId?: string } }
  | { type: 'reconnect'; payload: { partyCode: string; playerId: string; sessionToken: string } }
  | { type: 'update_avatar'; payload: { avatar: string } }
  | { type: 'send_chat'; payload: { text: string } }
  | { type: 'select_game'; payload: { gameType: GameType } }
  | { type: 'update_game_settings'; payload: { settings: Partial<GameSettings> } }
  | { type: 'start_game'; payload?: {} }
  | { type: 'game_action'; payload: { action: string; data: any } }
  | { type: 'next_round'; payload?: {} }
  | { type: 'end_game'; payload?: {} }
  | { type: 'restart_game'; payload?: {} }
  | { type: 'return_to_lobby'; payload?: {} }
  | { type: 'toggle_lock'; payload?: {} }
  | { type: 'kick_player'; payload: { targetPlayerId: string } }
  | { type: 'leave_party'; payload?: {} }
  | { type: 'ping'; payload?: {} };

// Server-to-Client WS messages
export type ServerWsMessage =
  | { type: 'party_state'; payload: { party: ClientPartyView; sessionToken: string; reconnectData?: { gameName: string; round: number; totalRounds: number } } }
  | { type: 'error'; payload: { code: string; message: string } }
  | { type: 'chat_message'; payload: { message: ChatMessage } }
  | { type: 'player_notification'; payload: { text: string; type: 'join' | 'leave' | 'reconnect' | 'host' | 'info' } }
  | { type: 'game_tick'; payload: { roundTimeRemaining: number } }
  | { type: 'round_ended'; payload: { roundResults: any; nextRoundIn?: number } }
  | { type: 'game_ended'; payload: { gameResults: GameResultItem[] } }
  | { type: 'pong'; payload?: {} };
