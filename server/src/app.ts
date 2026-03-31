import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from './config';
import { GridService } from './services/GridService';
import { UserService } from './services/UserService';
import { GridController } from './controllers/GridController';
import { createApiRouter } from './routes/api';
import { registerSocketHandlers } from './socket/handlers';

/**
 * Factory function that wires together Express, Socket.io, services, and routes.
 * Returns both the http server (for listening) and the express app (for testing).
 */
export function createApp() {
  const app = express();
  const httpServer = createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: config.corsOrigin,
      methods: ['GET', 'POST'],
    },
  });

  // ── Middleware ───────────────────────────────────────────────────────────────
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());

  // ── Services (singleton per server instance) ────────────────────────────────
  const gridService = new GridService();
  const userService = new UserService();

  // ── HTTP Routes ──────────────────────────────────────────────────────────────
  const gridController = new GridController(gridService, userService);
  app.use('/api', createApiRouter(gridController));

  // ── Socket.io ────────────────────────────────────────────────────────────────
  registerSocketHandlers(io, gridService, userService);

  return { app, httpServer };
}
