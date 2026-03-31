import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/User';
import { Leaderboard, LeaderboardEntry } from '../models/Leaderboard';
import { PLAYER_COLORS } from '../utils/colors';

/**
 * UserService manages the lifecycle of connected players:
 * creation, color assignment, cooldown tracking, and leaderboard computation.
 */
export class UserService {
  private readonly users: Map<string, User> = new Map();
  /** Track which colors are in use to avoid duplicates where possible */
  private readonly usedColors: Set<string> = new Set();

  /** Create a new user on socket connect + join */
  createUser(rawName: string, socketId: string): User {
    const id = uuidv4();
    const name = this.sanitizeName(rawName, id);
    const color = this.assignColor();

    const user: User = {
      id,
      name,
      color,
      cellCount: 0,
      joinedAt: Date.now(),
      lastCaptureAt: 0,
      socketId,
    };

    this.users.set(id, user);
    return user;
  }

  getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserBySocketId(socketId: string): User | undefined {
    for (const user of this.users.values()) {
      if (user.socketId === socketId) return user;
    }
    return undefined;
  }

  removeUser(id: string): void {
    const user = this.users.get(id);
    if (user) {
      this.usedColors.delete(user.color);
      this.users.delete(id);
    }
  }

  updateCellCount(userId: string, count: number): void {
    const user = this.users.get(userId);
    if (user) user.cellCount = count;
  }

  /**
   * Check if the user is past their capture cooldown.
   * Enforced server-side — client-side cooldown is only cosmetic.
   */
  canCapture(userId: string, cooldownMs: number): boolean {
    const user = this.users.get(userId);
    if (!user) return false;
    return Date.now() - user.lastCaptureAt >= cooldownMs;
  }

  getCooldownRemaining(userId: string, cooldownMs: number): number {
    const user = this.users.get(userId);
    if (!user) return 0;
    return Math.max(0, cooldownMs - (Date.now() - user.lastCaptureAt));
  }

  recordCapture(userId: string): void {
    const user = this.users.get(userId);
    if (user) user.lastCaptureAt = Date.now();
  }

  /** Return top-10 players sorted by cell count, with rank */
  getLeaderboard(): Leaderboard {
    return Array.from(this.users.values())
      .sort((a, b) => b.cellCount - a.cellCount)
      .slice(0, 10)
      .map(
        (user, index): LeaderboardEntry => ({
          userId: user.id,
          name: user.name,
          color: user.color,
          cellCount: user.cellCount,
          rank: index + 1,
        }),
      );
  }

  getOnlineCount(): number {
    return this.users.size;
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private sanitizeName(raw: string, fallbackId: string): string {
    const trimmed = raw.trim().slice(0, 20);
    if (trimmed.length === 0) {
      return `Player${fallbackId.slice(0, 4).toUpperCase()}`;
    }
    return trimmed;
  }

  private assignColor(): string {
    const available = PLAYER_COLORS.filter((c) => !this.usedColors.has(c));
    const palette = available.length > 0 ? available : [...PLAYER_COLORS];
    const color = palette[Math.floor(Math.random() * palette.length)];
    this.usedColors.add(color);
    return color;
  }
}
