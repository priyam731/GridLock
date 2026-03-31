import { LeaderboardEntry } from "../../types";
import styles from "./Leaderboard.module.css";

interface LeaderboardProps {
  leaderboard: LeaderboardEntry[];
  currentUserId: string | null;
}

export function Leaderboard({ leaderboard, currentUserId }: LeaderboardProps) {
  return (
    <section className={styles.card}>
      <div className={styles.headerRow}>
        <h2 className={styles.heading}>Leaderboard</h2>
        <span className={styles.topLabel}>Top 10</span>
      </div>

      {leaderboard.length === 0 ? (
        <p className={styles.empty}>
          No captures yet. Be the first to claim a cell.
        </p>
      ) : (
        <ol className={styles.list}>
          {leaderboard.map((entry) => {
            const isCurrentUser = currentUserId === entry.userId;

            return (
              <li
                key={entry.userId}
                className={`${styles.item} ${isCurrentUser ? styles.currentUser : ""}`}
              >
                <span className={styles.rank}>#{entry.rank}</span>
                <span className={styles.player}>
                  <span
                    className={styles.dot}
                    style={{ backgroundColor: entry.color }}
                    aria-hidden="true"
                  />
                  {entry.name}
                </span>
                <span className={styles.score}>{entry.cellCount}</span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
