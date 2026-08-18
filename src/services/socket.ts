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
  private status: ConnectionStatus = 'disconnected';
  private reconnectTimer: any = null;
  private pingInterval: any = null;
  private shouldReconnect: boolean = true;
  private retryCount: number = 0;
  private maxRetries: number = 10;
  private messageQueue: ClientWsMessage[] = [];

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

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    this.setStatus(this.retryCount > 0 ? 'reconnecting' : 'connecting');

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.setStatus('connected');
        this.retryCount = 0;
        this.startPing();

        // Flush any pending queued messages
        while (this.messageQueue.length > 0) {
          const queued = this.messageQueue.shift();
          if (queued) {
            try {
              this.ws?.send(JSON.stringify(queued));
            } catch (err) {
              console.error('Error sending queued message:', err);
            }
          }
        }

        this.attemptAutoRestore();
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
        console.warn('WebSocket connection error:', err);
      };
    } catch (e) {
      console.error('Socket init error:', e);
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
          if (party && sessionToken) {
            localStorage.setItem('gamezone_party_code', party.code);
            localStorage.setItem('gamezone_player_id', party.myPlayerId);
            localStorage.setItem('gamezone_session_token', sessionToken);
            if (party.players[party.myPlayerId]) {
              localStorage.setItem('gamezone_player_name', party.players[party.myPlayerId].name);
              localStorage.setItem('gamezone_player_avatar', party.players[party.myPlayerId].avatar);
            }
          }
          this.stateListeners.forEach(fn => fn(party, sessionToken, reconnectData));

          if (reconnectData) {
            this.reconnectListeners.forEach(fn => fn(reconnectData));
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

  private attemptAutoRestore(): void {
    const code = localStorage.getItem('gamezone_party_code');
    const playerId = localStorage.getItem('gamezone_player_id');
    const sessionToken = localStorage.getItem('gamezone_session_token');

    if (code && playerId && sessionToken) {
      this.reconnect(code, sessionToken, playerId);
    }
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
      // Queue message and trigger connection
      this.messageQueue.push(msg);
      this.connect();
    }
  }

  // Action methods
  public createParty(playerName: string, partyName: string, avatar?: string): void {
    this.send({
      type: 'create_party',
      payload: { playerName, partyName, avatar }
    });
  }

  public joinParty(partyCode: string, playerName: string, avatar?: string): void {
    this.send({
      type: 'join_party',
      payload: { partyCode, playerName, avatar }
    });
  }

  public rejoinParty(partyCode: string, playerName?: string, sessionToken?: string, playerId?: string): void {
    this.send({
      type: 'rejoin_party',
      payload: { partyCode, playerName, sessionToken, playerId }
    });
  }

  public reconnect(partyCode: string, sessionToken: string, playerId: string): void {
    this.send({
      type: 'reconnect',
      payload: { partyCode, sessionToken, playerId }
    });
  }

  public updateAvatar(avatar: string): void {
    localStorage.setItem('gamezone_player_avatar', avatar);
    this.send({
      type: 'update_avatar',
      payload: { avatar }
    });
  }

  public sendChat(text: string): void {
    this.send({
      type: 'send_chat',
      payload: { text }
    });
  }

  public selectGame(gameType: GameType): void {
    this.send({
      type: 'select_game',
      payload: { gameType }
    });
  }

  public updateGameSettings(settings: Partial<GameSettings>): void {
    this.send({
      type: 'update_game_settings',
      payload: { settings }
    });
  }

  public startGame(gameType?: GameType): void {
    this.send({
      type: 'start_game',
      payload: gameType ? { gameType } : undefined
    });
  }

  public sendGameAction(action: string, data: any): void {
    this.send({
      type: 'game_action',
      payload: { action, data }
    });
  }

  public nextRound(): void {
    this.send({ type: 'next_round' });
  }

  public restartGame(): void {
    this.send({ type: 'restart_game' });
  }

  public endGame(): void {
    this.send({ type: 'end_game' });
  }

  public returnToLobby(): void {
    this.send({ type: 'return_to_lobby' });
  }

  public toggleLock(): void {
    this.send({ type: 'toggle_lock' });
  }

  public kickPlayer(targetPlayerId: string): void {
    this.send({
      type: 'kick_player',
      payload: { targetPlayerId }
    });
  }

  public leaveParty(): void {
    this.send({ type: 'leave_party' });
    this.clearSession();
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
