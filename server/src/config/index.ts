export const config = {
  port: Number(process.env.PORT) || 3001,
  gridCols: 10,
  gridRows: 10,
  cooldownMs: 3000,
  corsOrigin: process.env.CLIENT_URL || "http://localhost:5173",
} as const;
