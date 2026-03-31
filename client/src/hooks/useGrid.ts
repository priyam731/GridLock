import { useCallback, useEffect, useReducer } from "react";
import { socketService } from "../services/socketService";
import {
  Cell,
  GameInitPayload,
  GameState,
  GridStats,
  LeaderboardUpdatedPayload,
} from "../types";

const DEFAULT_STATS: GridStats = {
  totalCells: 100,
  claimedCells: 0,
  onlinePlayers: 0,
};

const LOCAL_CAPTURE_COOLDOWN_MS = 3000;
const RECENTLY_UPDATED_MS = 600;

const initialState: GameState = {
  user: null,
  cells: new Map<string, Cell>(),
  leaderboard: [],
  stats: DEFAULT_STATS,
  status: "connecting",
  cooldownEndTime: 0,
  recentlyUpdatedCells: new Set<string>(),
  errorMessage: null,
};

type GridAction =
  | { type: "SET_STATUS"; status: GameState["status"] }
  | { type: "INIT_GAME"; payload: GameInitPayload }
  | { type: "UPDATE_CELL"; cell: Cell }
  | { type: "CLEAR_RECENT"; cellId: string }
  | { type: "UPDATE_LEADERBOARD"; payload: LeaderboardUpdatedPayload }
  | { type: "SET_ONLINE_PLAYERS"; onlinePlayers: number }
  | { type: "SET_ERROR"; message: string }
  | { type: "CLEAR_ERROR" }
  | { type: "SET_COOLDOWN_END"; cooldownEndTime: number };

function countCellsOwned(cells: Map<string, Cell>, userId: string): number {
  let count = 0;
  cells.forEach((cell) => {
    if (cell.ownerId === userId) count += 1;
  });
  return count;
}

function gridReducer(state: GameState, action: GridAction): GameState {
  switch (action.type) {
    case "SET_STATUS":
      return {
        ...state,
        status: action.status,
      };

    case "INIT_GAME": {
      const cells = new Map(
        action.payload.cells.map((cell) => [cell.id, cell]),
      );
      const userCellCount = countCellsOwned(cells, action.payload.user.id);

      return {
        ...state,
        user: {
          ...action.payload.user,
          cellCount: userCellCount,
        },
        cells,
        leaderboard: action.payload.leaderboard,
        stats: action.payload.stats,
        status: "connected",
        errorMessage: null,
      };
    }

    case "UPDATE_CELL": {
      const cells = new Map(state.cells);
      cells.set(action.cell.id, action.cell);

      const recentlyUpdatedCells = new Set(state.recentlyUpdatedCells);
      recentlyUpdatedCells.add(action.cell.id);

      const nextUser = state.user
        ? {
            ...state.user,
            cellCount: countCellsOwned(cells, state.user.id),
          }
        : null;

      return {
        ...state,
        cells,
        user: nextUser,
        recentlyUpdatedCells,
      };
    }

    case "CLEAR_RECENT": {
      if (!state.recentlyUpdatedCells.has(action.cellId)) return state;

      const recentlyUpdatedCells = new Set(state.recentlyUpdatedCells);
      recentlyUpdatedCells.delete(action.cellId);

      return {
        ...state,
        recentlyUpdatedCells,
      };
    }

    case "UPDATE_LEADERBOARD": {
      const leaderboardEntry = state.user
        ? action.payload.leaderboard.find(
            (entry) => entry.userId === state.user?.id,
          )
        : undefined;

      return {
        ...state,
        leaderboard: action.payload.leaderboard,
        stats: action.payload.stats,
        user: state.user
          ? {
              ...state.user,
              cellCount: leaderboardEntry?.cellCount ?? state.user.cellCount,
            }
          : null,
      };
    }

    case "SET_ONLINE_PLAYERS":
      return {
        ...state,
        stats: {
          ...state.stats,
          onlinePlayers: action.onlinePlayers,
        },
      };

    case "SET_ERROR":
      return {
        ...state,
        errorMessage: action.message,
      };

    case "CLEAR_ERROR":
      return {
        ...state,
        errorMessage: null,
      };

    case "SET_COOLDOWN_END":
      return {
        ...state,
        cooldownEndTime: action.cooldownEndTime,
      };

    default:
      return state;
  }
}

export function useGrid(playerName: string | null) {
  const [state, dispatch] = useReducer(gridReducer, initialState);

  useEffect(() => {
    if (!playerName) return;

    const timeoutIds = new Set<number>();
    const cleanups: Array<() => void> = [];

    const markConnected = () => {
      dispatch({ type: "SET_STATUS", status: "connected" });
    };

    const markDisconnected = () => {
      dispatch({ type: "SET_STATUS", status: "disconnected" });
    };

    const setOnlinePlayers = (onlinePlayers: number) => {
      dispatch({ type: "SET_ONLINE_PLAYERS", onlinePlayers });
    };

    cleanups.push(socketService.onConnect(markConnected));
    cleanups.push(socketService.onDisconnect(markDisconnected));

    cleanups.push(
      socketService.onGameInit((payload) => {
        dispatch({ type: "INIT_GAME", payload });
      }),
    );

    cleanups.push(
      socketService.onCellUpdated(({ cell }) => {
        dispatch({ type: "UPDATE_CELL", cell });

        const timeoutId = window.setTimeout(() => {
          dispatch({ type: "CLEAR_RECENT", cellId: cell.id });
          timeoutIds.delete(timeoutId);
        }, RECENTLY_UPDATED_MS);

        timeoutIds.add(timeoutId);
      }),
    );

    cleanups.push(
      socketService.onLeaderboardUpdated((payload) => {
        dispatch({ type: "UPDATE_LEADERBOARD", payload });
      }),
    );

    cleanups.push(
      socketService.onCaptureError(({ message, cooldownMs }) => {
        dispatch({ type: "SET_ERROR", message });
        if (cooldownMs && cooldownMs > 0) {
          dispatch({
            type: "SET_COOLDOWN_END",
            cooldownEndTime: Date.now() + cooldownMs,
          });
        }
      }),
    );

    cleanups.push(
      socketService.onUserJoined(({ onlinePlayers }) => {
        setOnlinePlayers(onlinePlayers);
      }),
    );

    cleanups.push(
      socketService.onUserLeft(({ onlinePlayers }) => {
        setOnlinePlayers(onlinePlayers);
      }),
    );

    const socket = socketService.connect();
    dispatch({
      type: "SET_STATUS",
      status: socket.connected ? "connected" : "connecting",
    });
    socketService.emitUserJoin(playerName);

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      timeoutIds.forEach((id) => window.clearTimeout(id));
      timeoutIds.clear();
      socketService.disconnect();
    };
  }, [playerName]);

  const captureCell = useCallback(
    (cellId: string) => {
      if (!state.user) return;

      if (state.status !== "connected") {
        dispatch({
          type: "SET_ERROR",
          message: "Connection interrupted. Reconnecting...",
        });
        return;
      }

      const now = Date.now();
      if (state.cooldownEndTime > now) {
        dispatch({
          type: "SET_ERROR",
          message: "Capture is on cooldown. Wait a moment.",
        });
        return;
      }

      dispatch({
        type: "SET_COOLDOWN_END",
        cooldownEndTime: now + LOCAL_CAPTURE_COOLDOWN_MS,
      });

      socketService.emitCellCapture(cellId);
    },
    [state.cooldownEndTime, state.status, state.user],
  );

  const dismissError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  return {
    state,
    captureCell,
    dismissError,
    localCooldownMs: LOCAL_CAPTURE_COOLDOWN_MS,
  };
}
