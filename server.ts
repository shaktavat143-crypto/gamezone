import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer } from 'ws';
import { createServer as createViteServer } from 'vite';
import { PartyManager } from './src/server/partyManager.js';

async function startServer() {
  const app = express();
  const PORT = 3000;
  const server = http.createServer(app);

  app.use(express.json());

  const partyManager = new PartyManager();

  // Attach WebSocket Server to HTTP server
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    partyManager.registerSocket(ws);

    ws.on('message', (data) => {
      partyManager.handleMessage(ws, data.toString());
    });

    ws.on('close', () => {
      partyManager.unregisterSocket(ws);
    });

    ws.on('error', (err) => {
      console.error('WS client error:', err);
      partyManager.unregisterSocket(ws);
    });
  });

  // ----------------------------------------------------
  // REST API Routes (Rock-solid fallback & instant ops)
  // ----------------------------------------------------

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // Create Party
  app.post('/api/party/create', (req, res) => {
    try {
      const { playerName, partyName, avatar } = req.body || {};
      console.log('[Server API /api/party/create] 📥 Request payload:', { playerName, partyName, avatar });
      const result = partyManager.apiCreateParty(playerName, partyName, avatar);
      console.log('[Server API /api/party/create] 📤 Success! Generated room:', {
        code: result.code,
        playerId: result.playerId
      });
      res.json({ success: true, ...result });
    } catch (err: any) {
      console.error('[Server API /api/party/create] ❌ Error creating party:', err);
      res.status(400).json({ success: false, error: err.message || 'Failed to create party' });
    }
  });

  // Join Party
  app.post('/api/party/join', (req, res) => {
    try {
      const { partyCode, playerName, avatar } = req.body || {};
      console.log('[Server API /api/party/join] 📥 Request payload:', { partyCode, playerName, avatar });
      const result = partyManager.apiJoinParty(partyCode, playerName, avatar);
      console.log('[Server API /api/party/join] 📤 Success! Player joined room:', {
        code: result.code,
        playerId: result.playerId
      });
      res.json({ success: true, ...result });
    } catch (err: any) {
      console.error('[Server API /api/party/join] ❌ Error joining party:', err);
      res.status(400).json({ success: false, error: err.message || 'Failed to join party' });
    }
  });

  // Rejoin Party
  app.post('/api/party/rejoin', (req, res) => {
    try {
      const { partyCode, playerName, sessionToken, playerId } = req.body || {};
      console.log('[Server API /api/party/rejoin] 📥 Request payload:', { partyCode, playerName, playerId, hasToken: !!sessionToken });
      const result = partyManager.apiRejoinParty(partyCode, playerName, sessionToken, playerId);
      console.log('[Server API /api/party/rejoin] 📤 Success! Reconnected player:', {
        code: result.code,
        playerId: result.playerId
      });
      res.json({ success: true, ...result });
    } catch (err: any) {
      console.error('[Server API /api/party/rejoin] ❌ Error rejoining party:', err);
      res.status(400).json({ success: false, error: err.message || 'Failed to rejoin party' });
    }
  });

  // Get Party State
  app.get('/api/party/:code/state', (req, res) => {
    const code = req.params.code.toUpperCase();
    const playerId = (req.query.playerId as string) || '';
    const party = partyManager.apiGetPartyState(code, playerId);
    if (!party) {
      return res.status(404).json({ success: false, error: 'Party not found' });
    }
    res.json({ success: true, party });
  });

  // Party Action (Chat, Settings, Game start, Game action, etc.)
  app.post('/api/party/:code/action', (req, res) => {
    try {
      const code = req.params.code.toUpperCase();
      const { playerId, sessionToken, actionType, payload } = req.body || {};
      const result = partyManager.apiHandleAction(code, playerId, sessionToken, actionType, payload);
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Action failed' });
    }
  });

  // Server-Sent Events (SSE) stream for instant real-time synchronization
  app.get('/api/party/:code/events', (req, res) => {
    const code = req.params.code.toUpperCase();
    const playerId = (req.query.playerId as string) || '';

    const initialParty = partyManager.apiGetPartyState(code, playerId);
    if (!initialParty) {
      return res.status(404).json({ error: 'Party not found' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Send initial state
    res.write(`event: party_state\ndata: ${JSON.stringify({ party: initialParty })}\n\n`);

    const unregister = partyManager.registerSseListener(code, (event, data) => {
      try {
        let payloadToSend = data;
        if (event === 'party_state' && data.party) {
          const sanitized = partyManager.apiGetPartyState(code, playerId);
          payloadToSend = { party: sanitized };
        }
        res.write(`event: ${event}\ndata: ${JSON.stringify(payloadToSend)}\n\n`);
      } catch (err) {
        // Stream closed
      }
    });

    // Keep connection alive with ping every 15 seconds
    const keepAlive = setInterval(() => {
      res.write(': keepalive\n\n');
    }, 15000);

    req.on('close', () => {
      clearInterval(keepAlive);
      unregister();
    });
  });

  // Public Party Info
  app.get('/api/party/:code', (req, res) => {
    const code = req.params.code.toUpperCase();
    const party = partyManager.getPartyByCode(code);
    if (!party) {
      return res.status(404).json({ error: 'Party not found' });
    }
    const onlineCount = Object.values(party.players).filter(p => p.isOnline).length;
    res.json({
      code: party.code,
      name: party.name,
      isLocked: party.isLocked,
      playerCount: onlineCount,
      currentGame: party.currentGame,
      status: party.gameStatus
    });
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🎮 GAME ZONE Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
