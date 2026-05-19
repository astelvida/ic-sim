"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ScoreReport } from "@/components/ScoreReport";
import { useSession } from "@/lib/session-context";

export default function ReportPage() {
  const { brief, rubric, turns } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!brief) router.replace("/");
  }, [brief, router]);

  if (!brief) return null;

  if (!rubric) {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <div className="mono text-[11px] tracking-[0.24em] uppercase text-neutral">
          No rubric available. Return to start.
        </div>
      </main>
    );
  }

  return <ScoreReport brief={brief} rubric={rubric} turns={turns} />;
}
