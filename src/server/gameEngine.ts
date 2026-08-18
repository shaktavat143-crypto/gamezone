import {
  GameType,
  Party,
  GameSettings,
  WordBattleRoundData,
  SecretBattleRoundData,
  MostLikelyToRoundData,
  MemoryBattleRoundData,
  NumberGuessRoundData,
  WhoSaidItRoundData,
  MemoryChallenge,
  MemoryChallengeType,
  GameResultItem
} from '../types.js';
import {
  WORD_BATTLE_CATEGORIES,
  WORD_BATTLE_LETTERS,
  SECRET_BATTLE_PAIRS,
  MOST_LIKELY_TO_QUESTIONS,
  WHO_SAID_IT_PROMPTS,
  MEMORY_ICONS,
  MEMORY_COLORS
} from './gameData.js';

export class GameEngine {
  /**
   * Helper to pick N random distinct items from an array
   */
  private static pickRandom<T>(arr: T[], count: number = 1): T[] {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Initialize a new game session
   */
  public static initGame(party: Party, gameType: GameType, settings: GameSettings): void {
    party.currentGame = gameType;
    party.gameStatus = 'in_game';
    party.gameSettings = settings;
    party.currentRound = 1;
    party.totalRounds = settings.rounds || 3;
    party.gameResults = null;

    // Reset current game score for all players
    Object.values(party.players).forEach(p => {
      p.gameScore = 0;
    });

    this.startRound(party);
  }

  /**
   * Start or setup the current round for the active game
   */
  public static startRound(party: Party): void {
    if (!party.currentGame) return;

    party.gameStatus = 'in_game';

    switch (party.currentGame) {
      case 'word_battle': {
        const letter = this.pickRandom(WORD_BATTLE_LETTERS, 1)[0];
        const categoryCount = party.gameSettings.customParam === 6 ? 6 : 4;
        const categories = this.pickRandom(WORD_BATTLE_CATEGORIES, categoryCount);
        const duration = party.gameSettings.timeLimit || 45;

        const roundData: WordBattleRoundData = {
          letter,
          categories,
          durationSeconds: duration,
          submissions: {}
        };
        party.gameState = roundData;
        party.roundTimeRemaining = duration;
        break;
      }

      case 'secret_battle': {
        const pair = this.pickRandom(SECRET_BATTLE_PAIRS, 1)[0];
        const playerIds = Object.keys(party.players).filter(id => party.players[id].isOnline);
        const activeIds = playerIds.length > 0 ? playerIds : Object.keys(party.players);
        const secretPlayerId = this.pickRandom(activeIds, 1)[0] || activeIds[0];
        const clueDuration = party.gameSettings.timeLimit || 45;

        const roundData: SecretBattleRoundData = {
          category: pair.category,
          majorityWord: pair.majority,
          secretWord: pair.secret,
          secretPlayerId,
          phase: 'clues',
          clues: {},
          votes: {}
        };
        party.gameState = roundData;
        party.roundTimeRemaining = clueDuration;
        break;
      }

      case 'most_likely_to': {
        const question = this.pickRandom(MOST_LIKELY_TO_QUESTIONS, 1)[0];
        const roundData: MostLikelyToRoundData = {
          questionId: `${question.id}_${Date.now()}`,
          questionText: question.text,
          category: question.category,
          votes: {}
        };
        party.gameState = roundData;
        party.roundTimeRemaining = party.gameSettings.timeLimit || 25;
        break;
      }

      case 'memory_battle': {
        const challenge = this.generateMemoryChallenge(party);
        const roundData: MemoryBattleRoundData = {
          challenge,
          phase: 'memorize',
          submissions: {}
        };
        party.gameState = roundData;
        party.roundTimeRemaining = challenge.memorizeDurationSeconds;
        break;
      }

      case 'number_guess': {
        let max = 100;
        if (party.gameSettings.difficulty === 'easy') max = 50;
        if (party.gameSettings.difficulty === 'hard') max = 1000;

        const targetNumber = Math.floor(Math.random() * max) + 1;
        const roundData: NumberGuessRoundData = {
          min: 1,
          max,
          targetNumber,
          currentRange: [1, max],
          guesses: []
        };
        party.gameState = roundData;
        party.roundTimeRemaining = party.gameSettings.timeLimit || 60;
        break;
      }

      case 'who_said_it': {
        const prompt = this.pickRandom(WHO_SAID_IT_PROMPTS, 1)[0];
        const roundData: WhoSaidItRoundData = {
          promptId: `${prompt.id}_${Date.now()}`,
          promptText: prompt.text,
          category: prompt.category,
          phase: 'writing',
          submissions: {},
          anonymizedAnswers: [],
          guesses: {}
        };
        party.gameState = roundData;
        party.roundTimeRemaining = party.gameSettings.timeLimit || 40;
        break;
      }
    }
  }

  /**
   * Generate diverse Memory Battle Challenges
   */
  private static generateMemoryChallenge(party: Party): MemoryChallenge {
    const types: MemoryChallengeType[] = [
      'sequence',
      'position',
      'number_match',
      'reverse_sequence',
      'whats_missing',
      'speed_flash',
      'what_changed',
      'chaos_round'
    ];

    // Cycle or randomly pick challenge type based on round
    const challengeType = types[(party.currentRound - 1) % types.length];

    switch (challengeType) {
      case 'sequence': {
        const items = this.pickRandom(MEMORY_COLORS, 5);
        return {
          challengeType: 'sequence',
          title: 'Sequence Memory',
          instruction: 'Memorize the exact order of the colors!',
          memorizeDurationSeconds: 4,
          answerDurationSeconds: 15,
          displayItems: items,
          questionPrompt: 'Recreate the exact sequence of colors:',
          correctAnswer: items,
          options: MEMORY_COLORS.slice(0, 6)
        };
      }

      case 'position': {
        const targetColor = '🟥';
        const gridItems = new Array(9).fill(null);
        const pos = Math.floor(Math.random() * 9);
        gridItems[pos] = targetColor;
        // add 2 other decoy items
        const decoys = ['🟦', '🟩', '🟨'];
        for (let i = 0; i < 9; i++) {
          if (i !== pos && Math.random() > 0.6 && decoys.length > 0) {
            gridItems[i] = decoys.pop()!;
          }
        }

        return {
          challengeType: 'position',
          title: 'Position Memory',
          instruction: `Watch where ${targetColor} is placed on the 3x3 grid!`,
          memorizeDurationSeconds: 4,
          answerDurationSeconds: 12,
          displayItems: [],
          gridItems,
          questionPrompt: `Which tile contained ${targetColor}?`,
          correctAnswer: String(pos),
          options: ['0', '1', '2', '3', '4', '5', '6', '7', '8']
        };
      }

      case 'number_match': {
        const colors = this.pickRandom(MEMORY_COLORS, 4);
        const pairs = colors.map(c => ({
          symbol: c,
          num: Math.floor(Math.random() * 9) + 1
        }));
        const targetPair = pairs[Math.floor(Math.random() * pairs.length)];

        return {
          challengeType: 'number_match',
          title: 'Number Memory',
          instruction: 'Memorize the number paired with each color!',
          memorizeDurationSeconds: 5,
          answerDurationSeconds: 12,
          displayItems: [],
          numberPairs: pairs,
          questionPrompt: `What number was paired with ${targetPair.symbol}?`,
          correctAnswer: String(targetPair.num),
          options: ['1', '2', '3', '4', '5', '6', '7', '8', '9']
        };
      }

      case 'reverse_sequence': {
        const nums = Array.from({ length: 5 }, () => Math.floor(Math.random() * 9) + 1);
        const reverseStr = [...nums].reverse().map(String);
        return {
          challengeType: 'reverse_sequence',
          title: 'Reverse Memory',
          instruction: 'Memorize these numbers and prepare to enter them IN REVERSE!',
          memorizeDurationSeconds: 4,
          answerDurationSeconds: 15,
          displayItems: nums.map(String),
          questionPrompt: 'Enter the sequence in REVERSE order:',
          correctAnswer: reverseStr,
          options: ['1', '2', '3', '4', '5', '6', '7', '8', '9']
        };
      }

      case 'whats_missing': {
        const pool = this.pickRandom(MEMORY_ICONS, 6);
        const missingIndex = Math.floor(Math.random() * pool.length);
        const missingItem = pool[missingIndex];
        const remaining = pool.filter((_, idx) => idx !== missingIndex);

        return {
          challengeType: 'whats_missing',
          title: "What's Missing?",
          instruction: 'Memorize all 6 items shown on the screen!',
          memorizeDurationSeconds: 5,
          answerDurationSeconds: 12,
          displayItems: pool,
          questionPrompt: 'Which item from the original set is missing?',
          correctAnswer: missingItem,
          options: pool
        };
      }

      case 'speed_flash': {
        const icons = this.pickRandom(MEMORY_ICONS, 4);
        const target = icons[Math.floor(Math.random() * icons.length)];
        const targetPos = icons.indexOf(target) + 1;

        return {
          challengeType: 'speed_flash',
          title: 'Speed Memory',
          instruction: 'Quick flash! Notice every item and its position.',
          memorizeDurationSeconds: 3,
          answerDurationSeconds: 10,
          displayItems: icons,
          questionPrompt: `What item was in Position #${targetPos}?`,
          correctAnswer: target,
          options: icons
        };
      }

      case 'what_changed': {
        const original = this.pickRandom(MEMORY_ICONS, 5);
        const changedIdx = Math.floor(Math.random() * original.length);
        const unusedIcons = MEMORY_ICONS.filter(i => !original.includes(i));
        const newItem = this.pickRandom(unusedIcons, 1)[0] || '⭐';

        return {
          challengeType: 'what_changed',
          title: 'What Changed?',
          instruction: 'Memorize this 5-item row carefully!',
          memorizeDurationSeconds: 4,
          answerDurationSeconds: 12,
          displayItems: original,
          questionPrompt: 'In the updated row, which new item was swapped in?',
          correctAnswer: newItem,
          options: [...original.slice(0, 3), newItem].sort(() => 0.5 - Math.random())
        };
      }

      case 'chaos_round':
      default: {
        const items = this.pickRandom(MEMORY_ICONS, 5);
        const playerIds = Object.keys(party.players);
        const playerChaos: Record<string, { prompt: string; options: string[]; correctAnswer: string }> = {};

        playerIds.forEach((pid, idx) => {
          if (idx % 3 === 0) {
            playerChaos[pid] = {
              prompt: 'What was the FIRST item?',
              options: items,
              correctAnswer: items[0]
            };
          } else if (idx % 3 === 1) {
            playerChaos[pid] = {
              prompt: 'What was the LAST item?',
              options: items,
              correctAnswer: items[items.length - 1]
            };
          } else {
            playerChaos[pid] = {
              prompt: 'What was the MIDDLE item?',
              options: items,
              correctAnswer: items[2]
            };
          }
        });

        return {
          challengeType: 'chaos_round',
          title: 'Chaos Round ⚡',
          instruction: 'Everyone sees the same sequence, but will receive a DIFFERENT question!',
          memorizeDurationSeconds: 4,
          answerDurationSeconds: 12,
          displayItems: items,
          questionPrompt: 'Answer your custom chaos question:',
          correctAnswer: items[0],
          playerSpecificChaos: playerChaos,
          options: items
        };
      }
    }
  }

  /**
   * Handle game action from player
   */
  public static handleAction(party: Party, playerId: string, action: string, data: any): boolean {
    if (!party.currentGame || party.gameStatus !== 'in_game') return false;

    switch (party.currentGame) {
      case 'word_battle': {
        const state = party.gameState as WordBattleRoundData;
        if (action === 'submit_words') {
          // data = { words: Record<categoryIndex, string> }
          state.submissions[playerId] = data.words || {};
          return true;
        }
        break;
      }

      case 'secret_battle': {
        const state = party.gameState as SecretBattleRoundData;
        if (action === 'submit_clue' && state.phase === 'clues') {
          state.clues[playerId] = (data.clue || '').trim();
          // If all active players submitted clues, advance to voting
          const activePlayers = Object.keys(party.players).filter(id => party.players[id].isOnline);
          const allSubmitted = activePlayers.every(id => state.clues[id] && state.clues[id].length > 0);
          if (allSubmitted && activePlayers.length > 0) {
            state.phase = 'voting';
            party.roundTimeRemaining = 30;
          }
          return true;
        } else if (action === 'submit_vote' && state.phase === 'voting') {
          state.votes[playerId] = data.targetPlayerId;
          const activePlayers = Object.keys(party.players).filter(id => party.players[id].isOnline);
          const allVoted = activePlayers.every(id => state.votes[id]);
          if (allVoted && activePlayers.length > 0) {
            this.evaluateSecretBattleVotes(party, state);
          }
          return true;
        } else if (action === 'impostor_guess' && state.phase === 'reveal_guess') {
          if (playerId === state.secretPlayerId) {
            state.impostorGuess = (data.guess || '').trim().toUpperCase();
            state.impostorGuessCorrect =
              state.impostorGuess === state.majorityWord.toUpperCase() ||
              state.majorityWord.toUpperCase().includes(state.impostorGuess);
            this.finalizeSecretBattleRound(party, state);
            return true;
          }
        }
        break;
      }

      case 'most_likely_to': {
        const state = party.gameState as MostLikelyToRoundData;
        if (action === 'submit_vote') {
          state.votes[playerId] = data.targetPlayerId;
          const activePlayers = Object.keys(party.players).filter(id => party.players[id].isOnline);
          const allVoted = activePlayers.every(id => state.votes[id]);
          if (allVoted && activePlayers.length > 0) {
            this.evaluateMostLikelyTo(party, state);
          }
          return true;
        }
        break;
      }

      case 'memory_battle': {
        const state = party.gameState as MemoryBattleRoundData;
        if (action === 'submit_answer' && state.phase === 'answer') {
          state.submissions[playerId] = {
            answer: data.answer,
            timeTakenMs: data.timeTakenMs || 5000
          };
          const activePlayers = Object.keys(party.players).filter(id => party.players[id].isOnline);
          const allAnswered = activePlayers.every(id => state.submissions[id]);
          if (allAnswered && activePlayers.length > 0) {
            this.evaluateMemoryBattle(party, state);
          }
          return true;
        }
        break;
      }

      case 'number_guess': {
        const state = party.gameState as NumberGuessRoundData;
        if (action === 'submit_guess') {
          const guessNum = parseInt(data.guess, 10);
          if (isNaN(guessNum) || guessNum < state.min || guessNum > state.max) return false;

          let result: 'HIGHER' | 'LOWER' | 'CORRECT' = 'CORRECT';
          if (guessNum < state.targetNumber) {
            result = 'HIGHER';
            if (guessNum >= state.currentRange[0]) {
              state.currentRange[0] = guessNum + 1;
            }
          } else if (guessNum > state.targetNumber) {
            result = 'LOWER';
            if (guessNum <= state.currentRange[1]) {
              state.currentRange[1] = guessNum - 1;
            }
          } else {
            result = 'CORRECT';
            state.winnerPlayerId = playerId;
          }

          const player = party.players[playerId];
          state.guesses.unshift({
            id: `g_${Date.now()}_${Math.random()}`,
            playerId,
            playerName: player ? player.name : 'Player',
            playerColor: player ? player.color : '#3B82F6',
            guess: guessNum,
            result,
            timestamp: Date.now()
          });

          if (result === 'CORRECT') {
            this.finalizeNumberGuessRound(party, state, playerId);
          }
          return true;
        }
        break;
      }

      case 'who_said_it': {
        const state = party.gameState as WhoSaidItRoundData;
        if (action === 'submit_answer' && state.phase === 'writing') {
          state.submissions[playerId] = (data.answer || '').trim();
          const activePlayers = Object.keys(party.players).filter(id => party.players[id].isOnline);
          const allSubmitted = activePlayers.every(id => state.submissions[id] && state.submissions[id].length > 0);
          if (allSubmitted && activePlayers.length > 0) {
            // Anonymize and prepare guessing phase
            state.anonymizedAnswers = Object.entries(state.submissions).map(([pid, text], index) => ({
              id: `ans_${index + 1}`,
              text
            })).sort(() => 0.5 - Math.random());
            state.phase = 'guessing';
            party.roundTimeRemaining = 40;
          }
          return true;
        } else if (action === 'submit_guesses' && state.phase === 'guessing') {
          // data = { guesses: Record<answerId, guessedPlayerId> }
          state.guesses[playerId] = data.guesses || {};
          const activePlayers = Object.keys(party.players).filter(id => party.players[id].isOnline);
          const allGuessed = activePlayers.every(id => state.guesses[id] && Object.keys(state.guesses[id]).length > 0);
          if (allGuessed && activePlayers.length > 0) {
            this.evaluateWhoSaidIt(party, state);
          }
          return true;
        }
        break;
      }
    }

    return false;
  }

  /**
   * Handle timer ticks (called every second by server)
   */
  public static handleTick(party: Party): void {
    if (party.gameStatus !== 'in_game') return;

    if (party.roundTimeRemaining > 0) {
      party.roundTimeRemaining--;
    }

    if (party.roundTimeRemaining <= 0) {
      this.handleRoundTimeout(party);
    }
  }

  /**
   * Handle when the timer for a round phase expires
   */
  public static handleRoundTimeout(party: Party): void {
    if (!party.currentGame) return;

    switch (party.currentGame) {
      case 'word_battle': {
        this.evaluateWordBattle(party, party.gameState as WordBattleRoundData);
        break;
      }

      case 'secret_battle': {
        const state = party.gameState as SecretBattleRoundData;
        if (state.phase === 'clues') {
          state.phase = 'voting';
          party.roundTimeRemaining = 30;
        } else if (state.phase === 'voting') {
          this.evaluateSecretBattleVotes(party, state);
        } else if (state.phase === 'reveal_guess') {
          this.finalizeSecretBattleRound(party, state);
        }
        break;
      }

      case 'most_likely_to': {
        this.evaluateMostLikelyTo(party, party.gameState as MostLikelyToRoundData);
        break;
      }

      case 'memory_battle': {
        const state = party.gameState as MemoryBattleRoundData;
        if (state.phase === 'memorize') {
          state.phase = 'answer';
          party.roundTimeRemaining = state.challenge.answerDurationSeconds;
        } else if (state.phase === 'answer') {
          this.evaluateMemoryBattle(party, state);
        }
        break;
      }

      case 'number_guess': {
        this.finalizeNumberGuessRound(party, party.gameState as NumberGuessRoundData, undefined);
        break;
      }

      case 'who_said_it': {
        const state = party.gameState as WhoSaidItRoundData;
        if (state.phase === 'writing') {
          // Fill default for missing players
          Object.keys(party.players).forEach(pid => {
            if (!state.submissions[pid]) {
              state.submissions[pid] = 'No answer submitted';
            }
          });
          state.anonymizedAnswers = Object.entries(state.submissions).map(([pid, text], index) => ({
            id: `ans_${index + 1}`,
            text
          })).sort(() => 0.5 - Math.random());
          state.phase = 'guessing';
          party.roundTimeRemaining = 40;
        } else if (state.phase === 'guessing') {
          this.evaluateWhoSaidIt(party, state);
        }
        break;
      }
    }
  }

  // ----------------------------------------------------
  // Evaluation & Scoring Logic
  // ----------------------------------------------------

  private static evaluateWordBattle(party: Party, state: WordBattleRoundData): void {
    party.gameStatus = 'round_reveal';
    const letter = state.letter.toUpperCase();
    const validatedResults: WordBattleRoundData['validatedResults'] = {};

    // Group words by category to find uniqueness
    const categoryWords: Record<string, Record<string, string[]>> = {}; // category -> cleanWord -> playerIds[]
    state.categories.forEach(cat => {
      categoryWords[cat] = {};
    });

    Object.entries(state.submissions).forEach(([playerId, userWords]) => {
      state.categories.forEach((cat, idx) => {
        const rawWord = (userWords[idx] || userWords[cat] || '').trim();
        if (rawWord.length > 0 && rawWord.toUpperCase().startsWith(letter)) {
          const clean = rawWord.toLowerCase();
          if (!categoryWords[cat][clean]) {
            categoryWords[cat][clean] = [];
          }
          categoryWords[cat][clean].push(playerId);
        }
      });
    });

    Object.keys(party.players).forEach(playerId => {
      const userWords = state.submissions[playerId] || {};
      const wordsMap: Record<string, { word: string; valid: boolean; unique: boolean; points: number }> = {};
      const scores: Record<string, number> = {};
      let totalRoundScore = 0;

      state.categories.forEach((cat, idx) => {
        const rawWord = (userWords[idx] || userWords[cat] || '').trim();
        let valid = false;
        let unique = false;
        let points = 0;

        if (rawWord.length > 0 && rawWord.toUpperCase().startsWith(letter)) {
          valid = true;
          const clean = rawWord.toLowerCase();
          const playersWithSameWord = categoryWords[cat][clean] || [];
          if (playersWithSameWord.length === 1) {
            unique = true;
            points = 10; // Unique correct word +10
          } else {
            unique = false;
            points = 5; // Shared correct word +5
          }
        }

        wordsMap[cat] = { word: rawWord || '—', valid, unique, points };
        scores[cat] = points;
        totalRoundScore += points;
      });

      validatedResults[playerId] = { scores, totalRoundScore, words: wordsMap };

      if (party.players[playerId]) {
        party.players[playerId].gameScore += totalRoundScore;
        party.players[playerId].totalScore += totalRoundScore;
      }
    });

    state.validatedResults = validatedResults;
  }

  private static evaluateSecretBattleVotes(party: Party, state: SecretBattleRoundData): void {
    // Tally votes
    const voteCounts: Record<string, number> = {};
    Object.values(state.votes).forEach(targetId => {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    });

    // Find highest voted player
    let maxVotes = 0;
    let mostVotedId: string | null = null;
    Object.entries(voteCounts).forEach(([pid, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        mostVotedId = pid;
      }
    });

    const impostorFound = mostVotedId === state.secretPlayerId;

    if (impostorFound) {
      // Impostor gets 20s to guess majority word!
      state.phase = 'reveal_guess';
      party.roundTimeRemaining = 20;
    } else {
      // Impostor escaped undetected
      this.finalizeSecretBattleRound(party, state);
    }
  }

  private static finalizeSecretBattleRound(party: Party, state: SecretBattleRoundData): void {
    party.gameStatus = 'round_reveal';
    state.phase = 'scores';
    const summaries: Record<string, { points: number; reason: string }> = {};

    const impostorId = state.secretPlayerId;
    const voteCounts: Record<string, number> = {};
    Object.values(state.votes).forEach(targetId => {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    });

    let maxVotes = 0;
    let mostVotedId: string | null = null;
    Object.entries(voteCounts).forEach(([pid, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        mostVotedId = pid;
      }
    });

    const impostorFound = mostVotedId === impostorId;

    Object.keys(party.players).forEach(playerId => {
      let points = 0;
      let reason = '';

      if (playerId === impostorId) {
        if (!impostorFound) {
          points = 200;
          reason = 'Blended in undetected! (+200)';
        } else if (state.impostorGuessCorrect) {
          points = 150;
          reason = `Discovered, but correctly guessed "${state.majorityWord}"! (+150)`;
        } else {
          points = 0;
          reason = 'Caught by majority vote.';
        }
      } else {
        const votedFor = state.votes[playerId];
        if (votedFor === impostorId) {
          points = 100;
          reason = 'Correctly identified the Secret Player! (+100)';
        } else {
          points = 0;
          reason = 'Voted for a regular player.';
        }
      }

      summaries[playerId] = { points, reason };
      if (party.players[playerId]) {
        party.players[playerId].gameScore += points;
        party.players[playerId].totalScore += points;
      }
    });

    state.roundScoreSummary = summaries;
  }

  private static evaluateMostLikelyTo(party: Party, state: MostLikelyToRoundData): void {
    party.gameStatus = 'round_reveal';
    const voteCounts: Record<string, number> = {};
    Object.values(state.votes).forEach(targetId => {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    });

    let maxVotes = 0;
    Object.values(voteCounts).forEach(count => {
      if (count > maxVotes) maxVotes = count;
    });

    const winners = Object.entries(voteCounts)
      .filter(([_, count]) => count === maxVotes && maxVotes > 0)
      .map(([pid]) => pid);

    const pointsEarned: Record<string, number> = {};

    Object.keys(party.players).forEach(pid => {
      let points = 0;
      // Points for winning the category
      if (winners.includes(pid)) {
        points += 100;
      }
      // Points for voting with majority
      const myVote = state.votes[pid];
      if (myVote && winners.includes(myVote)) {
        points += 50;
      }

      pointsEarned[pid] = points;
      if (party.players[pid]) {
        party.players[pid].gameScore += points;
        party.players[pid].totalScore += points;
      }
    });

    state.results = { voteCounts, winners, pointsEarned };
  }

  private static evaluateMemoryBattle(party: Party, state: MemoryBattleRoundData): void {
    party.gameStatus = 'round_reveal';
    state.phase = 'reveal';
    const challenge = state.challenge;

    Object.keys(party.players).forEach(playerId => {
      const submission = state.submissions[playerId];
      let isCorrect = false;
      let points = 0;

      if (submission) {
        let expectedAnswer = challenge.correctAnswer;
        if (challenge.challengeType === 'chaos_round' && challenge.playerSpecificChaos && challenge.playerSpecificChaos[playerId]) {
          expectedAnswer = challenge.playerSpecificChaos[playerId].correctAnswer;
        }

        if (Array.isArray(expectedAnswer)) {
          if (Array.isArray(submission.answer)) {
            isCorrect =
              submission.answer.length === expectedAnswer.length &&
              submission.answer.every((val, idx) => String(val) === String(expectedAnswer[idx]));
          }
        } else {
          isCorrect = String(submission.answer).trim().toLowerCase() === String(expectedAnswer).trim().toLowerCase();
        }

        if (isCorrect) {
          const speedBonus = Math.max(0, Math.floor((15000 - submission.timeTakenMs) / 200));
          const basePoints = challenge.challengeType === 'reverse_sequence' ? 150 : 100;
          points = basePoints + speedBonus;
        }

        submission.isCorrect = isCorrect;
        submission.pointsEarned = points;
      } else {
        state.submissions[playerId] = {
          answer: null,
          timeTakenMs: 0,
          isCorrect: false,
          pointsEarned: 0
        };
      }

      if (party.players[playerId]) {
        party.players[playerId].gameScore += points;
        party.players[playerId].totalScore += points;
      }
    });
  }

  private static finalizeNumberGuessRound(party: Party, state: NumberGuessRoundData, winnerPlayerId?: string): void {
    party.gameStatus = 'round_reveal';
    state.winnerPlayerId = winnerPlayerId;
    const points: Record<string, number> = {};

    Object.keys(party.players).forEach(pid => {
      let pts = 0;
      if (pid === winnerPlayerId) {
        pts = 150;
      } else {
        // Find player's closest guess for proximity points
        const playerGuesses = state.guesses.filter(g => g.playerId === pid);
        if (playerGuesses.length > 0) {
          const minDiff = Math.min(...playerGuesses.map(g => Math.abs(g.guess - state.targetNumber)));
          if (minDiff <= 3) pts = 50;
          else if (minDiff <= 10) pts = 20;
        }
      }
      points[pid] = pts;
      if (party.players[pid]) {
        party.players[pid].gameScore += pts;
        party.players[pid].totalScore += pts;
      }
    });

    state.roundWinnerPoints = points;
  }

  private static evaluateWhoSaidIt(party: Party, state: WhoSaidItRoundData): void {
    party.gameStatus = 'round_reveal';
    state.phase = 'reveal';

    // Map answerId to original author playerId
    const answerAuthorMap: Record<string, string> = {};
    const submissionsList = Object.entries(state.submissions);
    state.anonymizedAnswers.forEach(item => {
      const match = submissionsList.find(([_, text]) => text === item.text);
      if (match) {
        answerAuthorMap[item.id] = match[0];
      }
    });

    const roundScores: Record<string, { points: number; correctGuesses: number; fooledOthers: number }> = {};

    Object.keys(party.players).forEach(pid => {
      let correctGuesses = 0;
      let fooledOthers = 0;

      // Check guesses made by pid
      const myGuesses = state.guesses[pid] || {};
      Object.entries(myGuesses).forEach(([ansId, guessedAuthorId]) => {
        const realAuthorId = answerAuthorMap[ansId];
        if (realAuthorId && realAuthorId === guessedAuthorId && realAuthorId !== pid) {
          correctGuesses++;
        }
      });

      // Check how many people guessed wrong for pid's answer
      const myAnswerId = Object.entries(answerAuthorMap).find(([_, authorId]) => authorId === pid)?.[0];
      if (myAnswerId) {
        Object.entries(state.guesses).forEach(([guesserId, theirGuesses]) => {
          if (guesserId !== pid) {
            const guessForMyAns = theirGuesses[myAnswerId];
            if (guessForMyAns && guessForMyAns !== pid) {
              fooledOthers++;
            }
          }
        });
      }

      const points = (correctGuesses * 100) + (fooledOthers * 50);
      roundScores[pid] = { points, correctGuesses, fooledOthers };

      if (party.players[pid]) {
        party.players[pid].gameScore += points;
        party.players[pid].totalScore += points;
      }
    });

    state.roundScores = roundScores;
  }

  /**
   * Advance to the next round or end the game
   */
  public static advanceGame(party: Party): void {
    if (!party.currentGame) return;

    if (party.currentRound < party.totalRounds) {
      party.currentRound++;
      this.startRound(party);
    } else {
      this.endGame(party);
    }
  }

  /**
   * End current game and calculate final standings & scoreboard
   */
  public static endGame(party: Party): void {
    party.gameStatus = 'game_results';

    const rankedPlayers = Object.values(party.players).sort((a, b) => b.gameScore - a.gameScore);

    const winner = rankedPlayers[0];
    if (winner && winner.gameScore > 0) {
      winner.wins = (winner.wins || 0) + 1;
    }

    const gameResults: GameResultItem[] = rankedPlayers.map((p, idx) => ({
      playerId: p.id,
      playerName: p.name,
      playerAvatar: p.avatar,
      playerColor: p.color,
      score: p.gameScore,
      rank: idx + 1,
      previousTotalScore: p.totalScore - p.gameScore,
      newTotalScore: p.totalScore
    }));

    party.gameResults = gameResults;

    // Update overall scoreboard
    party.overallScoreboard = Object.values(party.players)
      .sort((a, b) => b.totalScore - a.totalScore)
      .map(p => ({
        playerId: p.id,
        playerName: p.name,
        playerAvatar: p.avatar,
        playerColor: p.color,
        totalScore: p.totalScore,
        wins: p.wins,
        isOnline: p.isOnline
      }));
  }

  /**
   * Sanitize party state before sending to a specific client
   * e.g., Secret Battle must NOT reveal who the impostor is or the majority word to the impostor!
   */
  public static sanitizePartyForPlayer(party: Party, playerId: string): any {
    const isHost = party.hostId === playerId;
    let sanitizedGameState: any = null;
    let privatePlayerData: any = null;

    if (party.gameState) {
      sanitizedGameState = JSON.parse(JSON.stringify(party.gameState));

      if (party.currentGame === 'secret_battle') {
        const sbState = party.gameState as SecretBattleRoundData;
        const isSecretPlayer = sbState.secretPlayerId === playerId;

        if (sbState.phase === 'clues' || sbState.phase === 'voting') {
          // Hide identity of secret player and hide the opposite word
          sanitizedGameState.secretPlayerId = '???';
          if (isSecretPlayer) {
            sanitizedGameState.majorityWord = '???';
            privatePlayerData = {
              role: 'secret_player',
              myWord: sbState.secretWord,
              hint: 'You are the Secret Player! Try to blend in.'
            };
          } else {
            sanitizedGameState.secretWord = '???';
            privatePlayerData = {
              role: 'regular_player',
              myWord: sbState.majorityWord,
              hint: 'Give a clue that proves you know the word without giving it away!'
            };
          }
        } else {
          // Reveal phase
          privatePlayerData = {
            role: isSecretPlayer ? 'secret_player' : 'regular_player',
            myWord: isSecretPlayer ? sbState.secretWord : sbState.majorityWord
          };
        }
      } else if (party.currentGame === 'number_guess') {
        const ngState = party.gameState as NumberGuessRoundData;
        if (party.gameStatus === 'in_game') {
          sanitizedGameState.targetNumber = -1; // Hide target number while guessing
        }
      } else if (party.currentGame === 'who_said_it') {
        const wsiState = party.gameState as WhoSaidItRoundData;
        if (wsiState.phase === 'writing' || wsiState.phase === 'guessing') {
          sanitizedGameState.submissions = {}; // Hide raw submissions mapping to player IDs
        }
      }
    }

    return {
      ...party,
      gameState: sanitizedGameState,
      myPlayerId: playerId,
      isHost,
      privatePlayerData
    };
  }
}
