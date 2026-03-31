import { Request, Response } from 'express';
import { GridService } from '../services/GridService';
import { UserService } from '../services/UserService';

/**
 * GridController handles REST endpoints.
 * Real-time updates are handled by the Socket.io layer, not here.
 */
export class GridController {
  constructor(
    private readonly gridService: GridService,
    private readonly userService: UserService,
  ) {}

  /** GET /api/grid — full snapshot of the current grid state */
  getGrid = (_req: Request, res: Response): void => {
    res.json({
      cells: this.gridService.serialize(),
      leaderboard: this.userService.getLeaderboard(),
      stats: {
        totalCells: this.gridService.totalCells,
        claimedCells: this.gridService.claimedCount(),
        onlinePlayers: this.userService.getOnlineCount(),
      },
    });
  };

  /** GET /api/stats — lightweight stats without full grid payload */
  getStats = (_req: Request, res: Response): void => {
    res.json({
      leaderboard: this.userService.getLeaderboard(),
      stats: {
        totalCells: this.gridService.totalCells,
        claimedCells: this.gridService.claimedCount(),
        onlinePlayers: this.userService.getOnlineCount(),
      },
    });
  };
}
