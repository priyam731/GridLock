import { useEffect, useMemo, useState } from "react";

const TICK_MS = 50;

interface CooldownState {
  remainingMs: number;
  progress: number;
  isCoolingDown: boolean;
}

export function useCooldown(
  cooldownEndTime: number,
  totalCooldownMs: number,
): CooldownState {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (cooldownEndTime <= Date.now()) {
      setNow(Date.now());
      return;
    }

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, TICK_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [cooldownEndTime]);

  return useMemo(() => {
    const remainingMs = Math.max(0, cooldownEndTime - now);
    const progress = totalCooldownMs > 0 ? remainingMs / totalCooldownMs : 0;

    return {
      remainingMs,
      progress,
      isCoolingDown: remainingMs > 0,
    };
  }, [cooldownEndTime, now, totalCooldownMs]);
}
