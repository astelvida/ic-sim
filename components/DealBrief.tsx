"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Brief } from "@/lib/types";

export function DealBrief({ brief }: { brief: Brief }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Esc closes the drawer when it's open.
  useEffect(() => {
    if (!drawerOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDrawerOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  const thesisLead = brief.thesisFit
    ? brief.thesisFit.split(/\s+/).slice(0, 14).join(" ") +
      (brief.thesisFit.split(/\s+/).length > 14 ? "…" : "")
    : null;

  return (
    <>
      <section className="border-b hairline pb-5 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-start">
          {/* LEFT: identity */}
          <div className="min-w-0">
            <div className="mono text-[10px] tracking-[0.26em] uppercase text-neutral mb-1.5">
              Deal Brief · {brief.sector || "—"} · {brief.stage || "—"}
            </div>
            <h2 className="display text-[32px] leading-[1.05] tracking-tight">
              {brief.company}
            </h2>
            {brief.oneLiner && (
              <p className="mt-1.5 text-[13.5px] text-bone-dim italic max-w-2xl">
                {brief.oneLiner}
              </p>
            )}

            <div className="flex flex-wrap gap-1.5 mt-3">
              {brief.chips?.slice(0, 4).map((c) => (
                <span key={c} className="chip">
                  {c}
                </span>
              ))}
            </div>

            {thesisLead && (
              <p className="mt-3 text-[12.5px] text-bone-dim">
                <span className="mono text-[10px] tracking-[0.22em] uppercase text-neutral mr-2">
                  Thesis
                </span>
                <span className="italic">{thesisLead}</span>
              </p>
            )}
          </div>

          {/* RIGHT: metrics + action */}
          <div className="flex flex-col items-end gap-3 shrink-0">
            <div className="flex items-baseline gap-5">
              <InlineMetric label="SSI" value={brief.ssiScore} max={100} accent="amber" />
              <InlineMetric label="Reg" value={brief.regEmbeddedness} max={20} accent="olive" />
            </div>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="btn-ghost hover:text-amber"
            >
              Full memo →
            </button>
          </div>
        </div>

        {/* Top risks — collapsed to 3 lines */}
        {brief.topRisks && brief.topRisks.length > 0 && (
          <div className="mt-4 pt-4 border-t hairline grid grid-cols-1 md:grid-cols-3 gap-3">
            {brief.topRisks.slice(0, 3).map((r, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="mono text-[10px] tracking-[0.18em] uppercase text-oxblood mt-0.5 shrink-0">
                  R{i + 1}
                </span>
                <p className="text-[12.5px] text-bone-dim leading-snug line-clamp-2">{r}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Side drawer: the full memo */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="backdrop"
              className="fixed inset-0 bg-ink/70 backdrop-blur-[2px] z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              key="drawer"
              className="fixed top-0 right-0 bottom-0 w-[min(540px,94vw)] bg-ink border-l hairline-strong z-50 overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.36, ease: [0.2, 0, 0, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label="Full deal memo"
            >
              <FullMemo brief={brief} onClose={() => setDrawerOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function InlineMetric({
  label,
  value,
  max,
  accent,
}: {
  label: string;
  value: number | null;
  max: number;
  accent: "amber" | "olive";
}) {
  const pct = value !== null ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const color = accent === "amber" ? "var(--amber)" : "var(--olive)";
  return (
    <div className="flex flex-col items-end">
      <div className="flex items-baseline gap-1.5">
        <span className="mono text-[9px] tracking-[0.24em] uppercase text-neutral">{label}</span>
        <span className="mono text-[20px] text-bone leading-none">
          {value !== null ? value : "—"}
        </span>
        <span className="mono text-[10px] text-neutral leading-none">/{max}</span>
      </div>
      <div className="h-[2px] w-20 mt-1.5 bg-[var(--rule)]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: [0.2, 0, 0, 1] }}
          className="h-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

function FullMemo({ brief, onClose }: { brief: Brief; onClose: () => void }) {
  return (
    <div className="p-7">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="mono text-[10px] tracking-[0.3em] uppercase text-neutral mb-1.5">
            Full Memo · {brief.sector} · {brief.stage}
          </div>
          <h3 className="display text-[28px] leading-tight tracking-tight">{brief.company}</h3>
          {brief.oneLiner && (
            <p className="mt-2 text-[13px] text-bone-dim italic">{brief.oneLiner}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close memo"
          className="mono text-[14px] text-neutral hover:text-bone leading-none p-1"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-6">
        {brief.chips?.slice(0, 8).map((c) => (
          <span key={c} className="chip">
            {c}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b hairline">
        <DrawerMetric label="SSI Score" value={brief.ssiScore} max={100} accent="amber" />
        <DrawerMetric label="Reg. Embeddedness" value={brief.regEmbeddedness} max={20} accent="olive" />
      </div>

      <div className="space-y-5 text-[13px] leading-relaxed text-bone-dim">
        <Field label="Thesis Fit" body={brief.thesisFit} />
        <Field label="Product" body={brief.product} />
        <Field label="Business Model" body={brief.businessModel} />
        <Field label="Market" body={brief.marketSize} />

        {brief.marketSizing && (
          <div>
            <Label>Market Sizing</Label>
            <dl className="grid grid-cols-3 gap-3 mt-1">
              <Sizing label="TAM" value={brief.marketSizing.tam} />
              <Sizing label="SAM" value={brief.marketSizing.sam} />
              <Sizing label="SOM" value={brief.marketSizing.som} />
            </dl>
            {brief.marketSizing.methodology && (
              <p className="mt-2 text-bone text-[12.5px] italic">
                {brief.marketSizing.methodology}
              </p>
            )}
          </div>
        )}

        <Field label="Competitive Landscape" body={brief.competitiveLandscape} />

        {brief.competitors && brief.competitors.length > 0 && (
          <div>
            <Label>Named Competitors</Label>
            <ul className="mt-1 space-y-2">
              {brief.competitors.map((c, i) => (
                <li key={i} className="border-l hairline-strong pl-3">
                  <div className="text-bone">{c.name}</div>
                  <div className="text-bone-dim text-[12px]">{c.positioning}</div>
                  <div className="text-amber text-[11px] mt-0.5 italic">threat: {c.threat}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Field label="Regulatory Context" body={brief.regulatoryContext} />
        <Field label="Team" body={brief.team} />
        <Field label="Traction" body={brief.traction} />
        <Field label="Unit Economics" body={brief.unitEconomics} />
        <Field label="Cap Table" body={brief.capTable} />
        <Field label="Recent Signal" body={brief.recentSignal} />

        {brief.comparables && brief.comparables.length > 0 && (
          <div>
            <Label>Comparables</Label>
            <ul className="mt-1 space-y-1">
              {brief.comparables.map((c, i) => (
                <li key={i} className="flex justify-between gap-3 text-bone">
                  <span>{c.company}</span>
                  <span className="text-bone-dim text-[12px]">
                    {c.multiple ?? "—"}
                    {c.note ? ` · ${c.note}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <Label>Top Risks (pre-surfaced)</Label>
          <ol className="list-decimal list-inside space-y-1 text-bone mt-1">
            {brief.topRisks?.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ol>
        </div>

        {brief.keyQuestionsForIC && brief.keyQuestionsForIC.length > 0 && (
          <div>
            <Label>Key Questions for IC</Label>
            <ol className="list-decimal list-inside space-y-1 text-bone mt-1">
              {brief.keyQuestionsForIC.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ol>
          </div>
        )}

        {brief.sources && brief.sources.length > 0 && (
          <div className="pt-4 mt-4 border-t hairline">
            <Label>Sources</Label>
            <ul className="mt-1 space-y-1">
              {brief.sources.map((s, i) => (
                <li key={i} className="text-[11.5px] truncate">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-bone-dim hover:text-amber underline-offset-4 hover:underline"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mono text-[10px] tracking-[0.22em] uppercase text-neutral mb-1">
      {children}
    </div>
  );
}

function Field({ label, body }: { label: string; body?: string }) {
  if (!body) return null;
  return (
    <div>
      <Label>{label}</Label>
      <p className="text-bone">{body}</p>
    </div>
  );
}

function Sizing({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div className="mono text-[9px] tracking-[0.2em] uppercase text-neutral">{label}</div>
      <div className="text-bone text-[13px] mt-0.5">{value ?? "—"}</div>
    </div>
  );
}

function DrawerMetric({
  label,
  value,
  max,
  accent,
}: {
  label: string;
  value: number | null;
  max: number;
  accent: "amber" | "olive";
}) {
  const pct = value !== null ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const color = accent === "amber" ? "var(--amber)" : "var(--olive)";
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="mono text-[10px] tracking-[0.22em] uppercase text-neutral">{label}</span>
        <span className="mono text-[22px] text-bone leading-none">
          {value !== null ? value : "—"}
          <span className="text-neutral text-[12px]"> / {max}</span>
        </span>
      </div>
      <div className="h-[3px] w-full bg-[var(--rule)]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: [0.2, 0, 0, 1] }}
          className="h-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}
