"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Brief } from "@/lib/types";

// The deal brief in the room: a compact one-line strip (the old full-width
// memo card sat too prominently above the conversation), with the full
// memo behind a right-anchored drawer.
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

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pb-3.5 mb-5 border-b hairline">
        <span className="mono text-[9px] tracking-[0.24em] uppercase text-neutral">
          Deal
        </span>
        <span className="display text-[18px] leading-none">{brief.company}</span>
        {brief.ssiScore !== null && (
          <>
            <Sep />
            <StripStat label="SSI" value={`${brief.ssiScore}/100`} />
          </>
        )}
        {brief.regEmbeddedness !== null && (
          <>
            <Sep />
            <StripStat label="Reg" value={`${brief.regEmbeddedness}/20`} />
          </>
        )}
        {brief.stage && (
          <>
            <Sep />
            <StripTag>{brief.stage}</StripTag>
          </>
        )}
        {brief.sector && (
          <>
            <Sep />
            <StripTag>{brief.sector}</StripTag>
          </>
        )}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="btn-ghost ml-auto hover:text-amber"
        >
          Full memo →
        </button>
      </div>

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

function Sep() {
  return <span className="text-neutral text-[11px] select-none">·</span>;
}

function StripStat({ label, value }: { label: string; value: string }) {
  return (
    <span className="mono text-[10px] tracking-[0.16em] uppercase text-neutral">
      {label} <span className="text-bone">{value}</span>
    </span>
  );
}

function StripTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="mono text-[10px] tracking-[0.16em] uppercase text-bone-dim">
      {children}
    </span>
  );
}

function FullMemo({ brief, onClose }: { brief: Brief; onClose: () => void }) {
  const e = brief.enrichment;
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

        {e &&
          (e.funding ||
            e.competitorPricing ||
            e.regulatoryStatus ||
            e.incumbentRoadmap ||
            e.comparables) && (
            <div className="pt-1">
              <Label>
                Live Web Enrichment
                {e.sourcedAt
                  ? ` · sourced ${new Date(e.sourcedAt).toLocaleDateString()}`
                  : ""}
              </Label>
              <dl className="mt-1.5 space-y-2.5">
                <EnrichRow label="Funding" value={e.funding} />
                <EnrichRow label="Competitor Pricing" value={e.competitorPricing} />
                <EnrichRow label="Regulatory Status" value={e.regulatoryStatus} />
                <EnrichRow label="Incumbent Roadmap" value={e.incumbentRoadmap} />
                <EnrichRow label="Comparables" value={e.comparables} />
              </dl>
            </div>
          )}

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

function EnrichRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <dt className="mono text-[9px] tracking-[0.2em] uppercase text-neutral mb-0.5">
        {label}
      </dt>
      <dd className="text-bone text-[12.5px] leading-relaxed">{value}</dd>
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
