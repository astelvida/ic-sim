"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/session-context";
import type { Brief, DealListItem } from "@/lib/types";

// Rotating progress hints shown next to "drafting brief…". The /api/brief route
// runs web_search up to 4x server-side — user-visible wait is 20-40s. These hints
// give the user a sense of forward motion without lying about real progress.
const BRIEF_HINTS = [
  "drafting brief…",
  "checking competitors…",
  "verifying TAM math…",
  "scanning regulators…",
  "reading founder backgrounds…",
  "pulling comparables…",
  "stress-testing risks…",
];

export function DealsList() {
  const router = useRouter();
  const { setBrief } = useSession();

  const [open, setOpen] = useState(true);
  const [deals, setDeals] = useState<DealListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [simCopiedId, setSimCopiedId] = useState<string | null>(null);
  const [enteringId, setEnteringId] = useState<string | null>(null);
  const [enterError, setEnterError] = useState<string | null>(null);

  const [stages, setStages] = useState<Set<string>>(new Set());
  const [sectors, setSectors] = useState<Set<string>>(new Set());
  const [priorities, setPriorities] = useState<Set<string>>(new Set());

  const [hintIdx, setHintIdx] = useState(0);
  useEffect(() => {
    if (!enteringId) return;
    setHintIdx(0);
    const id = setInterval(() => setHintIdx((i) => (i + 1) % BRIEF_HINTS.length), 4000);
    return () => clearInterval(id);
  }, [enteringId]);

  // Fetch the pipeline once on mount. The panel is open by default so the table
  // is the prominent landing entry rather than a hidden accordion. Every state
  // update happens inside an async callback (never synchronously in the effect
  // body), so React 19's set-state-in-effect rule stays satisfied.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/deals")
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`);
        return j.deals as DealListItem[];
      })
      .then((d) => {
        if (!cancelled) setDeals(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "fetch failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function togglePanel() {
    setOpen((o) => !o);
  }

  const allStages = useMemo(() => unique(deals?.map((d) => d.stage) ?? []), [deals]);
  const allSectors = useMemo(() => unique(deals?.map((d) => d.sector) ?? []), [deals]);
  const allPriorities = useMemo(() => unique(deals?.map((d) => d.priority) ?? []), [deals]);

  const filtered = useMemo(() => {
    if (!deals) return null;
    return deals.filter(
      (d) =>
        (stages.size === 0 || stages.has(d.stage)) &&
        (sectors.size === 0 || sectors.has(d.sector)) &&
        (priorities.size === 0 || priorities.has(d.priority)),
    );
  }, [deals, stages, sectors, priorities]);

  function toggleFilter(set: Set<string>, value: string, setter: (s: Set<string>) => void) {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  }

  async function enterRoom(d: DealListItem) {
    setEnteringId(d.id);
    setEnterError(null);
    try {
      const r = await fetch("/api/brief", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ notionId: d.id }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`);
      const brief = j.brief as Brief;
      setBrief(brief);
      router.push("/room");
    } catch (e) {
      setEnterError(
        `${d.company || d.id}: ${e instanceof Error ? e.message : "brief generation failed"}`,
      );
      setEnteringId(null);
    }
  }

  async function copySimPrompt(d: DealListItem) {
    const tail = [d.company, d.sector, d.stage].filter(Boolean).join(" · ");
    const prompt = `/ic-sim ${d.id}${tail ? `  # ${tail}` : ""}`;
    try {
      await navigator.clipboard.writeText(prompt);
      setSimCopiedId(d.id);
      setTimeout(() => setSimCopiedId((c) => (c === d.id ? null : c)), 1600);
    } catch {
      /* secure-context / older browsers — clipboard unavailable */
    }
  }

  const anyFilter = stages.size + sectors.size + priorities.size > 0;
  const total = deals?.length ?? 0;
  const shown = filtered?.length ?? 0;

  return (
    <section className="w-full max-w-5xl">
      <button
        type="button"
        onClick={togglePanel}
        className="w-full flex items-center justify-between border-b hairline pb-4 text-left group"
      >
        <div className="display text-[22px] leading-tight">
          {open ? "Your pipeline" : "Browse your pipeline"}
        </div>
        <div className="flex items-center gap-4">
          <span className="mono text-[10px] tracking-[0.22em] uppercase text-neutral">
            Live · from Notion
          </span>
          <span className="mono text-[12px] text-bone-dim group-hover:text-bone transition-colors">
            {open ? "− collapse" : "+ expand"}
          </span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.2, 0, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-6">
              {loading && (
                <div className="mono text-[11px] uppercase tracking-[0.2em] text-neutral py-8">
                  loading pipeline…
                </div>
              )}

              {error && (
                <div className="mono text-[11px] uppercase tracking-[0.14em] text-oxblood py-4">
                  error: {error}
                  <div className="mt-2 normal-case tracking-normal text-bone-dim text-[12px] font-sans">
                    Check that <code>NOTION_TOKEN</code> is set in <code>.env.local</code> and that
                    the integration has access to the Dealflow database.
                  </div>
                </div>
              )}

              {deals && deals.length === 0 && (
                <div className="mono text-[11px] uppercase tracking-[0.2em] text-neutral py-8">
                  no active deals in pipeline
                </div>
              )}

              {deals && deals.length > 0 && (
                <>
                  <div className="space-y-3 mb-6">
                    <FilterRow
                      label="Stage"
                      values={allStages}
                      selected={stages}
                      onToggle={(v) => toggleFilter(stages, v, setStages)}
                    />
                    <FilterRow
                      label="Sector"
                      values={allSectors}
                      selected={sectors}
                      onToggle={(v) => toggleFilter(sectors, v, setSectors)}
                    />
                    <FilterRow
                      label="Priority"
                      values={allPriorities}
                      selected={priorities}
                      onToggle={(v) => toggleFilter(priorities, v, setPriorities)}
                    />
                    {anyFilter && (
                      <button
                        type="button"
                        onClick={() => {
                          setStages(new Set());
                          setSectors(new Set());
                          setPriorities(new Set());
                        }}
                        className="mono text-[10px] tracking-[0.18em] uppercase text-bone-dim hover:text-bone underline-offset-4 hover:underline"
                      >
                        clear all filters
                      </button>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-[12px]">
                      <thead>
                        <tr className="border-b hairline text-left">
                          <Th>Company</Th>
                          <Th>Sector</Th>
                          <Th>Stage</Th>
                          <Th className="text-right">SSI</Th>
                          <Th>Tier / Priority</Th>
                          <Th>Status</Th>
                          <Th>{""}</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered!.map((d) => (
                          <tr
                            key={d.id}
                            className="border-b hairline hover:bg-bone/[0.04] transition-colors"
                          >
                            <td className="py-3 pr-4 align-top">
                              <div className="text-bone">{d.company || "—"}</div>
                              <div className="text-bone-dim text-[11px] mt-1 max-w-md">
                                {truncate(d.oneLiner, 110)}
                              </div>
                            </td>
                            <Td>{d.sector || "—"}</Td>
                            <Td>{d.stage || "—"}</Td>
                            <Td className="text-right mono w-28">
                              {d.ssiScore === null ? "—" : <SsiBar value={d.ssiScore} />}
                            </Td>
                            <Td>
                              <div>{d.signalTier || "—"}</div>
                              <div className="text-bone-dim text-[11px] mt-0.5">
                                {d.priority || "—"}
                              </div>
                            </Td>
                            <Td>{d.status || "—"}</Td>
                            <Td className="text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-4">
                                <button
                                  type="button"
                                  onClick={() => copySimPrompt(d)}
                                  disabled={enteringId !== null}
                                  className="mono text-[10px] tracking-[0.14em] uppercase text-neutral hover:text-bone-dim underline-offset-4 hover:underline disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="Copy a /ic-sim prompt to run the simulation in your Claude Code terminal session instead"
                                >
                                  {simCopiedId === d.id ? "✓ copied" : "/ic-sim"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => enterRoom(d)}
                                  disabled={enteringId !== null}
                                  className="mono text-[10px] tracking-[0.18em] uppercase text-bone hover:text-amber underline-offset-4 hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                                  title="Draft the brief from Notion and walk straight into the committee room"
                                >
                                  {enteringId === d.id ? BRIEF_HINTS[hintIdx] : "enter the room →"}
                                </button>
                              </div>
                            </Td>
                          </tr>
                        ))}
                        {filtered!.length === 0 && (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-neutral mono text-[11px] uppercase tracking-[0.2em]">
                              no deals match these filters
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {enterError && (
                    <div className="mt-4 mono text-[11px] uppercase tracking-[0.14em] text-oxblood">
                      error: {enterError}
                    </div>
                  )}

                  <div className="mt-6 flex items-baseline justify-between gap-6">
                    <div className="text-[12px] text-bone-dim leading-relaxed max-w-2xl">
                      <span className="mono text-bone">enter the room →</span> drafts a one-page
                      brief from the Notion page and walks you straight into the committee. If
                      you&rsquo;d rather drive the whole simulation from your terminal, the small{" "}
                      <span className="mono">/ic-sim</span> link copies a prompt for your Claude
                      Code session.
                    </div>
                    <div className="mono text-[10px] tracking-[0.2em] uppercase text-neutral whitespace-nowrap">
                      {anyFilter ? `${shown} of ${total}` : `${total} deals`}
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function FilterRow({
  label,
  values,
  selected,
  onToggle,
}: {
  label: string;
  values: string[];
  selected: Set<string>;
  onToggle: (v: string) => void;
}) {
  if (values.length === 0) return null;
  return (
    <div className="flex items-start gap-4">
      <div className="mono text-[10px] tracking-[0.22em] uppercase text-neutral pt-1.5 w-20 shrink-0">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => {
          const active = selected.has(v);
          return (
            <button
              key={v}
              type="button"
              onClick={() => onToggle(v)}
              className={
                active
                  ? "chip border-bone text-bone bg-bone/[0.06]"
                  : "chip hover:border-bone-dim hover:text-bone"
              }
            >
              {v}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`py-2 pr-4 mono text-[10px] tracking-[0.18em] uppercase text-neutral font-normal ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`py-3 pr-4 align-top text-bone-dim ${className}`}>{children}</td>;
}

function SsiBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center justify-end gap-2">
      <span className="tabular-nums">{Math.round(value)}</span>
      <div className="w-12 h-[3px] bg-bone/[0.08] relative">
        <div
          className="absolute inset-y-0 left-0 bg-bone"
          style={{ width: `${pct}%`, opacity: 0.4 + (pct / 100) * 0.6 }}
        />
      </div>
    </div>
  );
}

function truncate(s: string, n: number): string {
  if (!s) return "";
  const trimmed = s.trim();
  return trimmed.length <= n ? trimmed : trimmed.slice(0, n - 1).trimEnd() + "…";
}

function unique(arr: string[]): string[] {
  return Array.from(new Set(arr.filter((x) => x && x.length > 0))).sort();
}
