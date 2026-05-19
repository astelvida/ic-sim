"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { DealBrief } from "./DealBrief";
import { MemberCard } from "./MemberCard";
import { TranscriptInput } from "./TranscriptInput";
import { SessionTimer } from "./SessionTimer";
import { COMMITTEE } from "@/lib/committee";
import { pickNextMember, parseSentiment } from "@/lib/turn-router";
import { useSession } from "@/lib/session-context";
import type { MemberId, Turn } from "@/lib/types";

const MAX_TURNS = 10;

export function CommitteeRoom() {
  const router = useRouter();
  const {
    brief,
    turns,
    sentimentByMember,
    startedAt,
    endedAt,
    start,
    addTurn,
    updateLastMemberTurn,
    end,
    setRubric,
  } = useSession();

  const [streaming, setStreaming] = useState(false);
  const [activeMember, setActiveMember] = useState<MemberId | null>(null);
  const [finalizing, setFinalizing] = useState(false);
  const kickoff = useRef(false);

  const presenterTurns = useMemo(
    () => turns.filter((t) => t.role === "presenter").length,
    [turns]
  );
  const memberTurns = useMemo(
    () => turns.filter((t) => t.role === "member").length,
    [turns]
  );

  const runMember = useCallback(
    async (memberId: MemberId, turnsSnapshot: Turn[]) => {
      setActiveMember(memberId);
      setStreaming(true);

      // Push placeholder member turn
      const placeholderId = crypto.randomUUID();
      addTurn({
        id: placeholderId,
        role: "member",
        memberId,
        text: "",
        timestamp: Date.now(),
      });

      try {
        const res = await fetch("/api/turn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId, brief, turns: turnsSnapshot }),
        });
        if (!res.body) throw new Error("no stream body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          const { clean } = parseSentiment(acc);
          updateLastMemberTurn(clean);
        }
        const { clean, sentiment } = parseSentiment(acc);
        updateLastMemberTurn(clean, sentiment);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "stream error";
        updateLastMemberTurn(`[${msg}]`, "neutral");
      } finally {
        setStreaming(false);
        setActiveMember(null);
      }
    },
    [brief, addTurn, updateLastMemberTurn]
  );

  // Kickoff: first member question when session starts
  useEffect(() => {
    if (!brief || kickoff.current || turns.length > 0) return;
    kickoff.current = true;
    start();
    const firstId = pickNextMember([]);
    runMember(firstId, []);
  }, [brief, turns.length, start, runMember]);

  const handlePresenterSubmit = useCallback(
    (text: string) => {
      const presenterTurn: Turn = {
        id: crypto.randomUUID(),
        role: "presenter",
        text,
        timestamp: Date.now(),
      };
      addTurn(presenterTurn);

      if (presenterTurns + 1 >= MAX_TURNS) {
        // wrap up
        finalize([...turns, presenterTurn]);
        return;
      }

      const next = pickNextMember([...turns, presenterTurn]);
      runMember(next, [...turns, presenterTurn]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [turns, presenterTurns, addTurn, runMember]
  );

  const finalize = useCallback(
    async (finalTurns: Turn[]) => {
      if (!brief) return;
      end();
      setFinalizing(true);
      try {
        const res = await fetch("/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brief, turns: finalTurns }),
        });
        const data = await res.json();
        if (data.rubric) setRubric(data.rubric);
        router.push("/report");
      } catch {
        router.push("/report");
      } finally {
        setFinalizing(false);
      }
    },
    [brief, end, setRubric, router]
  );

  const endNow = () => finalize(turns);

  if (!brief) return null;

  return (
    <main className="min-h-dvh px-8 md:px-12 py-6 flex flex-col">
      <header className="flex items-center justify-between mb-6 pb-4 border-b hairline">
        <div className="flex items-baseline gap-5">
          <div className="mono text-[10px] tracking-[0.3em] uppercase text-neutral">
            IC · SIM — In Session
          </div>
          <div className="mono text-[10px] tracking-[0.2em] uppercase text-bone-dim">
            Turn {String(Math.min(MAX_TURNS, memberTurns + presenterTurns)).padStart(2, "0")} / {String(MAX_TURNS * 2).padStart(2, "0")}
          </div>
        </div>
        <div className="flex items-center gap-8">
          <SessionTimer startedAt={startedAt} endedAt={endedAt} />
          <button className="btn-ghost" onClick={endNow} disabled={finalizing}>
            {finalizing ? "Scoring…" : "End Session →"}
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[58fr_42fr] gap-10">
        {/* LEFT: brief + input + transcript */}
        <section className="flex flex-col min-w-0">
          <DealBrief brief={brief} compact={turns.length > 0} />

          <Transcript turns={turns} />

          <div className="mt-auto pt-6">
            <TranscriptInput
              disabled={streaming || finalizing}
              onSubmit={handlePresenterSubmit}
              placeholder={
                presenterTurns === 0
                  ? "Open with your thesis. Why is this a fund-returner?"
                  : "Respond to the question. Use specific numbers."
              }
            />
          </div>
        </section>

        {/* RIGHT: committee */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-6 self-start">
          <div className="mono text-[10px] tracking-[0.24em] uppercase text-neutral mb-1">
            Committee — 4 Partners
          </div>
          {COMMITTEE.map((m) => {
            const memberTurnsForThis = turns.filter((t) => t.role === "member" && t.memberId === m.id);
            const latest = memberTurnsForThis[memberTurnsForThis.length - 1] ?? null;
            return (
              <motion.div
                key={m.id}
                layout
                transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
              >
                <MemberCard
                  member={m}
                  sentiment={sentimentByMember[m.id]}
                  isActive={activeMember === m.id}
                  isStreaming={streaming && activeMember === m.id}
                  lastTurn={latest}
                  turnCount={memberTurnsForThis.length}
                />
              </motion.div>
            );
          })}
        </aside>
      </div>
    </main>
  );
}

function Transcript({ turns }: { turns: Turn[] }) {
  const presenterOnly = turns.filter((t) => t.role === "presenter");
  if (presenterOnly.length === 0) return null;
  return (
    <div className="mt-6 border-t hairline pt-5">
      <div className="mono text-[10px] tracking-[0.24em] uppercase text-neutral mb-3">
        Your recent answers
      </div>
      <ul className="space-y-3">
        {presenterOnly.slice(-3).map((t) => (
          <li key={t.id} className="text-[13px] text-bone-dim border-l-2 hairline-strong pl-4">
            {t.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
