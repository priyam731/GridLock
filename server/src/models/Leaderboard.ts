export interface LeaderboardEntry {
  userId: string;
  name: string;
  color: string;
  cellCount: number;
  rank: number;
}

export type Leaderboard = LeaderboardEntry[];
