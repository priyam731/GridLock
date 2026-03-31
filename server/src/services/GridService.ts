import { config } from '../config';
import { Cell } from '../models/Cell';

/**
 * GridService owns the authoritative in-memory grid state.
 * All mutations go through this service to keep consistency.
 */
export class GridService {
  private readonly grid: Map<string, Cell> = new Map();

  constructor() {
    this.initializeGrid();
  }

  /** Populate the grid with empty cells on startup */
  private initializeGrid(): void {
    for (let y = 0; y < config.gridRows; y++) {
      for (let x = 0; x < config.gridCols; x++) {
        const id = `${x}_${y}`;
        this.grid.set(id, {
          id,
          x,
          y,
          ownerId: null,
          ownerName: null,
          ownerColor: null,
          capturedAt: null,
        });
      }
    }
  }

  getCell(id: string): Cell | undefined {
    return this.grid.get(id);
  }

  /**
   * Atomically capture a cell. Returns the updated cell, or null if the id is invalid.
   * Node.js single-threaded event loop ensures no race conditions.
   */
  captureCell(
    cellId: string,
    ownerId: string,
    ownerName: string,
    ownerColor: string,
  ): Cell | null {
    const cell = this.grid.get(cellId);
    if (!cell) return null;

    const updated: Cell = {
      ...cell,
      ownerId,
      ownerName,
      ownerColor,
      capturedAt: Date.now(),
    };

    this.grid.set(cellId, updated);
    return updated;
  }

  /** Count how many cells a user currently owns */
  countUserCells(userId: string): number {
    let count = 0;
    this.grid.forEach((cell) => {
      if (cell.ownerId === userId) count++;
    });
    return count;
  }

  /** Serialize the full grid to an array for transmission */
  serialize(): Cell[] {
    return Array.from(this.grid.values());
  }

  /** Total number of claimed cells across all users */
  claimedCount(): number {
    let count = 0;
    this.grid.forEach((cell) => {
      if (cell.ownerId !== null) count++;
    });
    return count;
  }

  get totalCells(): number {
    return config.gridCols * config.gridRows;
  }
}
