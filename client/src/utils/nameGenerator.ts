const ADJECTIVES = [
  "Neon",
  "Rapid",
  "Silent",
  "Arc",
  "Lunar",
  "Hyper",
  "Apex",
  "Nova",
  "Solar",
  "Cobalt",
  "Prism",
  "Quantum",
  "Turbo",
  "Icy",
  "Velvet",
] as const;

const NOUNS = [
  "Falcon",
  "Comet",
  "Ranger",
  "Atlas",
  "Cipher",
  "Titan",
  "Drift",
  "Specter",
  "Voyager",
  "Pulse",
  "Echo",
  "Orbit",
  "Phoenix",
  "Saber",
  "Warden",
] as const;

function sample<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function generatePlayerName(): string {
  const tag = Math.floor(Math.random() * 90) + 10;
  return `${sample(ADJECTIVES)}${sample(NOUNS)}${tag}`;
}

export function sanitizePlayerName(rawName: string): string {
  return rawName.trim().replace(/\s+/g, " ").slice(0, 20);
}
