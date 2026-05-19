"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ScoreReport } from "@/components/ScoreReport";
import { useSession } from "@/lib/session-context";

export default function ReportPage() {
  const { brief, rubric, turns, setRubric, hydrated } = useSession();
  const router = useRouter();
  const [scoring, setScoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only act on `brief` after the session has hydrated from sessionStorage.
  useEffect(() => {
    if (hydrated && !brief) router.replace("/");
  }, [brief, hydrated, router]);

  if (!hydrated) {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <div className="mono text-[11px] tracking-[0.2em] uppercase text-neutral">
          Restoring session…
        </div>
      </main>
    );
  }

  if (!brief) return null;

  if (!rubric) {
    const canScore = turns.length > 0;

    async function rescore() {
      if (!brief || !canScore) return;
      setScoring(true);
      setError(null);
      try {
        const res = await fetch("/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brief, turns }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!data.rubric) throw new Error("no rubric returned");
        setRubric(data.rubric);
      } catch (e) {
        setError(e instanceof Error ? e.message : "scoring failed");
      } finally {
        setScoring(false);
      }
    }

    return (
      <main className="min-h-dvh flex flex-col items-center justify-center px-8 gap-6 max-w-xl mx-auto text-center">
        <div className="mono text-[10px] tracking-[0.3em] uppercase text-neutral">
          Report not yet scored
        </div>
        <h1 className="display text-[42px] leading-tight">
          {canScore ? "Score this transcript?" : "No transcript to score"}
        </h1>
        <p className="text-[14px] text-bone-dim leading-relaxed">
          {canScore
            ? `${turns.length} turns captured. The scoring call may have failed earlier — try again, or start a fresh session.`
            : "Start a new session to record a transcript."}
        </p>
        {error && (
          <div className="mono text-[11px] tracking-[0.14em] uppercase text-oxblood">
            error: {error}
          </div>
        )}
        <div className="flex items-center gap-4 pt-2">
          {canScore && (
            <button
              type="button"
              onClick={rescore}
              disabled={scoring}
              className="btn-solid disabled:opacity-40"
            >
              {scoring ? "Scoring…" : "Re-score transcript →"}
            </button>
          )}
          <Link href="/" className="btn-ghost">
            ← New session
          </Link>
        </div>
      </main>
    );
  }

  return <ScoreReport brief={brief} rubric={rubric} turns={turns} />;
}
