import { WebSocket } from 'ws';
import {
  Party,
  Player,
  ChatMessage,
  GameType,
  GameSettings,
  ClientWsMessage,
  ServerWsMessage,
  ClientPartyView
} from '../types.js';
import { GameEngine } from './gameEngine.js';

// Visual color palette for players
const PLAYER_COLORS = [
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#6366F1'  // Indigo
];

const DEFAULT_AVATARS = ['🎮', '🦊', '⚡', '🚀', '🔥', '👑', '💎', '🐯', '🌟', '🦄', '🎯', '👾'];

interface ConnectedSocket {
  ws: WebSocket;
  partyCode: string | null;
  playerId: string | null;
  lastPing: number;
}

export class PartyManager {
  private parties: Map<string, Party> = new Map(); // partyCode -> Party
  private sockets: Map<WebSocket, ConnectedSocket> = new Map();
  private sseListeners: Map<string, Set<(event: string, data: any) => void>> = new Map();
  private tickInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startGlobalLoop();
  }

  /**
   * Start global 1-second game tick and clean up idle parties
   */
  private startGlobalLoop(): void {
    this.tickInterval = setInterval(() => {
      const now = Date.now();

      // Tick active parties
      this.parties.forEach((party, code) => {
        if (party.gameStatus === 'in_game') {
          GameEngine.handleTick(party);
          // Broadcast state or tick
          this.broadcastPartyState(party);
        }

        // Cleanup stale parties (inactive > 4 hours & no online players)
        const onlineCount = Object.values(party.players).filter(p => p.isOnline).length;
        if (onlineCount === 0 && now - party.lastActivityAt > 4 * 60 * 60 * 1000) {
          this.parties.delete(code);
        }
      });
    }, 1000);
  }

  /**
   * Generate 6-char human-friendly party code
   */
  private generatePartyCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded easily confused 0, O, 1, I
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Prevent collision
    if (this.parties.has(code)) {
      return this.generatePartyCode();
    }
    return code;
  }

  /**
   * Generate UUID-like session token
   */
  private generateToken(): string {
    return 'tok_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  }

  public registerSocket(ws: WebSocket): void {
    this.sockets.set(ws, {
      ws,
      partyCode: null,
      playerId: null,
      lastPing: Date.now()
    });
  }

  public unregisterSocket(ws: WebSocket): void {
    const conn = this.sockets.get(ws);
    if (conn && conn.partyCode && conn.playerId) {
      this.handlePlayerDisconnect(conn.partyCode, conn.playerId);
    }
    this.sockets.delete(ws);
  }

  /**
   * Main WS message router
   */
  public handleMessage(ws: WebSocket, rawData: string): void {
    const conn = this.sockets.get(ws);
    if (!conn) return;

    try {
      const msg = JSON.parse(rawData) as ClientWsMessage;

      switch (msg.type) {
        case 'ping':
          conn.lastPing = Date.now();
          this.send(ws, { type: 'pong' });
          break;

        case 'create_party':
          this.createParty(ws, conn, msg.payload.playerName, msg.payload.partyName, msg.payload.avatar);
          break;

        case 'join_party':
          this.joinParty(ws, conn, msg.payload.partyCode, msg.payload.playerName, msg.payload.avatar);
          break;

        case 'rejoin_party':
          this.rejoinParty(ws, conn, msg.payload.partyCode, msg.payload.playerName, msg.payload.sessionToken, msg.payload.playerId);
          break;

        case 'reconnect':
          this.reconnectPlayer(ws, conn, msg.payload.partyCode, msg.payload.playerId, msg.payload.sessionToken);
          break;

        case 'update_avatar':
          this.handleUpdateAvatar(conn, msg.payload.avatar);
          break;

        case 'send_chat':
          this.handleChat(conn, msg.payload.text);
          break;

        case 'select_game':
          this.handleSelectGame(conn, msg.payload.gameType);
          break;

        case 'update_game_settings':
          this.handleUpdateSettings(conn, msg.payload.settings);
          break;

        case 'start_game':
          this.handleStartGame(conn);
          break;

        case 'game_action':
          this.handleGameAction(conn, msg.payload.action, msg.payload.data);
          break;

        case 'next_round':
          this.handleNextRound(conn);
          break;

        case 'end_game':
          this.handleEndGame(conn);
          break;

        case 'restart_game':
          this.handleRestartGame(conn);
          break;

        case 'return_to_lobby':
          this.handleReturnToLobby(conn);
          break;

        case 'toggle_lock':
          this.handleToggleLock(conn);
          break;

        case 'kick_player':
          this.handleKickPlayer(conn, msg.payload.targetPlayerId);
          break;

        case 'leave_party':
          this.handleLeaveParty(ws, conn);
          break;
      }
    } catch (e) {
      console.error('Error handling message:', e);
      this.send(ws, {
        type: 'error',
        payload: { code: 'INVALID_PAYLOAD', message: 'Failed to process request.' }
      });
    }
  }

  // ----------------------------------------------------
  // Core Party Operations
  // ----------------------------------------------------

  private createParty(
    ws: WebSocket,
    conn: ConnectedSocket,
    rawPlayerName: string,
    rawPartyName: string,
    avatar?: string
  ): void {
    const playerName = (rawPlayerName || 'Host').trim().substring(0, 20);
    const partyName = (rawPartyName || `${playerName}'s Party`).trim().substring(0, 30);
    const partyCode = this.generatePartyCode();
    const playerId = 'p_' + Math.random().toString(36).substring(2, 9);
    const sessionToken = this.generateToken();

    const hostPlayer: Player = {
      id: playerId,
      name: playerName,
      avatar: avatar || DEFAULT_AVATARS[0],
      color: PLAYER_COLORS[0],
      isHost: true,
      isOnline: true,
      joinedAt: Date.now(),
      lastSeenAt: Date.now(),
      totalScore: 0,
      gameScore: 0,
      wins: 0,
      sessionToken
    };

    const newParty: Party = {
      id: 'pty_' + Math.random().toString(36).substring(2, 12),
      code: partyCode,
      name: partyName,
      hostId: playerId,
      isLocked: false,
      createdAt: Date.now(),
      lastActivityAt: Date.now(),
      players: { [playerId]: hostPlayer },
      chatMessages: [
        {
          id: `msg_init_${Date.now()}`,
          playerId: 'system',
          playerName: 'Game Zone',
          playerAvatar: '🎉',
          playerColor: '#8B5CF6',
          text: `Welcome to ${partyName}! Share code "${partyCode}" with friends to join.`,
          timestamp: Date.now(),
          isSystem: true
        }
      ],
      currentGame: null,
      gameStatus: 'lobby',
      gameSettings: {
        rounds: 3,
        timeLimit: 45,
        difficulty: 'normal'
      },
      currentRound: 1,
      totalRounds: 3,
      roundTimeRemaining: 0,
      gameState: null,
      gameResults: null,
      overallScoreboard: [
        {
          playerId,
          playerName,
          playerAvatar: hostPlayer.avatar,
          playerColor: hostPlayer.color,
          totalScore: 0,
          wins: 0,
          isOnline: true
        }
      ]
    };

    this.parties.set(partyCode, newParty);
    conn.partyCode = partyCode;
    conn.playerId = playerId;

    const sanitized = GameEngine.sanitizePartyForPlayer(newParty, playerId);
    this.send(ws, {
      type: 'party_state',
      payload: { party: sanitized, sessionToken }
    });
  }

  private joinParty(
    ws: WebSocket,
    conn: ConnectedSocket,
    rawCode: string,
    rawPlayerName: string,
    avatar?: string
  ): void {
    const code = (rawCode || '').trim().toUpperCase();
    const party = this.parties.get(code);

    if (!party) {
      this.send(ws, {
        type: 'error',
        payload: { code: 'PARTY_NOT_FOUND', message: `Party with code "${code}" does not exist or expired.` }
      });
      return;
    }

    if (party.isLocked) {
      this.send(ws, {
        type: 'error',
        payload: { code: 'PARTY_LOCKED', message: 'This party is locked by the host.' }
      });
      return;
    }

    const onlinePlayers = Object.values(party.players).filter(p => p.isOnline);
    if (onlinePlayers.length >= 20) {
      this.send(ws, {
        type: 'error',
        payload: { code: 'PARTY_FULL', message: 'This party has reached the maximum limit of 20 players.' }
      });
      return;
    }

    let playerName = (rawPlayerName || 'Player').trim().substring(0, 20);
    // Handle duplicate names gracefully
    const existingNames = Object.values(party.players).map(p => p.name.toLowerCase());
    if (existingNames.includes(playerName.toLowerCase())) {
      playerName = `${playerName} (${onlinePlayers.length + 1})`;
    }

    const playerId = 'p_' + Math.random().toString(36).substring(2, 9);
    const sessionToken = this.generateToken();
    const colorIndex = Object.keys(party.players).length % PLAYER_COLORS.length;
    const avatarIndex = Object.keys(party.players).length % DEFAULT_AVATARS.length;

    const newPlayer: Player = {
      id: playerId,
      name: playerName,
      avatar: avatar || DEFAULT_AVATARS[avatarIndex],
      color: PLAYER_COLORS[colorIndex],
      isHost: false,
      isOnline: true,
      joinedAt: Date.now(),
      lastSeenAt: Date.now(),
      totalScore: 0,
      gameScore: 0,
      wins: 0,
      sessionToken
    };

    party.players[playerId] = newPlayer;
    party.lastActivityAt = Date.now();

    // Add system chat message
    party.chatMessages.push({
      id: `msg_join_${Date.now()}_${Math.random()}`,
      playerId: 'system',
      playerName: 'Game Zone',
      playerAvatar: '👋',
      playerColor: '#10B981',
      text: `${playerName} joined the party!`,
      timestamp: Date.now(),
      isSystem: true
    });

    conn.partyCode = code;
    conn.playerId = playerId;

    this.broadcastPartyState(party);
  }

  private reconnectPlayer(
    ws: WebSocket,
    conn: ConnectedSocket,
    rawCode: string,
    playerId: string,
    sessionToken: string
  ): void {
    const code = (rawCode || '').trim().toUpperCase();
    const party = this.parties.get(code);

    if (!party) {
      this.send(ws, {
        type: 'error',
        payload: { code: 'PARTY_EXPIRED', message: 'The party session is no longer active.' }
      });
      return;
    }

    const player = party.players[playerId];
    if (!player || player.sessionToken !== sessionToken) {
      this.send(ws, {
        type: 'error',
        payload: { code: 'SESSION_INVALID', message: 'Unable to restore session. Please join afresh.' }
      });
      return;
    }

    // Mark player online & update timestamp
    player.isOnline = true;
    player.lastSeenAt = Date.now();
    party.lastActivityAt = Date.now();

    conn.partyCode = code;
    conn.playerId = playerId;

    // Send system alert to party
    party.chatMessages.push({
      id: `msg_recon_${Date.now()}_${Math.random()}`,
      playerId: 'system',
      playerName: 'Game Zone',
      playerAvatar: '⚡',
      playerColor: '#3B82F6',
      text: `${player.name} reconnected!`,
      timestamp: Date.now(),
      isSystem: true
    });

    const reconnectData = party.currentGame ? {
      gameName: this.getGameName(party.currentGame),
      round: party.currentRound,
      totalRounds: party.totalRounds
    } : undefined;

    const sanitized = GameEngine.sanitizePartyForPlayer(party, playerId);
    this.send(ws, {
      type: 'party_state',
      payload: {
        party: sanitized,
        sessionToken,
        reconnectData
      }
    });

    // Notify other players
    this.broadcastPartyState(party, playerId);
  }

  private rejoinParty(
    ws: WebSocket,
    conn: ConnectedSocket,
    rawCode: string,
    rawPlayerName?: string,
    providedSessionToken?: string,
    providedPlayerId?: string
  ): void {
    const code = (rawCode || '').trim().toUpperCase();
    const party = this.parties.get(code);

    if (!party) {
      this.send(ws, {
        type: 'error',
        payload: { code: 'PARTY_NOT_FOUND', message: `Party with code "${code}" does not exist or has expired.` }
      });
      return;
    }

    const trimmedName = (rawPlayerName || '').trim();

    // 1. Check if direct session match (sessionToken + playerId)
    if (providedPlayerId && providedSessionToken && party.players[providedPlayerId]) {
      const player = party.players[providedPlayerId];
      if (player.sessionToken === providedSessionToken) {
        this.reconnectPlayer(ws, conn, code, providedPlayerId, providedSessionToken);
        return;
      }
    }

    // 2. Check if a player with this playerId exists and is offline
    if (providedPlayerId && party.players[providedPlayerId]) {
      const player = party.players[providedPlayerId];
      if (!player.isOnline) {
        const freshToken = this.generateToken();
        player.sessionToken = freshToken;
        player.isOnline = true;
        player.lastSeenAt = Date.now();
        party.lastActivityAt = Date.now();

        conn.partyCode = code;
        conn.playerId = providedPlayerId;

        party.chatMessages.push({
          id: `msg_rejoin_${Date.now()}_${Math.random()}`,
          playerId: 'system',
          playerName: 'Game Zone',
          playerAvatar: '⚡',
          playerColor: '#3B82F6',
          text: `${player.name} rejoined the game!`,
          timestamp: Date.now(),
          isSystem: true
        });

        const reconnectData = party.currentGame ? {
          gameName: this.getGameName(party.currentGame),
          round: party.currentRound,
          totalRounds: party.totalRounds
        } : undefined;

        const sanitized = GameEngine.sanitizePartyForPlayer(party, providedPlayerId);
        this.send(ws, {
          type: 'party_state',
          payload: { party: sanitized, sessionToken: freshToken, reconnectData }
        });
        this.broadcastPartyState(party, providedPlayerId);
        return;
      }
    }

    // 3. Search for offline player matching the provided name
    if (trimmedName) {
      const matchingOfflinePlayer = Object.values(party.players).find(
        p => p.name.toLowerCase() === trimmedName.toLowerCase() && !p.isOnline
      );

      if (matchingOfflinePlayer) {
        const freshToken = this.generateToken();
        matchingOfflinePlayer.sessionToken = freshToken;
        matchingOfflinePlayer.isOnline = true;
        matchingOfflinePlayer.lastSeenAt = Date.now();
        party.lastActivityAt = Date.now();

        conn.partyCode = code;
        conn.playerId = matchingOfflinePlayer.id;

        party.chatMessages.push({
          id: `msg_rejoin_${Date.now()}_${Math.random()}`,
          playerId: 'system',
          playerName: 'Game Zone',
          playerAvatar: '⚡',
          playerColor: '#3B82F6',
          text: `${matchingOfflinePlayer.name} rejoined the game!`,
          timestamp: Date.now(),
          isSystem: true
        });

        const reconnectData = party.currentGame ? {
          gameName: this.getGameName(party.currentGame),
          round: party.currentRound,
          totalRounds: party.totalRounds
        } : undefined;

        const sanitized = GameEngine.sanitizePartyForPlayer(party, matchingOfflinePlayer.id);
        this.send(ws, {
          type: 'party_state',
          payload: { party: sanitized, sessionToken: freshToken, reconnectData }
        });
        this.broadcastPartyState(party, matchingOfflinePlayer.id);
        return;
      }
    }

    // 4. Fallback: Join party afresh
    if (party.isLocked) {
      this.send(ws, {
        type: 'error',
        payload: { code: 'PARTY_LOCKED', message: 'This party is locked by the host.' }
      });
      return;
    }

    this.joinParty(ws, conn, code, trimmedName || 'Player');
  }

  private handlePlayerDisconnect(partyCode: string, playerId: string): void {
    const party = this.parties.get(partyCode);
    if (!party) return;

    const player = party.players[playerId];
    if (!player) return;

    player.isOnline = false;
    player.lastSeenAt = Date.now();

    // Check if host disconnected
    if (player.isHost) {
      const activePlayers = Object.values(party.players).filter(p => p.isOnline && p.id !== playerId);
      if (activePlayers.length > 0) {
        // Transfer temporary host if lobby or needed
        const newHost = activePlayers[0];
        // Only transfer host if party is currently in lobby
        if (party.gameStatus === 'lobby') {
          player.isHost = false;
          newHost.isHost = true;
          party.hostId = newHost.id;

          party.chatMessages.push({
            id: `msg_host_${Date.now()}`,
            playerId: 'system',
            playerName: 'Game Zone',
            playerAvatar: '👑',
            playerColor: '#F59E0B',
            text: `${newHost.name} is now the Party Host!`,
            timestamp: Date.now(),
            isSystem: true
          });
        }
      }
    }

    this.broadcastPartyState(party);
  }

  private handleChat(conn: ConnectedSocket, text: string): void {
    if (!conn.partyCode || !conn.playerId) return;
    const party = this.parties.get(conn.partyCode);
    if (!party) return;

    const player = party.players[conn.playerId];
    if (!player) return;

    const cleanText = (text || '').trim();
    if (cleanText.length === 0 || cleanText.length > 300) return;

    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      playerId: player.id,
      playerName: player.name,
      playerAvatar: player.avatar,
      playerColor: player.color,
      text: cleanText,
      timestamp: Date.now()
    };

    // Keep last 100 messages
    if (party.chatMessages.length > 100) {
      party.chatMessages.shift();
    }
    party.chatMessages.push(message);
    party.lastActivityAt = Date.now();

    // Broadcast message to everyone in the party
    this.broadcastToParty(party.code, {
      type: 'chat_message',
      payload: { message }
    });
  }

  private handleUpdateAvatar(conn: ConnectedSocket, rawAvatar: string): void {
    if (!conn.partyCode || !conn.playerId) return;
    const party = this.parties.get(conn.partyCode);
    if (!party) return;

    const player = party.players[conn.playerId];
    if (!player) return;

    const cleanAvatar = (rawAvatar || '').trim();
    if (!cleanAvatar) return;

    player.avatar = cleanAvatar;
    party.lastActivityAt = Date.now();

    // Update scoreboard cache if present
    const sbItem = party.overallScoreboard.find(s => s.playerId === player.id);
    if (sbItem) {
      sbItem.playerAvatar = cleanAvatar;
    }

    this.broadcastPartyState(party);
  }

  private handleSelectGame(conn: ConnectedSocket, gameType: GameType): void {
    const party = this.getPartyIfHost(conn);
    if (!party) return;

    party.currentGame = gameType;
    party.lastActivityAt = Date.now();
    this.broadcastPartyState(party);
  }

  private handleUpdateSettings(conn: ConnectedSocket, settings: Partial<GameSettings>): void {
    const party = this.getPartyIfHost(conn);
    if (!party) return;

    party.gameSettings = {
      ...party.gameSettings,
      ...settings
    };
    party.lastActivityAt = Date.now();
    this.broadcastPartyState(party);
  }

  private handleStartGame(conn: ConnectedSocket): void {
    const party = this.getPartyIfHost(conn);
    if (!party || !party.currentGame) return;

    const activePlayers = Object.values(party.players).filter(p => p.isOnline);
    if (activePlayers.length < 1) return;

    GameEngine.initGame(party, party.currentGame, party.gameSettings);
    party.lastActivityAt = Date.now();

    party.chatMessages.push({
      id: `msg_game_start_${Date.now()}`,
      playerId: 'system',
      playerName: 'Game Zone',
      playerAvatar: '🚀',
      playerColor: '#8B5CF6',
      text: `Host started ${this.getGameName(party.currentGame)}! Good luck!`,
      timestamp: Date.now(),
      isSystem: true
    });

    this.broadcastPartyState(party);
  }

  private handleGameAction(conn: ConnectedSocket, action: string, data: any): void {
    if (!conn.partyCode || !conn.playerId) return;
    const party = this.parties.get(conn.partyCode);
    if (!party) return;

    const updated = GameEngine.handleAction(party, conn.playerId, action, data);
    if (updated) {
      party.lastActivityAt = Date.now();
      this.broadcastPartyState(party);
    }
  }

  private handleNextRound(conn: ConnectedSocket): void {
    const party = this.getPartyIfHost(conn);
    if (!party) return;

    GameEngine.advanceGame(party);
    party.lastActivityAt = Date.now();
    this.broadcastPartyState(party);
  }

  private handleEndGame(conn: ConnectedSocket): void {
    const party = this.getPartyIfHost(conn);
    if (!party) return;

    GameEngine.endGame(party);
    party.lastActivityAt = Date.now();
    this.broadcastPartyState(party);
  }

  private handleRestartGame(conn: ConnectedSocket): void {
    const party = this.getPartyIfHost(conn);
    if (!party || !party.currentGame) return;

    GameEngine.initGame(party, party.currentGame, party.gameSettings);
    party.lastActivityAt = Date.now();
    this.broadcastPartyState(party);
  }

  private handleReturnToLobby(conn: ConnectedSocket): void {
    const party = this.getPartyIfHost(conn);
    if (!party) return;

    party.gameStatus = 'lobby';
    party.gameState = null;
    party.gameResults = null;
    party.roundTimeRemaining = 0;
    party.lastActivityAt = Date.now();

    party.chatMessages.push({
      id: `msg_lobby_${Date.now()}`,
      playerId: 'system',
      playerName: 'Game Zone',
      playerAvatar: '🏠',
      playerColor: '#6366F1',
      text: 'Party returned to the lobby.',
      timestamp: Date.now(),
      isSystem: true
    });

    this.broadcastPartyState(party);
  }

  private handleToggleLock(conn: ConnectedSocket): void {
    const party = this.getPartyIfHost(conn);
    if (!party) return;

    party.isLocked = !party.isLocked;
    party.lastActivityAt = Date.now();

    party.chatMessages.push({
      id: `msg_lock_${Date.now()}`,
      playerId: 'system',
      playerName: 'Game Zone',
      playerAvatar: party.isLocked ? '🔒' : '🔓',
      playerColor: party.isLocked ? '#EF4444' : '#10B981',
      text: party.isLocked ? 'Party is now locked to new players.' : 'Party is now open for joins.',
      timestamp: Date.now(),
      isSystem: true
    });

    this.broadcastPartyState(party);
  }

  private handleKickPlayer(conn: ConnectedSocket, targetPlayerId: string): void {
    const party = this.getPartyIfHost(conn);
    if (!party || !targetPlayerId || targetPlayerId === conn.playerId) return;

    const targetPlayer = party.players[targetPlayerId];
    if (!targetPlayer) return;

    delete party.players[targetPlayerId];
    party.lastActivityAt = Date.now();

    // Find socket of kicked player and inform them
    this.sockets.forEach((sConn, sWs) => {
      if (sConn.partyCode === party.code && sConn.playerId === targetPlayerId) {
        this.send(sWs, {
          type: 'error',
          payload: { code: 'KICKED', message: 'You have been removed from the party by the host.' }
        });
        sConn.partyCode = null;
        sConn.playerId = null;
      }
    });

    party.chatMessages.push({
      id: `msg_kick_${Date.now()}`,
      playerId: 'system',
      playerName: 'Game Zone',
      playerAvatar: '⚠️',
      playerColor: '#EF4444',
      text: `${targetPlayer.name} was removed from the party.`,
      timestamp: Date.now(),
      isSystem: true
    });

    this.broadcastPartyState(party);
  }

  private handleLeaveParty(ws: WebSocket, conn: ConnectedSocket): void {
    if (!conn.partyCode || !conn.playerId) return;
    const party = this.parties.get(conn.partyCode);

    if (party) {
      const player = party.players[conn.playerId];
      delete party.players[conn.playerId];

      if (player) {
        party.chatMessages.push({
          id: `msg_leave_${Date.now()}`,
          playerId: 'system',
          playerName: 'Game Zone',
          playerAvatar: '👋',
          playerColor: '#9CA3AF',
          text: `${player.name} left the party.`,
          timestamp: Date.now(),
          isSystem: true
        });
      }

      // If host left, transfer host
      if (player && player.isHost) {
        const remainingPlayers = Object.values(party.players).filter(p => p.isOnline);
        if (remainingPlayers.length > 0) {
          remainingPlayers[0].isHost = true;
          party.hostId = remainingPlayers[0].id;
        }
      }

      this.broadcastPartyState(party);
    }

    conn.partyCode = null;
    conn.playerId = null;
  }

  // ----------------------------------------------------
  // Helpers & Broadcasting
  // ----------------------------------------------------

  private getPartyIfHost(conn: ConnectedSocket): Party | null {
    if (!conn.partyCode || !conn.playerId) return null;
    const party = this.parties.get(conn.partyCode);
    if (!party || party.hostId !== conn.playerId) return null;
    return party;
  }

  public broadcastPartyState(party: Party, excludePlayerId?: string): void {
    this.sockets.forEach((conn, ws) => {
      if (conn.partyCode === party.code && conn.playerId) {
        if (excludePlayerId && conn.playerId === excludePlayerId) return;

        const sanitized = GameEngine.sanitizePartyForPlayer(party, conn.playerId);
        const player = party.players[conn.playerId];
        const sessionToken = player ? player.sessionToken : '';

        this.send(ws, {
          type: 'party_state',
          payload: { party: sanitized, sessionToken }
        });
      }
    });

    // Also notify SSE listeners for this party
    const listeners = this.sseListeners.get(party.code);
    if (listeners && listeners.size > 0) {
      listeners.forEach(cb => {
        try {
          cb('party_state', { party });
        } catch (e) {
          // ignore dead listener
        }
      });
    }
  }

  public broadcastToParty(partyCode: string, message: ServerWsMessage): void {
    this.sockets.forEach((conn, ws) => {
      if (conn.partyCode === partyCode) {
        this.send(ws, message);
      }
    });

    // Also notify SSE listeners
    const listeners = this.sseListeners.get(partyCode);
    if (listeners && listeners.size > 0) {
      listeners.forEach(cb => {
        try {
          cb(message.type, message.payload);
        } catch (e) {
          // ignore dead listener
        }
      });
    }
  }

  public registerSseListener(partyCode: string, callback: (event: string, data: any) => void): () => void {
    const code = partyCode.toUpperCase();
    if (!this.sseListeners.has(code)) {
      this.sseListeners.set(code, new Set());
    }
    const set = this.sseListeners.get(code)!;
    set.add(callback);

    return () => {
      set.delete(callback);
      if (set.size === 0) {
        this.sseListeners.delete(code);
      }
    };
  }

  // ----------------------------------------------------
  // REST API Direct Handlers
  // ----------------------------------------------------

  public apiCreateParty(
    rawPlayerName: string,
    rawPartyName?: string,
    avatar?: string
  ): { party: ClientPartyView; sessionToken: string; code: string; playerId: string } {
    const playerName = (rawPlayerName || 'Host').trim().substring(0, 20);
    const partyName = (rawPartyName || `${playerName}'s Party`).trim().substring(0, 30);
    const partyCode = this.generatePartyCode();
    const playerId = 'p_' + Math.random().toString(36).substring(2, 9);
    const sessionToken = this.generateToken();

    const hostPlayer: Player = {
      id: playerId,
      name: playerName,
      avatar: avatar || DEFAULT_AVATARS[0],
      color: PLAYER_COLORS[0],
      isHost: true,
      isOnline: true,
      joinedAt: Date.now(),
      lastSeenAt: Date.now(),
      totalScore: 0,
      gameScore: 0,
      wins: 0,
      sessionToken
    };

    const newParty: Party = {
      id: 'pty_' + Math.random().toString(36).substring(2, 12),
      code: partyCode,
      name: partyName,
      hostId: playerId,
      isLocked: false,
      createdAt: Date.now(),
      lastActivityAt: Date.now(),
      players: { [playerId]: hostPlayer },
      chatMessages: [
        {
          id: `msg_init_${Date.now()}`,
          playerId: 'system',
          playerName: 'Game Zone',
          playerAvatar: '🎉',
          playerColor: '#8B5CF6',
          text: `Welcome to ${partyName}! Share code "${partyCode}" with friends to join.`,
          timestamp: Date.now(),
          isSystem: true
        }
      ],
      currentGame: null,
      gameStatus: 'lobby',
      gameSettings: {
        rounds: 3,
        timeLimit: 45,
        difficulty: 'normal'
      },
      currentRound: 1,
      totalRounds: 3,
      roundTimeRemaining: 0,
      gameState: null,
      gameResults: null,
      overallScoreboard: [
        {
          playerId,
          playerName,
          playerAvatar: hostPlayer.avatar,
          playerColor: hostPlayer.color,
          totalScore: 0,
          wins: 0,
          isOnline: true
        }
      ]
    };

    this.parties.set(partyCode, newParty);
    const sanitized = GameEngine.sanitizePartyForPlayer(newParty, playerId);

    return {
      party: sanitized,
      sessionToken,
      code: partyCode,
      playerId
    };
  }

  public apiJoinParty(
    rawCode: string,
    rawPlayerName: string,
    avatar?: string
  ): { party: ClientPartyView; sessionToken: string; code: string; playerId: string } {
    const code = (rawCode || '').trim().toUpperCase();
    const party = this.parties.get(code);

    if (!party) {
      throw new Error(`Party with code "${code}" does not exist or has expired.`);
    }

    if (party.isLocked) {
      throw new Error('This party is locked by the host.');
    }

    const playerName = (rawPlayerName || 'Player').trim().substring(0, 20);
    const onlinePlayers = Object.values(party.players).filter(p => p.isOnline);
    if (onlinePlayers.length >= 10) {
      throw new Error('This party is full (maximum 10 players).');
    }

    // Check if player with same name exists and is offline -> restore
    const existingPlayer = Object.values(party.players).find(
      p => p.name.toLowerCase() === playerName.toLowerCase() && !p.isOnline
    );

    let playerId: string;
    let sessionToken: string;

    if (existingPlayer) {
      playerId = existingPlayer.id;
      sessionToken = this.generateToken();
      existingPlayer.sessionToken = sessionToken;
      existingPlayer.isOnline = true;
      existingPlayer.lastSeenAt = Date.now();
      if (avatar) existingPlayer.avatar = avatar;

      party.chatMessages.push({
        id: `msg_rejoin_${Date.now()}_${Math.random()}`,
        playerId: 'system',
        playerName: 'Game Zone',
        playerAvatar: '⚡',
        playerColor: '#3B82F6',
        text: `${existingPlayer.name} reconnected to the party!`,
        timestamp: Date.now(),
        isSystem: true
      });
    } else {
      playerId = 'p_' + Math.random().toString(36).substring(2, 9);
      sessionToken = this.generateToken();
      const colorIndex = Object.keys(party.players).length % PLAYER_COLORS.length;

      const newPlayer: Player = {
        id: playerId,
        name: playerName,
        avatar: avatar || DEFAULT_AVATARS[colorIndex % DEFAULT_AVATARS.length],
        color: PLAYER_COLORS[colorIndex],
        isHost: false,
        isOnline: true,
        joinedAt: Date.now(),
        lastSeenAt: Date.now(),
        totalScore: 0,
        gameScore: 0,
        wins: 0,
        sessionToken
      };

      party.players[playerId] = newPlayer;

      party.overallScoreboard.push({
        playerId,
        playerName,
        playerAvatar: newPlayer.avatar,
        playerColor: newPlayer.color,
        totalScore: 0,
        wins: 0,
        isOnline: true
      });

      party.chatMessages.push({
        id: `msg_join_${Date.now()}_${Math.random()}`,
        playerId: 'system',
        playerName: 'Game Zone',
        playerAvatar: '👋',
        playerColor: newPlayer.color,
        text: `${playerName} joined the party!`,
        timestamp: Date.now(),
        isSystem: true
      });
    }

    party.lastActivityAt = Date.now();
    this.broadcastPartyState(party);

    const sanitized = GameEngine.sanitizePartyForPlayer(party, playerId);
    return {
      party: sanitized,
      sessionToken,
      code,
      playerId
    };
  }

  public apiRejoinParty(
    rawCode: string,
    rawPlayerName?: string,
    providedSessionToken?: string,
    providedPlayerId?: string
  ): { party: ClientPartyView; sessionToken: string; code: string; playerId: string; reconnectData?: any } {
    const code = (rawCode || '').trim().toUpperCase();
    const party = this.parties.get(code);

    if (!party) {
      throw new Error(`Party with code "${code}" does not exist or has expired.`);
    }

    const trimmedName = (rawPlayerName || '').trim();

    // 1. Direct session match
    if (providedPlayerId && providedSessionToken && party.players[providedPlayerId]) {
      const player = party.players[providedPlayerId];
      if (player.sessionToken === providedSessionToken) {
        player.isOnline = true;
        player.lastSeenAt = Date.now();
        party.lastActivityAt = Date.now();
        const reconnectData = party.currentGame ? {
          gameName: this.getGameName(party.currentGame),
          round: party.currentRound,
          totalRounds: party.totalRounds
        } : undefined;
        this.broadcastPartyState(party, providedPlayerId);
        return {
          party: GameEngine.sanitizePartyForPlayer(party, providedPlayerId),
          sessionToken: providedSessionToken,
          code,
          playerId: providedPlayerId,
          reconnectData
        };
      }
    }

    // 2. Offline match by playerId
    if (providedPlayerId && party.players[providedPlayerId]) {
      const player = party.players[providedPlayerId];
      const freshToken = this.generateToken();
      player.sessionToken = freshToken;
      player.isOnline = true;
      player.lastSeenAt = Date.now();
      party.lastActivityAt = Date.now();

      const reconnectData = party.currentGame ? {
        gameName: this.getGameName(party.currentGame),
        round: party.currentRound,
        totalRounds: party.totalRounds
      } : undefined;

      this.broadcastPartyState(party, providedPlayerId);
      return {
        party: GameEngine.sanitizePartyForPlayer(party, providedPlayerId),
        sessionToken: freshToken,
        code,
        playerId: providedPlayerId,
        reconnectData
      };
    }

    // 3. Match by name
    if (trimmedName) {
      const matchingOffline = Object.values(party.players).find(
        p => p.name.toLowerCase() === trimmedName.toLowerCase() && !p.isOnline
      );
      if (matchingOffline) {
        const freshToken = this.generateToken();
        matchingOffline.sessionToken = freshToken;
        matchingOffline.isOnline = true;
        matchingOffline.lastSeenAt = Date.now();
        party.lastActivityAt = Date.now();

        const reconnectData = party.currentGame ? {
          gameName: this.getGameName(party.currentGame),
          round: party.currentRound,
          totalRounds: party.totalRounds
        } : undefined;

        this.broadcastPartyState(party, matchingOffline.id);
        return {
          party: GameEngine.sanitizePartyForPlayer(party, matchingOffline.id),
          sessionToken: freshToken,
          code,
          playerId: matchingOffline.id,
          reconnectData
        };
      }
    }

    // 4. Fallback: join anew
    return this.apiJoinParty(code, trimmedName || 'Player');
  }

  public apiGetPartyState(code: string, playerId?: string): ClientPartyView | null {
    const party = this.parties.get(code.toUpperCase());
    if (!party) return null;
    return GameEngine.sanitizePartyForPlayer(party, playerId || '');
  }

  public apiHandleAction(
    code: string,
    playerId: string,
    sessionToken: string,
    actionType: string,
    payload: any = {}
  ): { success: boolean; error?: string } {
    const party = this.parties.get(code.toUpperCase());
    if (!party) return { success: false, error: 'Party not found' };

    const player = party.players[playerId];
    if (!player) return { success: false, error: 'Player not in party' };

    player.isOnline = true;
    player.lastSeenAt = Date.now();

    const conn: ConnectedSocket = {
      ws: null as any,
      partyCode: party.code,
      playerId: player.id,
      lastPing: Date.now()
    };

    switch (actionType) {
      case 'chat':
        this.handleChat(conn, payload.text);
        break;
      case 'update_avatar':
        this.handleUpdateAvatar(conn, payload.avatar);
        break;
      case 'select_game':
        this.handleSelectGame(conn, payload.gameType);
        break;
      case 'update_settings':
        this.handleUpdateSettings(conn, payload.settings);
        break;
      case 'start_game':
        this.handleStartGame(conn);
        break;
      case 'game_action':
        this.handleGameAction(conn, payload.action, payload.data);
        break;
      case 'next_round':
        this.handleNextRound(conn);
        break;
      case 'end_game':
        this.handleEndGame(conn);
        break;
      case 'restart_game':
        this.handleRestartGame(conn);
        break;
      case 'return_to_lobby':
        this.handleReturnToLobby(conn);
        break;
      case 'kick_player':
        this.handleKickPlayer(conn, payload.targetPlayerId);
        break;
      case 'leave_party':
        if (conn.ws) this.handleLeaveParty(conn.ws, conn);
        break;
      default:
        return { success: false, error: 'Unknown action' };
    }

    return { success: true };
  }

  private send(ws: WebSocket, message: ServerWsMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private getGameName(type: GameType): string {
    const names: Record<GameType, string> = {
      word_battle: 'Word Battle',
      secret_battle: 'Secret Battle',
      most_likely_to: 'Most Likely To',
      memory_battle: 'Memory Battle',
      solah_chits: 'Solah Chits',
      who_said_it: 'Who Said It?'
    };
    return names[type] || 'Game';
  }

  public getPartyByCode(code: string): Party | undefined {
    return this.parties.get(code.toUpperCase());
  }
}
