import { GridStats, User } from "../../types";
import styles from "./UserPanel.module.css";

interface UserPanelProps {
  user: User | null;
  stats: GridStats;
  cooldownRemainingMs: number;
  cooldownProgress: number;
  isCoolingDown: boolean;
}

export function UserPanel({
  user,
  stats,
  cooldownRemainingMs,
  cooldownProgress,
  isCoolingDown,
}: UserPanelProps) {
  const cooldownWidth = `${Math.max(0, Math.min(100, cooldownProgress * 100)).toFixed(1)}%`;

  return (
    <section className={styles.card}>
      <h2 className={styles.heading}>Pilot Panel</h2>

      {user ? (
        <div className={styles.identityRow}>
          <span
            className={styles.colorSwatch}
            style={{ backgroundColor: user.color }}
            aria-hidden="true"
          />
          <div>
            <p className={styles.name}>{user.name}</p>
            <p className={styles.meta}>Cells owned: {user.cellCount}</p>
          </div>
        </div>
      ) : (
        <p className={styles.meta}>Joining session...</p>
      )}

      <div className={styles.statsGrid}>
        <article className={styles.statCard}>
          <p className={styles.statLabel}>Claimed</p>
          <p className={styles.statValue}>
            {stats.claimedCells}/{stats.totalCells}
          </p>
        </article>
        <article className={styles.statCard}>
          <p className={styles.statLabel}>Online</p>
          <p className={styles.statValue}>{stats.onlinePlayers}</p>
        </article>
      </div>

      <div className={styles.cooldownBlock}>
        <div className={styles.cooldownHeader}>
          <span>Capture cooldown</span>
          <span>
            {isCoolingDown
              ? `${(cooldownRemainingMs / 1000).toFixed(1)}s`
              : "Ready"}
          </span>
        </div>
        <div className={styles.cooldownTrack}>
          <span
            className={styles.cooldownFill}
            style={{ width: cooldownWidth }}
          />
        </div>
      </div>
    </section>
  );
}
