"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DealBrief } from "./DealBrief";
import { CommitteeLive } from "./CommitteeLive";
import { TranscriptView } from "./TranscriptView";
import { TranscriptInput } from "./TranscriptInput";
import { SessionTimer } from "./SessionTimer";
import { TimeoutWarning } from "./TimeoutWarning";
import { pickNextMember, pickNextMemberSync, parseSentiment } from "@/lib/turn-router";
import { useSession } from "@/lib/session-context";
import {
  HARD_CAP_MS,
  HARD_CAP_TURNS,
  WARNING_MS,
  isSoftEndAvailable,
} from "@/lib/session-end";
import type { MemberId, Turn } from "@/lib/types";

type ViewMode = "live" | "transcript";

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
  // True while the evasion classifier is in flight (between presenter submit
  // and the next member starting to stream). Renders the "Conferring…"
  // indicator next to the view tabs.
  const [conferring, setConferring] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const [finalTurnsForRetry, setFinalTurnsForRetry] = useState<Turn[] | null>(null);
  // Set when a committee turn (including the kickoff) fails before any text
  // streams — e.g. /api/turn returns a 502 because the API key is invalid.
  // Surfaced as a banner with a Retry button so the room never freezes silently.
  const [turnError, setTurnError] = useState<string | null>(null);
  // Which conversation surface is showing. Local state — not persisted; a
  // refresh returns to the Live view, which is the right default.
  const [viewMode, setViewMode] = useState<ViewMode>("live");
  // Time-cap warning toast. Shown once when elapsed first crosses WARNING_MS;
  // user can dismiss early. `warningDismissed` ref prevents the interval from
  // re-showing after a manual dismiss.
  const [showWarning, setShowWarning] = useState(false);
  const warningDismissed = useRef(false);
  const kickoff = useRef(false);
  const turnAbort = useRef<AbortController | null>(null);
  const scoreAbort = useRef<AbortController | null>(null);
  const pickAbort = useRef<AbortController | null>(null);
  // The args of the most recent runMember call, so the Retry button can replay it.
  const lastTurnArgs = useRef<{ memberId: MemberId; snapshot: Turn[]; reaskOf?: string } | null>(
    null,
  );

  // Abort any in-flight requests on unmount (e.g. user navigates back mid-stream)
  useEffect(() => {
    return () => {
      turnAbort.current?.abort();
      scoreAbort.current?.abort();
      pickAbort.current?.abort();
    };
  }, []);

  const presenterTurns = useMemo(
    () => turns.filter((t) => t.role === "presenter").length,
    [turns]
  );
  const memberTurns = useMemo(
    () => turns.filter((t) => t.role === "member").length,
    [turns]
  );
  // Unique members who have spoken at least once. Needed for the PRD's soft-end
  // condition (8 turns + 15 min + all 4 voices heard).
  const uniqueMembersSpoken = useMemo(
    () =>
      new Set(
        turns.filter((t) => t.role === "member" && t.memberId).map((t) => t.memberId)
      ).size,
    [turns]
  );
  // Most recent member question — passed into TranscriptInput so the lookup
  // helper can scope its web_search to what was just asked.
  const lastMemberQuestion = useMemo(
    () => [...turns].reverse().find((t) => t.role === "member" && t.text.trim().length > 0)?.text,
    [turns]
  );

  const runMember = useCallback(
    async (memberId: MemberId, turnsSnapshot: Turn[], reaskOf?: string) => {
      setActiveMember(memberId);
      setStreaming(true);
      setTurnError(null);
      lastTurnArgs.current = { memberId, snapshot: turnsSnapshot, reaskOf };

      // Abort any prior in-flight turn before starting this one.
      turnAbort.current?.abort();
      const controller = new AbortController();
      turnAbort.current = controller;

      let placeholderAdded = false;

      try {
        const res = await fetch("/api/turn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId, brief, turns: turnsSnapshot, reaskOf }),
          signal: controller.signal,
        });
        if (!res.ok) {
          // /api/turn failed before streaming (e.g. a 502 from a bad API key).
          // Read the JSON error so the room can show why, instead of treating
          // the error body as committee speech.
          let detail = `committee turn failed (HTTP ${res.status})`;
          try {
            const j = (await res.json()) as { error?: string };
            if (j?.error) detail = j.error;
          } catch {
            // non-JSON body — keep the HTTP-status message
          }
          throw new Error(detail);
        }
        if (!res.body) throw new Error("no stream body");

        // Push the placeholder ONLY after the fetch resolves successfully. If the
        // request is aborted before headers arrive (e.g. React Strict Mode's
        // double-mount cleanup in dev), no empty turn is left in state — so the
        // remount's kickoff effect (gated on `turns.length === 0`) can re-fire
        // cleanly.
        addTurn({
          id: crypto.randomUUID(),
          role: "member",
          memberId,
          text: "",
          timestamp: Date.now(),
        });
        placeholderAdded = true;

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
        // Silent on intentional aborts — those happen when the user navigates away.
        if (e instanceof Error && e.name === "AbortError") return;
        const msg = e instanceof Error ? e.message : "stream error";
        if (placeholderAdded) updateLastMemberTurn(`[${msg}]`, "neutral");
        // Surface the failure as a banner — the room must never freeze silently.
        setTurnError(msg);
      } finally {
        setStreaming(false);
        setActiveMember(null);
      }
    },
    [brief, addTurn, updateLastMemberTurn]
  );

  // Replay the most recent committee turn after a failure (e.g. once the user
  // has fixed the API key and redeployed).
  const retryTurn = useCallback(() => {
    const args = lastTurnArgs.current;
    if (!args) return;
    setTurnError(null);
    runMember(args.memberId, args.snapshot, args.reaskOf);
  }, [runMember]);

  // Kickoff: first member question when session starts. Uses the SYNC orchestrator
  // because there's no prior presenter answer to evaluate for evasion.
  useEffect(() => {
    if (!brief || kickoff.current || turns.length > 0) return;
    kickoff.current = true;
    start();
    const firstId = pickNextMemberSync([]);
    runMember(firstId, []);
    // React StrictMode in dev mounts → cleans up → remounts. The unmount-time
    // cleanup elsewhere calls turnAbort.abort(), which aborts the first
    // kickoff's in-flight fetch (silent AbortError). Without this reset, the
    // remount's effect would see kickoff.current === true and skip — the room
    // would sit on "reviewing the brief…" forever. Re-clearing the flag lets
    // the remount re-fire cleanly. In prod (no StrictMode double-mount) the
    // cleanup only runs on real unmount, where it's harmless.
    return () => {
      kickoff.current = false;
    };
  }, [brief, turns.length, start, runMember]);

  const handlePresenterSubmit = useCallback(
    async (text: string) => {
      const presenterTurn: Turn = {
        id: crypto.randomUUID(),
        role: "presenter",
        text,
        timestamp: Date.now(),
      };
      addTurn(presenterTurn);
      const nextTurns = [...turns, presenterTurn];

      if (presenterTurns + 1 >= HARD_CAP_TURNS) {
        // PRD §12.6 hard cap on presenter responses. The committee never gets
        // cut off mid-question because we cap on the presenter side.
        finalize(nextTurns);
        return;
      }

      // Async pick: ~400ms Haiku classifier call to detect evasion. On ≤2 the
      // previous member re-asks; otherwise falls through to keyword scoring.
      pickAbort.current?.abort();
      const ctl = new AbortController();
      pickAbort.current = ctl;
      setConferring(true);
      try {
        const pick = await pickNextMember(nextTurns, { signal: ctl.signal });
        if (ctl.signal.aborted) return;
        runMember(pick.memberId, nextTurns, pick.reaskOf);
      } finally {
        setConferring(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [turns, presenterTurns, addTurn, runMember]
  );

  const finalize = useCallback(
    async (finalTurns: Turn[]) => {
      if (!brief) return;
      end();
      setFinalizing(true);
      setScoreError(null);
      setFinalTurnsForRetry(finalTurns);

      scoreAbort.current?.abort();
      const controller = new AbortController();
      scoreAbort.current = controller;

      try {
        const res = await fetch("/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brief, turns: finalTurns }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`scoring failed (HTTP ${res.status})`);
        const data = await res.json();
        if (!data.rubric) throw new Error("scoring returned no rubric");
        setRubric(data.rubric);
        router.push("/report");
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        // Don't navigate to /report — surface the error inline with a retry button.
        // The /report page also has a re-score path if the user navigates there anyway.
        setScoreError(e instanceof Error ? e.message : "scoring failed");
      } finally {
        setFinalizing(false);
      }
    },
    [brief, end, setRubric, router]
  );

  const endNow = () => finalize(turns);
  const retryScore = () => {
    if (finalTurnsForRetry) finalize(finalTurnsForRetry);
  };

  // Time-cap watcher: 1s tick checks elapsed against the hard cap (auto-finalize)
  // and the warning threshold (toast). This is the only mechanism that can trip
  // the time-only cap while the user is idle between turns; turn-based caps are
  // enforced inline inside handlePresenterSubmit.
  useEffect(() => {
    if (!startedAt || endedAt || finalizing) return;
    const tick = () => {
      const elapsed = Date.now() - startedAt;
      if (elapsed >= HARD_CAP_MS) {
        finalize(turns);
        return;
      }
      if (elapsed >= WARNING_MS && !warningDismissed.current) {
        setShowWarning(true);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt, endedAt, finalizing, turns, finalize]);

  // Auto-dismiss the warning ~8s after it shows.
  useEffect(() => {
    if (!showWarning) return;
    const id = setTimeout(() => setShowWarning(false), 8_000);
    return () => clearTimeout(id);
  }, [showWarning]);

  const softEndAvailable = useMemo(() => {
    if (!startedAt) return false;
    return isSoftEndAvailable({
      memberTurns,
      elapsedMs: Date.now() - startedAt,
      uniqueMembersSpoken,
    });
  }, [memberTurns, uniqueMembersSpoken, startedAt]);

  if (!brief) return null;

  return (
    <main className="min-h-dvh px-6 md:px-10 py-6 flex flex-col">
      <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col">
        <header className="flex items-center justify-between mb-5 pb-4 border-b hairline">
          <div className="flex items-baseline gap-5">
            <div className="mono text-[10px] tracking-[0.3em] uppercase text-neutral">
              IC · SIM — In Session
            </div>
            <div className="mono text-[10px] tracking-[0.2em] uppercase text-bone-dim">
              Turn {String(Math.min(HARD_CAP_TURNS, memberTurns)).padStart(2, "0")} /{" "}
              {String(HARD_CAP_TURNS).padStart(2, "0")}
            </div>
            {softEndAvailable && !finalizing && (
              <div className="mono text-[9px] tracking-[0.22em] uppercase text-amber">
                Soft end available
              </div>
            )}
          </div>
          <div className="flex items-center gap-6">
            <SessionTimer startedAt={startedAt} endedAt={endedAt} />
            <button className="btn-ghost" onClick={endNow} disabled={finalizing}>
              {finalizing ? "Scoring…" : "End Session →"}
            </button>
          </div>
        </header>

        {/* Compact deal strip — full memo opens in a drawer */}
        <DealBrief brief={brief} />

        {/* Live / Transcript toggle */}
        <div className="flex items-center gap-1 mb-5 border-b hairline">
          <TabButton active={viewMode === "live"} onClick={() => setViewMode("live")}>
            Live
          </TabButton>
          <TabButton
            active={viewMode === "transcript"}
            onClick={() => setViewMode("transcript")}
          >
            Transcript
          </TabButton>
          {conferring && (
            <span className="mono text-[9px] tracking-[0.24em] uppercase text-amber animate-pulse ml-3">
              Conferring…
            </span>
          )}
          <span className="mono text-[9px] tracking-[0.2em] uppercase text-neutral ml-auto pb-2">
            Committee — 4 Partners
          </span>
        </div>

        <TimeoutWarning
          visible={showWarning}
          onDismiss={() => {
            setShowWarning(false);
            warningDismissed.current = true;
          }}
        />

        {turnError && (
          <div className="border hairline-strong bg-[rgba(122,35,40,0.06)] p-4 mb-4 flex items-start justify-between gap-4">
            <div className="min-w-0 text-[12.5px] text-bone-dim">
              <span className="mono text-[10px] tracking-[0.18em] uppercase text-oxblood">
                committee turn failed
              </span>
              <span className="ml-3">{turnError}</span>
            </div>
            <button
              type="button"
              onClick={retryTurn}
              disabled={streaming}
              className="btn-solid disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* The conversation — both views render from the same `turns` array */}
        <div>
          {viewMode === "live" ? (
            <CommitteeLive
              turns={turns}
              activeMember={activeMember}
              streaming={streaming}
              conferring={conferring}
              sentimentByMember={sentimentByMember}
            />
          ) : (
            <TranscriptView turns={turns} />
          )}
        </div>

        {/* Presenter input */}
        <div className="mt-6 space-y-4">
          {scoreError && (
            <div className="border hairline-strong p-4 flex items-center justify-between gap-4">
              <div className="text-[13px] text-bone-dim">
                <span className="mono text-[10px] tracking-[0.18em] uppercase text-oxblood">
                  scoring failed
                </span>
                <span className="ml-3">{scoreError}</span>
              </div>
              <button
                type="button"
                onClick={retryScore}
                disabled={finalizing}
                className="btn-solid disabled:opacity-30"
              >
                {finalizing ? "Retrying…" : "Retry scoring →"}
              </button>
            </div>
          )}
          <TranscriptInput
            disabled={streaming || finalizing}
            onSubmit={handlePresenterSubmit}
            brief={brief}
            lastMemberQuestion={lastMemberQuestion}
            placeholder={
              presenterTurns === 0
                ? "Open with your thesis. Why is this a fund-returner?"
                : "Respond to the question. Use specific numbers."
            }
          />
        </div>
      </div>
    </main>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mono text-[10px] tracking-[0.22em] uppercase px-3 py-2 -mb-px border-b-2 transition-colors ${
        active
          ? "text-bone border-bone"
          : "text-neutral border-transparent hover:text-bone-dim"
      }`}
    >
      {children}
    </button>
  );
}
