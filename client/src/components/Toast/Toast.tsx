import { useEffect } from "react";
import styles from "./Toast.module.css";

interface ToastProps {
  message: string | null;
  onClose: () => void;
  durationMs?: number;
}

export function Toast({ message, onClose, durationMs = 2400 }: ToastProps) {
  useEffect(() => {
    if (!message) return;

    const timeout = window.setTimeout(() => {
      onClose();
    }, durationMs);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [durationMs, message, onClose]);

  if (!message) return null;

  return (
    <div className={styles.toast} role="alert">
      <span>{message}</span>
      <button
        type="button"
        className={styles.closeButton}
        onClick={onClose}
        aria-label="Dismiss message"
      >
        x
      </button>
    </div>
  );
}
