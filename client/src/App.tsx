import { useMemo, useState } from "react";
import { Grid } from "./components/Grid/Grid";
import { JoinScreen } from "./components/JoinScreen/JoinScreen";
import { Leaderboard } from "./components/Leaderboard/Leaderboard";
import { Toast } from "./components/Toast/Toast";
import { UserPanel } from "./components/UserPanel/UserPanel";
import { useCooldown } from "./hooks/useCooldown";
import { useGrid } from "./hooks/useGrid";
import styles from "./App.module.css";

const DEFAULT_GRID_SIDE = 10;

function resolveGridSide(totalCells: number): number {
  const root = Math.sqrt(totalCells);
  return Number.isInteger(root) && root > 0 ? root : DEFAULT_GRID_SIDE;
}

export default function App() {
  const [playerName, setPlayerName] = useState<string | null>(null);
  const { state, captureCell, dismissError, localCooldownMs } =
    useGrid(playerName);
  const cooldown = useCooldown(state.cooldownEndTime, localCooldownMs);

  const gridSide = useMemo(
    () => resolveGridSide(state.stats.totalCells),
    [state.stats.totalCells],
  );

  if (!playerName) {
    return <JoinScreen onJoin={setPlayerName} />;
  }

  return (
    <div className={styles.appShell}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>GridLock</h1>
          <p className={styles.subtitle}>
            Claim cells in real time. Build territory. Top the board.
          </p>
        </div>

        <div
          className={`${styles.connectionBadge} ${
            state.status === "connected"
              ? styles.connected
              : styles.disconnected
          }`}
        >
          {state.status === "connected"
            ? "Live"
            : state.status === "connecting"
              ? "Connecting"
              : "Offline"}
        </div>
      </header>

      <main className={styles.mainLayout}>
        <section className={styles.gridSection}>
          <Grid
            cells={state.cells}
            cols={gridSide}
            rows={gridSide}
            currentUserId={state.user?.id ?? null}
            recentlyUpdatedCells={state.recentlyUpdatedCells}
            onCapture={captureCell}
          />
        </section>

        <aside className={styles.sidebar}>
          <UserPanel
            user={state.user}
            stats={state.stats}
            cooldownRemainingMs={cooldown.remainingMs}
            cooldownProgress={cooldown.progress}
            isCoolingDown={cooldown.isCoolingDown}
          />

          <Leaderboard
            leaderboard={state.leaderboard}
            currentUserId={state.user?.id ?? null}
          />
        </aside>
      </main>

      {state.status === "disconnected" && (
        <div className={styles.disconnectedBanner}>
          Connection lost. Waiting for socket to reconnect.
        </div>
      )}

      <Toast message={state.errorMessage} onClose={dismissError} />
    </div>
  );
}
