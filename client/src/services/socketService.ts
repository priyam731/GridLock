import { io, Socket } from "socket.io-client";
import {
  CaptureErrorPayload,
  CellUpdatedPayload,
  ClientToServerEvents,
  GameInitPayload,
  LeaderboardUpdatedPayload,
  ServerToClientEvents,
  UserJoinedPayload,
  UserPresencePayload,
} from "../types";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "/";

type GridSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

class SocketService {
  private socket: GridSocket | null = null;

  connect(): GridSocket {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ["websocket", "polling"],
        autoConnect: true,
      });
    }

    return this.socket;
  }

  disconnect(): void {
    if (!this.socket) return;
    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
  }

  emitUserJoin(name: string): void {
    this.connect().emit("user:join", { name });
  }

  emitCellCapture(cellId: string): void {
    this.connect().emit("cell:capture", { cellId });
  }

  onConnect(handler: () => void): () => void {
    const socket = this.connect();
    socket.on("connect", handler);
    return () => socket.off("connect", handler);
  }

  onDisconnect(handler: () => void): () => void {
    const socket = this.connect();
    socket.on("disconnect", handler);
    return () => socket.off("disconnect", handler);
  }

  onGameInit(handler: (payload: GameInitPayload) => void): () => void {
    const socket = this.connect();
    socket.on("game:init", handler);
    return () => socket.off("game:init", handler);
  }

  onCellUpdated(handler: (payload: CellUpdatedPayload) => void): () => void {
    const socket = this.connect();
    socket.on("cell:updated", handler);
    return () => socket.off("cell:updated", handler);
  }

  onLeaderboardUpdated(
    handler: (payload: LeaderboardUpdatedPayload) => void,
  ): () => void {
    const socket = this.connect();
    socket.on("leaderboard:updated", handler);
    return () => socket.off("leaderboard:updated", handler);
  }

  onCaptureError(handler: (payload: CaptureErrorPayload) => void): () => void {
    const socket = this.connect();
    socket.on("capture:error", handler);
    return () => socket.off("capture:error", handler);
  }

  onUserJoined(handler: (payload: UserJoinedPayload) => void): () => void {
    const socket = this.connect();
    socket.on("user:joined", handler);
    return () => socket.off("user:joined", handler);
  }

  onUserLeft(handler: (payload: UserPresencePayload) => void): () => void {
    const socket = this.connect();
    socket.on("user:left", handler);
    return () => socket.off("user:left", handler);
  }

  get connected(): boolean {
    return Boolean(this.socket?.connected);
  }
}

export const socketService = new SocketService();
