import {
  GameType,
  Party,
  GameSettings,
  WordBattleRoundData,
  SecretBattleRoundData,
  MostLikelyToRoundData,
  MemoryBattleRoundData,
  SolahChitsRoundData,
  SolahChitsCard,
  SolahChitsReactionSlam,
  WhoSaidItRoundData,
  WordleRoundData,
  WordlePlayerState,
  WordleOpponentProgress,
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
  MEMORY_COLORS,
  SOLAH_CHITS_ARCHETYPES
} from './gameData.js';
import { WORDLE_ANSWERS, isValidWordleWord } from '../data/wordleWords.js';
import { evaluateWordleGuess, updateKeyboardStatus } from '../utils/wordleEvaluator.js';
import { validateWordBattleSubmission } from './wordBattleValidator.js';

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
          phase: 'ready', // Starts with instructions & ready check
          readyPlayers: {},
          submissions: {}
        };
        party.gameState = roundData;
        party.roundTimeRemaining = 25; // 25s for players to read instructions and click ready
        break;
      }

      case 'solah_chits': {
        this.initSolahChitsRound(party);
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

      case 'wordle': {
        const secretWord = this.pickRandom(WORDLE_ANSWERS, 1)[0] || 'CRANE';
        const duration = party.gameSettings.timeLimit || 90;
        const players: Record<string, WordlePlayerState> = {};

        Object.keys(party.players).forEach(pid => {
          players[pid] = {
            guesses: [],
            keyboardStatus: {},
            isSolved: false,
            isFinished: false,
            score: 0
          };
        });

        const roundData: WordleRoundData = {
          secretWord: secretWord.toUpperCase(),
          maxGuesses: 6,
          durationSeconds: duration,
          players,
          phase: 'guessing'
        };
        party.gameState = roundData;
        party.roundTimeRemaining = duration;
        break;
      }
    }
  }

  /**
   * Initialize Solah Chits round:
   * For N players -> N unique archetypes -> 4 of each -> 4N cards shuffled & dealt 4 each
   */
  private static initSolahChitsRound(party: Party): void {
    const onlineIds = Object.keys(party.players).filter(id => party.players[id].isOnline);
    const playerOrder = onlineIds.length >= 2 ? onlineIds : Object.keys(party.players);
    const n = Math.max(2, playerOrder.length);

    // Pick N archetypes from pool
    const selectedArchetypes = this.pickRandom(SOLAH_CHITS_ARCHETYPES, n);
    // If n > available archetypes, pad with recycled ones
    while (selectedArchetypes.length < n) {
      const extra = SOLAH_CHITS_ARCHETYPES[selectedArchetypes.length % SOLAH_CHITS_ARCHETYPES.length];
      selectedArchetypes.push({ ...extra, typeId: `${extra.typeId}_extra_${selectedArchetypes.length}` });
    }

    // Build 4N cards deck
    const deck: SolahChitsCard[] = [];
    selectedArchetypes.forEach(arch => {
      for (let c = 1; c <= 4; c++) {
        deck.push({
          id: `${arch.typeId}_${c}_${Math.random().toString(36).substring(2, 7)}`,
          typeId: arch.typeId,
          name: arch.name,
          hindiName: arch.hindiName,
          icon: arch.icon,
          color: arch.color
        });
      }
    });

    // Shuffle deck
    const shuffledDeck = [...deck].sort(() => 0.5 - Math.random());

    // Distribute 4 cards each
    const hands: Record<string, SolahChitsCard[]> = {};
    playerOrder.forEach((pid, idx) => {
      hands[pid] = shuffledDeck.slice(idx * 4, idx * 4 + 4);
    });

    const roundData: SolahChitsRoundData = {
      playerOrder,
      cardTypes: selectedArchetypes.map(a => ({
        typeId: a.typeId,
        name: a.name,
        hindiName: a.hindiName,
        icon: a.icon,
        color: a.color
      })),
      hands,
      pendingPasses: {},
      passedInThisRound: {},
      passCount: 0,
      phase: 'passing',
      reactionSlams: [],
      roundScores: {}
    };

    party.gameState = roundData;
    party.roundTimeRemaining = party.gameSettings.timeLimit || 20;
  }

  /**
   * Execute circular card transfer in Solah Chits:
   * Player at index i passes chosen card to player at index (i+1)%n
   */
  public static executeSolahChitsPass(party: Party, state: SolahChitsRoundData): void {
    const playerOrder = state.playerOrder;
    if (playerOrder.length < 2) return;

    // For any player who didn't select a card in time, auto-pick the card with lowest duplicate count
    playerOrder.forEach(pid => {
      if (!state.pendingPasses[pid]) {
        const hand = state.hands[pid] || [];
        if (hand.length > 0) {
          // Count occurrences of each type
          const counts: Record<string, number> = {};
          hand.forEach(c => { counts[c.typeId] = (counts[c.typeId] || 0) + 1; });
          // Pick card with least duplicates to protect potential matching set
          const sorted = [...hand].sort((a, b) => (counts[a.typeId] || 0) - (counts[b.typeId] || 0));
          state.pendingPasses[pid] = sorted[0].id;
        }
      }
    });

    // Extract passed cards from each player's hand
    const cardsToPass: Record<string, SolahChitsCard> = {};
    playerOrder.forEach(pid => {
      const cardId = state.pendingPasses[pid];
      const hand = state.hands[pid] || [];
      const cardIdx = hand.findIndex(c => c.id === cardId);
      if (cardIdx !== -1) {
        const [removedCard] = hand.splice(cardIdx, 1);
        cardsToPass[pid] = removedCard;
      } else if (hand.length > 0) {
        const [removedCard] = hand.splice(0, 1);
        cardsToPass[pid] = removedCard;
      }
    });

    // Pass to next player in the circle: Player i -> Player (i + 1) % n
    playerOrder.forEach((pid, idx) => {
      const nextPid = playerOrder[(idx + 1) % playerOrder.length];
      const card = cardsToPass[pid];
      if (card) {
        if (!state.hands[nextPid]) state.hands[nextPid] = [];
        state.hands[nextPid].push(card);
      }
    });

    // Clear pending state and increment pass count
    state.pendingPasses = {};
    state.passedInThisRound = {};
    state.passCount++;
    party.roundTimeRemaining = party.gameSettings.timeLimit || 20;
  }

  /**
   * Evaluate Solah Chits round rankings and scores
   */
  private static evaluateSolahChits(party: Party, state: SolahChitsRoundData): void {
    party.gameStatus = 'round_reveal';
    state.phase = 'reveal';

    const pointsTable = [100, 75, 55, 40, 30, 20];
    const roundScores: Record<string, { points: number; rank: number; reason: string }> = {};

    // Award points based on reaction slam order
    state.reactionSlams.forEach((slam, idx) => {
      const rank = idx + 1;
      slam.rank = rank;
      const pts = rank === 1 ? 100 : (pointsTable[rank - 1] || 15);
      slam.points = pts;

      roundScores[slam.playerId] = {
        points: pts,
        rank,
        reason: rank === 1 ? 'First to complete 4 chits & call BINGO! 🏆 (+100)' : `Reacted #${rank} in ${(slam.reactionMs / 1000).toFixed(2)}s (+${pts})`
      };

      if (party.players[slam.playerId]) {
        party.players[slam.playerId].gameScore += pts;
        party.players[slam.playerId].totalScore += pts;
      }
    });

    // For any player who didn't slam in time
    state.playerOrder.forEach(pid => {
      if (!roundScores[pid]) {
        roundScores[pid] = {
          points: 0,
          rank: state.reactionSlams.length + 1,
          reason: 'Did not slam BINGO button in time (0 pts)'
        };
      }
    });

    state.roundScores = roundScores;
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
          state.submissions[playerId] = data.words || {};
          return true;
        }
        break;
      }

      case 'secret_battle': {
        const state = party.gameState as SecretBattleRoundData;
        if (action === 'submit_clue' && state.phase === 'clues') {
          state.clues[playerId] = (data.clue || '').trim();
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
        if (action === 'player_ready' && state.phase === 'ready') {
          state.readyPlayers[playerId] = true;
          const activePlayers = Object.keys(party.players).filter(id => party.players[id].isOnline);
          const allReady = activePlayers.every(id => state.readyPlayers[id]);
          if (allReady && activePlayers.length > 0) {
            state.phase = 'memorize';
            party.roundTimeRemaining = state.challenge.memorizeDurationSeconds;
          }
          return true;
        } else if (action === 'force_start_memorize' && state.phase === 'ready') {
          // Host can force start the memorization phase
          state.phase = 'memorize';
          party.roundTimeRemaining = state.challenge.memorizeDurationSeconds;
          return true;
        } else if (action === 'submit_answer' && state.phase === 'answer') {
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

      case 'solah_chits': {
        const state = party.gameState as SolahChitsRoundData;
        if (action === 'pass_card' && state.phase === 'passing') {
          const cardId = data.cardId;
          const hand = state.hands[playerId] || [];
          if (hand.some(c => c.id === cardId)) {
            state.pendingPasses[playerId] = cardId;
            state.passedInThisRound[playerId] = true;

            // Check if all players in playerOrder have selected a card
            const activeOrder = state.playerOrder.filter(pid => party.players[pid]?.isOnline);
            const allPassed = activeOrder.every(pid => state.pendingPasses[pid]);
            if (allPassed && activeOrder.length >= 2) {
              this.executeSolahChitsPass(party, state);
            }
            return true;
          }
        } else if (action === 'trigger_bingo' && state.phase === 'passing') {
          const hand = state.hands[playerId] || [];
          if (hand.length === 4) {
            const firstType = hand[0].typeId;
            const isAllMatch = hand.every(c => c.typeId === firstType);
            if (isAllMatch) {
              state.phase = 'bingo_slam';
              state.bingoWinnerId = playerId;
              state.bingoWinnerCardTypeId = firstType;
              state.bingoTriggeredAt = Date.now();

              const winner = party.players[playerId];
              state.reactionSlams = [{
                playerId,
                playerName: winner ? winner.name : 'Winner',
                playerAvatar: winner ? winner.avatar : '👑',
                playerColor: winner ? winner.color : '#F59E0B',
                timestamp: Date.now(),
                reactionMs: 0,
                rank: 1,
                points: 100
              }];
              party.roundTimeRemaining = 7; // 7s window for all other players to slam
              return true;
            }
          }
        } else if (action === 'slam_bingo' && state.phase === 'bingo_slam') {
          const alreadySlammed = state.reactionSlams.some(s => s.playerId === playerId);
          if (!alreadySlammed) {
            const reactionMs = Date.now() - (state.bingoTriggeredAt || Date.now());
            const rank = state.reactionSlams.length + 1;
            const pointsTable = [100, 75, 55, 40, 30, 20];
            const pts = pointsTable[rank - 1] || 15;
            const p = party.players[playerId];

            state.reactionSlams.push({
              playerId,
              playerName: p ? p.name : 'Player',
              playerAvatar: p ? p.avatar : '⚡',
              playerColor: p ? p.color : '#3B82F6',
              timestamp: Date.now(),
              reactionMs,
              rank,
              points: pts
            });

            const activeOrder = state.playerOrder.filter(pid => party.players[pid]?.isOnline);
            if (state.reactionSlams.length >= activeOrder.length) {
              this.evaluateSolahChits(party, state);
            }
            return true;
          }
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
            state.anonymizedAnswers = Object.entries(state.submissions).map(([pid, text], index) => ({
              id: `ans_${index + 1}`,
              text
            })).sort(() => 0.5 - Math.random());
            state.phase = 'guessing';
            party.roundTimeRemaining = 40;
          }
          return true;
        } else if (action === 'submit_guesses' && state.phase === 'guessing') {
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

      case 'wordle': {
        const state = party.gameState as WordleRoundData;
        if (action === 'submit_guess' && state.phase === 'guessing') {
          const rawGuess = ((data && data.guess) || '').trim().toUpperCase();
          const pState = state.players[playerId];
          if (!pState || pState.isFinished) return false;

          // Must be exactly 5 letters
          if (rawGuess.length !== 5 || !/^[A-Z]{5}$/.test(rawGuess)) {
            return false;
          }

          // Authoritative server-side dictionary validation
          if (!isValidWordleWord(rawGuess)) {
            return false;
          }

          // Evaluate guess against the secret word
          const evaluations = evaluateWordleGuess(rawGuess, state.secretWord);
          pState.keyboardStatus = updateKeyboardStatus(pState.keyboardStatus, rawGuess, evaluations);
          pState.guesses.push({
            word: rawGuess,
            evaluations
          });

          const isMatch = evaluations.every(ev => ev === 'correct');
          if (isMatch) {
            pState.isSolved = true;
            pState.isFinished = true;
            pState.solvedAtGuessCount = pState.guesses.length;
          } else if (pState.guesses.length >= state.maxGuesses) {
            pState.isFinished = true;
          }

          // Check if all active online players are finished
          const activePlayers = Object.keys(party.players).filter(id => party.players[id].isOnline);
          const checkIds = activePlayers.length > 0 ? activePlayers : Object.keys(party.players);
          const allFinished = checkIds.every(id => {
            const ps = state.players[id];
            return ps ? ps.isFinished : true;
          });

          if (allFinished) {
            this.evaluateWordle(party, state);
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
        if (state.phase === 'ready') {
          state.phase = 'memorize';
          party.roundTimeRemaining = state.challenge.memorizeDurationSeconds;
        } else if (state.phase === 'memorize') {
          state.phase = 'answer';
          party.roundTimeRemaining = state.challenge.answerDurationSeconds;
        } else if (state.phase === 'answer') {
          this.evaluateMemoryBattle(party, state);
        }
        break;
      }

      case 'solah_chits': {
        const state = party.gameState as SolahChitsRoundData;
        if (state.phase === 'passing') {
          this.executeSolahChitsPass(party, state);
        } else if (state.phase === 'bingo_slam') {
          this.evaluateSolahChits(party, state);
        }
        break;
      }

      case 'who_said_it': {
        const state = party.gameState as WhoSaidItRoundData;
        if (state.phase === 'writing') {
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

      case 'wordle': {
        const state = party.gameState as WordleRoundData;
        if (state.phase === 'guessing') {
          Object.values(state.players).forEach(ps => {
            ps.isFinished = true;
          });
          this.evaluateWordle(party, state);
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

    // Group words by category to find uniqueness (only for valid words)
    const categoryWords: Record<string, Record<string, string[]>> = {};
    state.categories.forEach(cat => {
      categoryWords[cat] = {};
    });

    Object.entries(state.submissions).forEach(([playerId, userWords]) => {
      state.categories.forEach((cat, idx) => {
        const rawWord = (userWords[idx] || userWords[cat] || '').trim();
        const validation = validateWordBattleSubmission(rawWord, letter, cat);
        if (validation.valid) {
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
      const wordsMap: Record<string, { word: string; valid: boolean; unique: boolean; points: number; reason?: string; details?: string }> = {};
      const scores: Record<string, number> = {};
      let totalRoundScore = 0;

      state.categories.forEach((cat, idx) => {
        const rawWord = (userWords[idx] || userWords[cat] || '').trim();
        const validation = validateWordBattleSubmission(rawWord, letter, cat);
        let valid = false;
        let unique = false;
        let points = 0;

        if (validation.valid) {
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

        wordsMap[cat] = {
          word: rawWord || '—',
          valid,
          unique,
          points,
          reason: validation.reason,
          details: validation.details
        };
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

  private static evaluateWordle(party: Party, state: WordleRoundData): void {
    state.phase = 'reveal';
    party.gameStatus = 'round_reveal';

    // Scoring scale:
    // 1 guess: 600 pts
    // 2 guesses: 500 pts
    // 3 guesses: 400 pts
    // 4 guesses: 300 pts
    // 5 guesses: 200 pts
    // 6 guesses: 100 pts
    // Not solved: 0 pts
    const guessScoreMap: Record<number, number> = {
      1: 600,
      2: 500,
      3: 400,
      4: 300,
      5: 200,
      6: 100
    };

    const roundScores: Record<string, {
      points: number;
      guessesUsed: number;
      isSolved: boolean;
      rank: number;
      reason?: string;
    }> = {};

    const playerEntries = Object.entries(state.players);

    // Calculate score for each player
    playerEntries.forEach(([pid, pState]) => {
      let points = 0;
      if (pState.isSolved) {
        const attempts = pState.guesses.length;
        points = guessScoreMap[attempts] || 100;
      }
      pState.score = points;

      if (party.players[pid]) {
        party.players[pid].gameScore += points;
        party.players[pid].totalScore += points;
      }
    });

    // Rank players: higher score first; tie break by fewer guesses used
    const ranked = [...playerEntries].sort((a, b) => {
      if (b[1].score !== a[1].score) return b[1].score - a[1].score;
      return a[1].guesses.length - b[1].guesses.length;
    });

    ranked.forEach(([pid, pState], idx) => {
      const attempts = pState.guesses.length;
      let reason = 'Did not solve';
      if (pState.isSolved) {
        reason = `Solved in ${attempts} ${attempts === 1 ? 'guess' : 'guesses'}!`;
      }
      roundScores[pid] = {
        points: pState.score,
        guessesUsed: attempts,
        isSolved: pState.isSolved,
        rank: idx + 1,
        reason
      };
    });

    state.roundScores = roundScores;
  }

  private static evaluateSecretBattleVotes(party: Party, state: SecretBattleRoundData): void {
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

    const impostorFound = mostVotedId === state.secretPlayerId;

    if (impostorFound) {
      state.phase = 'reveal_guess';
      party.roundTimeRemaining = 20;
    } else {
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
      if (winners.includes(pid)) {
        points += 100;
      }
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

  private static evaluateWhoSaidIt(party: Party, state: WhoSaidItRoundData): void {
    party.gameStatus = 'round_reveal';
    state.phase = 'reveal';

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

      const myGuesses = state.guesses[pid] || {};
      Object.entries(myGuesses).forEach(([ansId, guessedAuthorId]) => {
        const realAuthorId = answerAuthorMap[ansId];
        if (realAuthorId && realAuthorId === guessedAuthorId && realAuthorId !== pid) {
          correctGuesses++;
        }
      });

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
          sanitizedGameState.secretPlayerId = '???';
          if (sbState.phase === 'voting') {
            // Hide other players' votes during voting
            sanitizedGameState.votes = {
              [playerId]: sbState.votes[playerId]
            };
          }
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
          privatePlayerData = {
            role: isSecretPlayer ? 'secret_player' : 'regular_player',
            myWord: isSecretPlayer ? sbState.secretWord : sbState.majorityWord
          };
        }
      } else if (party.currentGame === 'solah_chits') {
        const scState = party.gameState as SolahChitsRoundData;
        // Keep other players' cards and passed chits hidden during passing and bingo slam
        if (scState.phase === 'passing' || scState.phase === 'bingo_slam') {
          const myHand = scState.hands[playerId] || [];
          sanitizedGameState.hands = {
            [playerId]: myHand
          };
          sanitizedGameState.pendingPasses = {
            [playerId]: scState.pendingPasses[playerId]
          };
        }
      } else if (party.currentGame === 'who_said_it') {
        const wsiState = party.gameState as WhoSaidItRoundData;
        if (wsiState.phase === 'writing') {
          sanitizedGameState.submissions = {
            [playerId]: wsiState.submissions[playerId]
          };
        } else if (wsiState.phase === 'guessing') {
          sanitizedGameState.submissions = {};
          sanitizedGameState.guesses = {
            [playerId]: wsiState.guesses[playerId]
          };
        }
      } else if (party.currentGame === 'word_battle') {
        // Hide other players' submissions during active round
        if (party.gameStatus === 'in_game') {
          const wbState = party.gameState as WordBattleRoundData;
          sanitizedGameState.submissions = {
            [playerId]: wbState.submissions[playerId] || {}
          };
        }
      } else if (party.currentGame === 'most_likely_to') {
        // Hide other players' votes during active voting
        if (party.gameStatus === 'in_game') {
          const mltState = party.gameState as MostLikelyToRoundData;
          sanitizedGameState.votes = {
            [playerId]: mltState.votes[playerId]
          };
        }
      } else if (party.currentGame === 'memory_battle') {
        // Redact correct answer and player chaos questions before reveal
        const mbState = party.gameState as MemoryBattleRoundData;
        if (mbState.phase !== 'reveal') {
          if (sanitizedGameState.challenge) {
            sanitizedGameState.challenge.correctAnswer = '???';
            if (sanitizedGameState.challenge.playerSpecificChaos) {
              sanitizedGameState.challenge.playerSpecificChaos = {
                [playerId]: mbState.challenge.playerSpecificChaos[playerId]
              };
            }
          }
          sanitizedGameState.submissions = {
            [playerId]: mbState.submissions[playerId]
          };
        }
      } else if (party.currentGame === 'wordle') {
        const wState = party.gameState as WordleRoundData;
        const myState: WordlePlayerState = wState.players[playerId] || {
          guesses: [],
          keyboardStatus: {},
          isSolved: false,
          isFinished: false,
          score: 0
        };

        if (party.gameStatus === 'in_game' && wState.phase === 'guessing') {
          // Never reveal secret word during guessing
          sanitizedGameState.secretWord = '?????';
          sanitizedGameState.myState = myState;

          // Opponents' public progress only (no words or tile evaluations leaked)
          const opponentsProgress: WordleOpponentProgress[] = Object.entries(wState.players)
            .filter(([pid]) => pid !== playerId)
            .map(([pid, ps]) => ({
              playerId: pid,
              playerName: party.players[pid]?.name || 'Player',
              playerAvatar: party.players[pid]?.avatar || '👤',
              playerColor: party.players[pid]?.color || '#8B5CF6',
              guessesUsed: ps.guesses.length,
              maxGuesses: wState.maxGuesses,
              isSolved: ps.isSolved,
              isFinished: ps.isFinished
            }));
          sanitizedGameState.opponentsProgress = opponentsProgress;

          // Strip all other players' full state from the object
          sanitizedGameState.players = {
            [playerId]: myState
          };
        } else {
          // Round reveal / results phase: reveal secret word and all final boards
          sanitizedGameState.revealedSecretWord = wState.secretWord;
          sanitizedGameState.myState = myState;

          const allFinalBoards: Record<string, {
            playerName: string;
            playerAvatar: string;
            playerColor: string;
            guesses: typeof myState.guesses;
            isSolved: boolean;
            score: number;
          }> = {};

          Object.entries(wState.players).forEach(([pid, ps]) => {
            allFinalBoards[pid] = {
              playerName: party.players[pid]?.name || 'Player',
              playerAvatar: party.players[pid]?.avatar || '👤',
              playerColor: party.players[pid]?.color || '#8B5CF6',
              guesses: ps.guesses,
              isSolved: ps.isSolved,
              score: ps.score
            };
          });

          sanitizedGameState.allFinalBoards = allFinalBoards;
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
