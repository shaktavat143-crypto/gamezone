import {
  ClientPartyView,
  ClientWsMessage,
  ServerWsMessage,
  ChatMessage,
  GameType,
  GameSettings,
  ConnectionStatus,
  GameResultItem
} from '../types.js';

type StateListener = (party: ClientPartyView | null, sessionToken?: string, reconnectData?: any) => void;
type ErrorListener = (error: string) => void;
type ChatListener = (message: ChatMessage) => void;
type NotificationListener = (notification: { text: string; type: string }) => void;
type ConnectionListener = (status: ConnectionStatus) => void;
type GameOverListener = (results: GameResultItem[]) => void;
type ReconnectListener = (data: { gameName: string; round: number; totalRounds: number }) => void;

class SocketClient {
  private ws: WebSocket | null = null;
  private eventSource: EventSource | null = null;
  private pollInterval: any = null;
  private status: ConnectionStatus = 'disconnected';
  private reconnectTimer: any = null;
  private pingInterval: any = null;
  private shouldReconnect: boolean = true;
  private retryCount: number = 0;
  private maxRetries: number = 10;
  private messageQueue: ClientWsMessage[] = [];

  private currentPartyCode: string | null = null;
  private currentPlayerId: string | null = null;

  private stateListeners: Set<StateListener> = new Set();
  private errorListeners: Set<ErrorListener> = new Set();
  private chatListeners: Set<ChatListener> = new Set();
  private notificationListeners: Set<NotificationListener> = new Set();
  private connectionListeners: Set<ConnectionListener> = new Set();
  private gameOverListeners: Set<GameOverListener> = new Set();
  private reconnectListeners: Set<ReconnectListener> = new Set();

  public connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;

      this.setStatus(this.retryCount > 0 ? 'reconnecting' : 'connecting');
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[SocketService] 🟢 WebSocket connection established');
        this.setStatus('connected');
        this.retryCount = 0;
        this.startPing();

        // Only auto-reconnect if we are already actively in a party in memory (e.g. temporary network blip).
        // Fresh visits or reloads stay on Home so the user can explicitly click Rejoin without popups.
        const partyCode = this.currentPartyCode;
        const playerId = this.currentPlayerId;
        const sessionToken = this.currentPartyCode ? localStorage.getItem('gamezone_session_token') : null;

        if (partyCode && playerId && sessionToken) {
          console.log('[SocketService] 🔄 Auto-identifying socket with active party:', { partyCode, playerId });
          this.send({
            type: 'reconnect',
            payload: { partyCode, playerId, sessionToken }
          });
        }

        // Flush any pending queued messages
        while (this.messageQueue.length > 0) {
          const queued = this.messageQueue.shift();
          if (queued) {
            try {
              console.log('[SocketService] 📤 Flushing queued message:', queued.type);
              this.ws?.send(JSON.stringify(queued));
            } catch (err) {
              console.error('[SocketService] ❌ Error sending queued message:', err);
            }
          }
        }
      };

      this.ws.onmessage = (event) => {
        this.handleServerMessage(event.data);
      };

      this.ws.onclose = () => {
        this.stopPing();
        if (this.shouldReconnect) {
          this.setStatus('reconnecting');
          this.scheduleReconnect();
        } else {
          this.setStatus('disconnected');
        }
      };

      this.ws.onerror = (err) => {
        console.warn('WebSocket connection attempt encountered error, fallback active:', err);
      };
    } catch (e) {
      console.warn('Socket init fallback:', e);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.retryCount >= this.maxRetries) {
      this.setStatus('disconnected');
      return;
    }

    const delay = Math.min(1000 * Math.pow(1.5, this.retryCount), 10000);
    this.retryCount++;

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private startPing(): void {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      this.send({ type: 'ping' });
    }, 20000);
  }

  private stopPing(): void {
    if (this.pingInterval) clearInterval(this.pingInterval);
  }

  private setStatus(newStatus: ConnectionStatus): void {
    this.status = newStatus;
    this.connectionListeners.forEach(fn => fn(newStatus));
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  private handleServerMessage(rawData: string): void {
    try {
      const msg = JSON.parse(rawData) as ServerWsMessage;

      switch (msg.type) {
        case 'party_state': {
          const { party, sessionToken, reconnectData } = msg.payload;
          if (party) {
            this.handlePartyStateReceived(party, sessionToken, reconnectData);
          }
          break;
        }

        case 'game_ended': {
          const { gameResults } = msg.payload;
          this.gameOverListeners.forEach(fn => fn(gameResults));
          break;
        }

        case 'error': {
          const errorMsg = typeof msg.payload === 'object' && msg.payload?.message ? msg.payload.message : String(msg.payload || 'An error occurred');
          this.errorListeners.forEach(fn => fn(errorMsg));
          break;
        }

        case 'chat_message': {
          this.chatListeners.forEach(fn => fn(msg.payload.message));
          break;
        }

        case 'player_notification': {
          this.notificationListeners.forEach(fn => fn(msg.payload));
          break;
        }

        case 'pong':
          break;
      }
    } catch (e) {
      console.error('Failed to parse WS server message:', e);
    }
  }

  private handlePartyStateReceived(party: ClientPartyView, sessionToken?: string, reconnectData?: any): void {
    this.currentPartyCode = party.code;
    this.currentPlayerId = party.myPlayerId;

    localStorage.setItem('gamezone_party_code', party.code);
    localStorage.setItem('gamezone_player_id', party.myPlayerId);
    if (sessionToken) {
      localStorage.setItem('gamezone_session_token', sessionToken);
    }
    if (party.players[party.myPlayerId]) {
      localStorage.setItem('gamezone_player_name', party.players[party.myPlayerId].name);
      localStorage.setItem('gamezone_player_avatar', party.players[party.myPlayerId].avatar);
    }

    this.setStatus('connected');
    this.stateListeners.forEach(fn => fn(party, sessionToken, reconnectData));

    if (reconnectData) {
      this.reconnectListeners.forEach(fn => fn(reconnectData));
    }

    // Start background SSE and polling synchronization
    this.setupRealtimeSync(party.code, party.myPlayerId);
  }

  private setupRealtimeSync(partyCode: string, playerId: string): void {
    // 1. Setup Server-Sent Events (SSE)
    if (typeof EventSource !== 'undefined') {
      if (this.eventSource) {
        this.eventSource.close();
      }

      try {
        const sseUrl = `/api/party/${partyCode}/events?playerId=${encodeURIComponent(playerId)}`;
        const es = new EventSource(sseUrl);

        es.addEventListener('party_state', (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.party) {
              this.stateListeners.forEach(fn => fn(data.party));
            }
          } catch (err) {}
        });

        es.addEventListener('chat_message', (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.message) {
              this.chatListeners.forEach(fn => fn(data.message));
            }
          } catch (err) {}
        });

        es.addEventListener('game_ended', (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.gameResults) {
              this.gameOverListeners.forEach(fn => fn(data.gameResults));
            }
          } catch (err) {}
        });

        es.onerror = () => {
          // SSE will auto-reconnect or fallback to polling
        };

        this.eventSource = es;
      } catch (err) {
        console.warn('SSE not supported or failed to initialize:', err);
      }
    }

    // 2. Setup short-poll fallback (1.5s interval)
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = setInterval(async () => {
      if (!this.currentPartyCode || !this.currentPlayerId) return;
      try {
        const res = await fetch(`/api/party/${this.currentPartyCode}/state?playerId=${encodeURIComponent(this.currentPlayerId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.party) {
            this.stateListeners.forEach(fn => fn(data.party));
          }
        }
      } catch (err) {
        // silent poll error
      }
    }, 1500);
  }

  public send(msg: ClientWsMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(msg));
      } catch (err) {
        console.error('Failed to send WS message, queuing:', err);
        this.messageQueue.push(msg);
        this.connect();
      }
    } else {
      this.messageQueue.push(msg);
      this.connect();
    }
  }

  // ----------------------------------------------------
  // Action Methods (Direct HTTP + WS Hybrid)
  // ----------------------------------------------------

  public async createParty(playerName: string, partyName: string, avatar?: string): Promise<void> {
    const cleanPlayerName = playerName.trim() || 'Player';
    const cleanPartyName = partyName.trim() || `${cleanPlayerName}'s Party`;
    const payload = { playerName: cleanPlayerName, partyName: cleanPartyName, avatar };

    console.log('[SocketService.createParty] 🚀 Initiating party creation with payload:', payload);

    // 1. Direct HTTP API Call (guarantees 100% instant creation)
    try {
      const res = await fetch('/api/party/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.party) {
        console.log('[SocketService.createParty] ✅ Party created successfully via HTTP API:', {
          code: data.code,
          playerId: data.playerId,
          sessionToken: data.sessionToken ? 'present' : 'missing'
        });
        this.handlePartyStateReceived(data.party, data.sessionToken);
        this.connect();
        return;
      } else {
        const errorMsg = data.error || `HTTP error ${res.status}: Failed to create party`;
        console.error('[SocketService.createParty] ❌ API responded with error:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      console.warn('[SocketService.createParty] ⚠️ HTTP API call failed, dispatching WebSocket fallback & notifying listeners:', err);
      // Fallback via WS
      this.send({
        type: 'create_party',
        payload
      });
      const userMessage = err.message || 'Failed to create party. Please check your connection and try again.';
      this.errorListeners.forEach(fn => fn(userMessage));
      throw err;
    }
  }

  public async joinParty(partyCode: string, playerName: string, avatar?: string): Promise<void> {
    const cleanCode = partyCode.trim().toUpperCase();
    const cleanPlayerName = playerName.trim() || 'Player';
    const payload = { partyCode: cleanCode, playerName: cleanPlayerName, avatar };

    console.log('[SocketService.joinParty] 🚀 Initiating party join with payload:', payload);

    if (!cleanCode) {
      const errorMsg = 'Please provide a valid 6-letter party code';
      console.error('[SocketService.joinParty] ❌ Validation error:', errorMsg);
      this.errorListeners.forEach(fn => fn(errorMsg));
      throw new Error(errorMsg);
    }

    // 1. Direct HTTP API Call
    try {
      const res = await fetch('/api/party/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.party) {
        console.log('[SocketService.joinParty] ✅ Party joined successfully via HTTP API:', {
          code: data.code,
          playerId: data.playerId,
          partyName: data.party.name
        });
        this.handlePartyStateReceived(data.party, data.sessionToken);
        this.connect();
        return;
      } else {
        const errorMsg = data.error || `HTTP error ${res.status}: Could not join party`;
        console.error('[SocketService.joinParty] ❌ API responded with error:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      console.warn('[SocketService.joinParty] ⚠️ HTTP join failed, attempting WebSocket fallback:', err);
      this.send({
        type: 'join_party',
        payload
      });
      const userMessage = err.message || 'Could not join party. Check the code and try again.';
      this.errorListeners.forEach(fn => fn(userMessage));
      throw err;
    }
  }

  public async rejoinParty(partyCode: string, playerName?: string, sessionToken?: string, playerId?: string, isSilentReconnect = false): Promise<void> {
    const cleanCode = partyCode.trim().toUpperCase();
    const payload = { partyCode: cleanCode, playerName, sessionToken, playerId };

    console.log('[SocketService.rejoinParty] 🚀 Rejoining party with payload:', payload);

    if (!cleanCode) {
      const errorMsg = 'Please enter a valid party code';
      if (!isSilentReconnect) {
        this.errorListeners.forEach(fn => fn(errorMsg));
      }
      throw new Error(errorMsg);
    }

    // 1. Direct HTTP API Call
    try {
      const res = await fetch('/api/party/rejoin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.party) {
        console.log('[SocketService.rejoinParty] ✅ Party rejoined successfully via HTTP API:', {
          code: data.code,
          playerId: data.playerId
        });
        this.handlePartyStateReceived(data.party, data.sessionToken, data.reconnectData);
        this.connect();
        return;
      } else {
        const errorMsg = data.error || `HTTP error ${res.status}: Failed to rejoin party`;
        if (data.error && (data.error.includes('does not exist') || data.error.includes('expired'))) {
          // Clear stale stored party session so we don't keep retrying a non-existent party
          localStorage.removeItem('gamezone_party_code');
          localStorage.removeItem('gamezone_session_token');
          localStorage.removeItem('gamezone_player_id');
        }
        if (!isSilentReconnect) {
          this.errorListeners.forEach(fn => fn(errorMsg));
        }
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      if (isSilentReconnect) {
        // Clean up stale session quietly
        localStorage.removeItem('gamezone_party_code');
        localStorage.removeItem('gamezone_session_token');
        localStorage.removeItem('gamezone_player_id');
        return;
      }
      console.warn('[SocketService.rejoinParty] ⚠️ HTTP rejoin failed, attempting WebSocket fallback:', err);
      this.send({
        type: 'rejoin_party',
        payload
      });
      const userMessage = err.message || 'Could not rejoin party. Check the code and try again.';
      this.errorListeners.forEach(fn => fn(userMessage));
      throw err;
    }
  }

  public async reconnect(partyCode: string, sessionToken: string, playerId: string): Promise<void> {
    try {
      await this.rejoinParty(partyCode, undefined, sessionToken, playerId, true);
    } catch (e) {
      // Silently clear stale keys on failed auto-reconnect
      localStorage.removeItem('gamezone_party_code');
      localStorage.removeItem('gamezone_session_token');
      localStorage.removeItem('gamezone_player_id');
    }
  }

  private async dispatchAction(actionType: string, payload: any = {}): Promise<void> {
    const code = this.currentPartyCode || localStorage.getItem('gamezone_party_code');
    const playerId = this.currentPlayerId || localStorage.getItem('gamezone_player_id');
    const sessionToken = localStorage.getItem('gamezone_session_token') || '';

    // Always attempt WS send
    this.send({
      type: actionType as any,
      payload
    });

    // Also send HTTP action for guaranteed delivery
    if (code && playerId) {
      try {
        await fetch(`/api/party/${code}/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId, sessionToken, actionType, payload })
        });
      } catch (e) {
        // fallback to WS
      }
    }
  }

  public updateAvatar(avatar: string): void {
    localStorage.setItem('gamezone_player_avatar', avatar);
    this.dispatchAction('update_avatar', { avatar });
  }

  public sendChat(text: string): void {
    this.dispatchAction('chat', { text });
  }

  public selectGame(gameType: GameType): void {
    this.dispatchAction('select_game', { gameType });
  }

  public updateGameSettings(settings: Partial<GameSettings>): void {
    this.dispatchAction('update_settings', { settings });
  }

  public startGame(gameType?: GameType): void {
    this.dispatchAction('start_game', gameType ? { gameType } : {});
  }

  public sendGameAction(action: string, data: any = {}): void {
    this.dispatchAction('game_action', { action, data });
  }

  public nextRound(): void {
    this.dispatchAction('next_round');
  }

  public restartGame(): void {
    this.dispatchAction('restart_game');
  }

  public endGame(): void {
    this.dispatchAction('end_game');
  }

  public returnToLobby(): void {
    this.dispatchAction('return_to_lobby');
  }

  public toggleLock(): void {
    this.dispatchAction('toggle_lock');
  }

  public kickPlayer(targetPlayerId: string): void {
    this.dispatchAction('kick_player', { targetPlayerId });
  }

  public leaveParty(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.dispatchAction('leave_party');
    this.clearSession();
    this.currentPartyCode = null;
    this.currentPlayerId = null;
    this.stateListeners.forEach(fn => fn(null as any));
  }

  public clearSession(): void {
    localStorage.removeItem('gamezone_party_code');
    localStorage.removeItem('gamezone_player_id');
    localStorage.removeItem('gamezone_session_token');
  }

  // Subscription methods
  public subscribeParty(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  public subscribeConnectionStatus(listener: ConnectionListener): () => void {
    this.connectionListeners.add(listener);
    return () => this.connectionListeners.delete(listener);
  }

  public subscribeGameOver(listener: GameOverListener): () => void {
    this.gameOverListeners.add(listener);
    return () => this.gameOverListeners.delete(listener);
  }

  public subscribeError(listener: ErrorListener): () => void {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  public subscribeReconnect(listener: ReconnectListener): () => void {
    this.reconnectListeners.add(listener);
    return () => this.reconnectListeners.delete(listener);
  }

  public subscribeChat(listener: ChatListener): () => void {
    this.chatListeners.add(listener);
    return () => this.chatListeners.delete(listener);
  }

  public subscribeNotification(listener: NotificationListener): () => void {
    this.notificationListeners.add(listener);
    return () => this.notificationListeners.delete(listener);
  }
}

export const socketService = new SocketClient();
