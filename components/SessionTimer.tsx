"use client";

import { useEffect, useState } from "react";

export function SessionTimer({ startedAt, endedAt }: { startedAt: number | null; endedAt: number | null }) {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!startedAt || endedAt) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [startedAt, endedAt]);

  const end = endedAt ?? now;
  const elapsed = startedAt ? Math.max(0, end - startedAt) : 0;
  const mm = Math.floor(elapsed / 60000).toString().padStart(2, "0");
  const ss = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, "0");

  return (
    <div className="mono text-[11px] tracking-[0.22em] uppercase flex items-center gap-2 timer-tick">
      <span className="text-neutral">Elapsed</span>
      <span className="text-bone text-[18px] tracking-[0.08em]">{mm}:{ss}</span>
    </div>
  );
}
