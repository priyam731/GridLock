import { CSSProperties } from "react";
import { Cell as CellType } from "../../types";
import styles from "./Cell.module.css";

interface CellProps {
  cell: CellType;
  onCapture: (cellId: string) => void;
  isRecentlyUpdated: boolean;
  isOwnedByCurrentUser: boolean;
}

export function Cell({
  cell,
  onCapture,
  isRecentlyUpdated,
  isOwnedByCurrentUser,
}: CellProps) {
  const className = [
    styles.cell,
    cell.ownerId ? styles.claimed : styles.unclaimed,
    isRecentlyUpdated ? styles.recent : "",
    isOwnedByCurrentUser ? styles.mine : "",
  ]
    .filter(Boolean)
    .join(" ");

  const style = {
    "--cell-owner-color": cell.ownerColor ?? "rgba(20, 30, 65, 0.5)",
  } as CSSProperties;

  const label = cell.ownerName
    ? `${cell.ownerName} owns (${cell.x + 1}, ${cell.y + 1})`
    : `Capture cell (${cell.x + 1}, ${cell.y + 1})`;

  return (
    <button
      type="button"
      className={className}
      style={style}
      aria-label={label}
      title={label}
      onClick={() => onCapture(cell.id)}
    />
  );
}
