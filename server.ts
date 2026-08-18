import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer } from 'ws';
import { createServer as createViteServer } from 'vite';
import { PartyManager } from './src/server/partyManager.js';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const server = http.createServer(app);

  app.use(express.json());

  const partyManager = new PartyManager();

  // Attach WebSocket Server to the same HTTP server
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

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

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
