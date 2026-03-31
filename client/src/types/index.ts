export interface Cell {
  id: string;
  x: number;
  y: number;
  ownerId: string | null;
  ownerName: string | null;
  ownerColor: string | null;
  capturedAt: number | null;
}

export interface User {
  id: string;
  name: string;
  color: string;
  cellCount: number;
  joinedAt: number;
  lastCaptureAt?: number;
  socketId?: string;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  color: string;
  cellCount: number;
  rank: number;
}

export interface GridStats {
  totalCells: number;
  claimedCells: number;
  onlinePlayers: number;
}

export interface GameInitPayload {
  user: User;
  cells: Cell[];
  leaderboard: LeaderboardEntry[];
  stats: GridStats;
}

export interface CellUpdatedPayload {
  cell: Cell;
}

export interface LeaderboardUpdatedPayload {
  leaderboard: LeaderboardEntry[];
  stats: GridStats;
}

export interface CaptureErrorPayload {
  message: string;
  cooldownMs?: number;
}

export interface UserPresencePayload {
  userId: string;
  name: string;
  onlinePlayers: number;
}

export interface UserJoinedPayload extends UserPresencePayload {
  color: string;
}

export interface ClientToServerEvents {
  "user:join": (payload: { name: string }) => void;
  "cell:capture": (payload: { cellId: string }) => void;
}

export interface ServerToClientEvents {
  "game:init": (payload: GameInitPayload) => void;
  "cell:updated": (payload: CellUpdatedPayload) => void;
  "leaderboard:updated": (payload: LeaderboardUpdatedPayload) => void;
  "capture:error": (payload: CaptureErrorPayload) => void;
  "user:joined": (payload: UserJoinedPayload) => void;
  "user:left": (payload: UserPresencePayload) => void;
}

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

export interface GameState {
  user: User | null;
  cells: Map<string, Cell>;
  leaderboard: LeaderboardEntry[];
  stats: GridStats;
  status: ConnectionStatus;
  cooldownEndTime: number;
  recentlyUpdatedCells: Set<string>;
  errorMessage: string | null;
}
