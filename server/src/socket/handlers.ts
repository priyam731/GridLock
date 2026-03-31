import { Server, Socket } from 'socket.io';
import { GridService } from '../services/GridService';
import { UserService } from '../services/UserService';
import { config } from '../config';

/**
 * Register all Socket.io event handlers.
 * Dependency injection keeps this testable and decoupled from service internals.
 */
export function registerSocketHandlers(
  io: Server,
  gridService: GridService,
  userService: UserService,
): void {
  io.on('connection', (socket: Socket) => {
    console.log(`[socket] connected: ${socket.id}`);

    // ── user:join ──────────────────────────────────────────────────────────────
    // Called once per session after the client connects and has a name ready.
    socket.on('user:join', (data: { name?: string }) => {
      const user = userService.createUser(data.name ?? '', socket.id);

      // Send the full game state only to the joining player
      socket.emit('game:init', {
        user,
        cells: gridService.serialize(),
        leaderboard: userService.getLeaderboard(),
        stats: {
          totalCells: gridService.totalCells,
          claimedCells: gridService.claimedCount(),
          onlinePlayers: userService.getOnlineCount(),
        },
      });

      // Broadcast arrival to all other players
      socket.broadcast.emit('user:joined', {
        userId: user.id,
        name: user.name,
        color: user.color,
        onlinePlayers: userService.getOnlineCount(),
      });

      console.log(`[socket] user joined: ${user.name} (${user.id})`);
    });

    // ── cell:capture ───────────────────────────────────────────────────────────
    // The core game action. Server validates, updates, and broadcasts.
    socket.on('cell:capture', (data: { cellId?: string }) => {
      const user = userService.getUserBySocketId(socket.id);
      if (!user) {
        socket.emit('capture:error', {
          message: 'Session not found. Please refresh the page.',
        });
        return;
      }

      if (!userService.canCapture(user.id, config.cooldownMs)) {
        const remaining = userService.getCooldownRemaining(user.id, config.cooldownMs);
        socket.emit('capture:error', {
          message: `Cooldown! ${(remaining / 1000).toFixed(1)}s remaining`,
          cooldownMs: remaining,
        });
        return;
      }

      if (!data.cellId || typeof data.cellId !== 'string') {
        socket.emit('capture:error', { message: 'Invalid cell.' });
        return;
      }

      const updatedCell = gridService.captureCell(
        data.cellId,
        user.id,
        user.name,
        user.color,
      );

      if (!updatedCell) {
        socket.emit('capture:error', { message: 'Cell not found.' });
        return;
      }

      // Record cooldown and refresh cell count
      userService.recordCapture(user.id);
      const newCount = gridService.countUserCells(user.id);
      userService.updateCellCount(user.id, newCount);

      // Broadcast cell change to ALL connected clients (including sender)
      io.emit('cell:updated', { cell: updatedCell });

      // Broadcast updated leaderboard to ALL
      io.emit('leaderboard:updated', {
        leaderboard: userService.getLeaderboard(),
        stats: {
          claimedCells: gridService.claimedCount(),
          totalCells: gridService.totalCells,
          onlinePlayers: userService.getOnlineCount(),
        },
      });
    });

    // ── disconnect ─────────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      const user = userService.getUserBySocketId(socket.id);
      if (user) {
        console.log(`[socket] user left: ${user.name} (${user.id})`);
        userService.removeUser(user.id);

        // Cells intentionally persist after disconnect (territorial feel)
        io.emit('user:left', {
          userId: user.id,
          name: user.name,
          onlinePlayers: userService.getOnlineCount(),
        });
        io.emit('leaderboard:updated', {
          leaderboard: userService.getLeaderboard(),
          stats: {
            claimedCells: gridService.claimedCount(),
            totalCells: gridService.totalCells,
            onlinePlayers: userService.getOnlineCount(),
          },
        });
      }
      console.log(`[socket] disconnected: ${socket.id}`);
    });
  });
}
