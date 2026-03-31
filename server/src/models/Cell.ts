export interface Cell {
  id: string;        // "{x}_{y}"
  x: number;
  y: number;
  ownerId: string | null;
  ownerName: string | null;
  ownerColor: string | null;
  capturedAt: number | null;
}
