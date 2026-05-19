"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Brief } from "@/lib/types";

export function DealBrief({ brief, compact = false }: { brief: Brief; compact?: boolean }) {
  const [open, setOpen] = useState(!compact);
  return (
    <section className="border-b hairline pb-6 mb-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="mono text-[10px] tracking-[0.26em] uppercase text-neutral mb-2">
            Deal Brief · {brief.sector || "—"} · {brief.stage || "—"}
          </div>
          <h2 className="display text-[38px] leading-[1] tracking-tight">
            {brief.company}
          </h2>
          {brief.oneLiner && (
            <p className="mt-2 text-[14px] text-bone-dim max-w-xl italic">
              {brief.oneLiner}
            </p>
          )}
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="mono text-[10px] tracking-[0.2em] uppercase text-neutral hover:text-bone self-start"
        >
          {open ? "Collapse —" : "Expand +"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-2">
        {brief.chips?.slice(0, 6).map((c) => (
          <span key={c} className="chip">{c}</span>
        ))}
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.2, 0, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-8 pt-4">
              <div className="space-y-5 text-[13.5px] leading-relaxed text-bone-dim">
                <Field label="Thesis Fit" body={brief.thesisFit} />
                <Field label="Market" body={brief.marketSize} />
                <Field label="Competitive Landscape" body={brief.competitiveLandscape} />
                <Field label="Team" body={brief.team} />
                <Field label="Traction" body={brief.traction} />
                <Field label="Recent Signal" body={brief.recentSignal} />

                <div>
                  <div className="mono text-[10px] tracking-[0.22em] uppercase text-neutral mb-1">
                    Top Risks (pre-surfaced)
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-bone">
                    {brief.topRisks?.map((r, i) => <li key={i}>{r}</li>)}
                  </ol>
                </div>
              </div>

              <aside className="border-l hairline-strong pl-5 space-y-6">
                <Metric label="SSI Score" value={brief.ssiScore} max={100} accent="amber" />
                <Metric
                  label="Reg. Embeddedness"
                  value={brief.regEmbeddedness}
                  max={20}
                  accent="olive"
                />
              </aside>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Field({ label, body }: { label: string; body: string }) {
  if (!body) return null;
  return (
    <div>
      <div className="mono text-[10px] tracking-[0.22em] uppercase text-neutral mb-1">
        {label}
      </div>
      <p className="text-bone">{body}</p>
    </div>
  );
}

function Metric({
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
        <span className="mono text-[22px] text-bone">
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
