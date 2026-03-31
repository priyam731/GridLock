import { CSSProperties, useMemo } from "react";
import { Cell as CellType } from "../../types";
import { Cell } from "../Cell/Cell";
import styles from "./Grid.module.css";

interface GridProps {
  cells: Map<string, CellType>;
  cols: number;
  rows: number;
  currentUserId: string | null;
  recentlyUpdatedCells: Set<string>;
  onCapture: (cellId: string) => void;
}

function orderedCells(
  cells: Map<string, CellType>,
  cols: number,
  rows: number,
): CellType[] {
  const output: CellType[] = [];

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const id = `${x}_${y}`;
      const cell = cells.get(id);

      output.push(
        cell ?? {
          id,
          x,
          y,
          ownerId: null,
          ownerName: null,
          ownerColor: null,
          capturedAt: null,
        },
      );
    }
  }

  return output;
}

export function Grid({
  cells,
  cols,
  rows,
  currentUserId,
  recentlyUpdatedCells,
  onCapture,
}: GridProps) {
  const renderedCells = useMemo(
    () => orderedCells(cells, cols, rows),
    [cells, cols, rows],
  );

  const style = {
    "--grid-cols": String(cols),
  } as CSSProperties;

  return (
    <section className={styles.panel}>
      <div className={styles.meta}>
        <h2 className={styles.heading}>Territory Grid</h2>
        <p className={styles.caption}>{cols * rows} cells live</p>
      </div>

      <div className={styles.grid} style={style}>
        {renderedCells.map((cell) => (
          <Cell
            key={cell.id}
            cell={cell}
            onCapture={onCapture}
            isRecentlyUpdated={recentlyUpdatedCells.has(cell.id)}
            isOwnedByCurrentUser={Boolean(
              currentUserId && cell.ownerId === currentUserId,
            )}
          />
        ))}
      </div>
    </section>
  );
}
