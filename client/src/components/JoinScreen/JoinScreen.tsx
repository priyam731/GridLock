import { FormEvent, useState } from "react";
import {
  generatePlayerName,
  sanitizePlayerName,
} from "../../utils/nameGenerator";
import styles from "./JoinScreen.module.css";

interface JoinScreenProps {
  onJoin: (name: string) => void;
}

export function JoinScreen({ onJoin }: JoinScreenProps) {
  const [name, setName] = useState(generatePlayerName());

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = sanitizePlayerName(name);
    onJoin(normalized.length > 0 ? normalized : generatePlayerName());
  };

  const handleRegenerate = () => {
    setName(generatePlayerName());
  };

  return (
    <div className={styles.page}>
      <div className={styles.glow} aria-hidden="true" />

      <form className={styles.card} onSubmit={handleSubmit}>
        <p className={styles.kicker}>Realtime Territory Arena</p>
        <h1 className={styles.title}>GridLock</h1>
        <p className={styles.subtitle}>
          Enter your name, jump in, and capture as many cells as possible.
        </p>

        <label className={styles.label} htmlFor="player-name">
          Display name
        </label>
        <input
          id="player-name"
          className={styles.input}
          value={name}
          maxLength={20}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your alias"
          autoFocus
        />

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.ghostButton}
            onClick={handleRegenerate}
          >
            Shuffle
          </button>
          <button type="submit" className={styles.primaryButton}>
            Join Grid
          </button>
        </div>
      </form>
    </div>
  );
}
