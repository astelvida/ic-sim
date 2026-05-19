"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { COMMITTEE_BY_ID } from "@/lib/committee";
import type { Brief, Rubric, RubricScore, Turn } from "@/lib/types";

const PDFDownload = dynamic(() => import("./ReportPDF").then((m) => m.PDFDownload), {
  ssr: false,
  loading: () => (
    <span className="mono text-[10px] tracking-[0.2em] uppercase text-neutral">
      preparing pdf…
    </span>
  ),
});

const ROWS: Array<{ key: keyof Omit<Rubric, "overall" | "improvementNotes" | "summary">; label: string }> = [
  { key: "convictionClarity", label: "Conviction Clarity" },
  { key: "riskAck", label: "Risk Acknowledgment" },
  { key: "dataDensity", label: "Data Density" },
  { key: "thesisAlignment", label: "Thesis Alignment" },
  { key: "poise", label: "Poise Under Pressure" },
];

export function ScoreReport({
  brief,
  rubric,
  turns,
}: {
  brief: Brief;
  rubric: Rubric;
  turns: Turn[];
}) {
  const [showTranscript, setShowTranscript] = useState(false);

  return (
    <main className="min-h-dvh px-10 md:px-16 lg:px-24 py-12">
      <header className="flex items-start justify-between border-b hairline pb-10 mb-12">
        <div>
          <div className="mono text-[10px] tracking-[0.3em] uppercase text-neutral mb-5">
            IC · SIM — Post-Committee Report
          </div>
          <h1 className="display text-[64px] leading-[0.95] tracking-tight">
            {brief.company}
          </h1>
          <div className="mt-3 mono text-[11px] tracking-[0.18em] uppercase text-bone-dim">
            {brief.sector} · {brief.stage} · {turns.length} turns
          </div>
        </div>
        <div className="text-right">
          <div className="mono text-[10px] tracking-[0.24em] uppercase text-neutral mb-2">
            Weighted Score
          </div>
          <div className="display text-[96px] leading-none tracking-tight">
            {rubric.overall?.toFixed(1) ?? "—"}
          </div>
          <div className="mono text-[10px] tracking-[0.2em] uppercase text-neutral mt-1">
            out of 10.0
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-5 gap-0 mb-16 border hairline-strong">
        {ROWS.map((row, i) => {
          const score = rubric[row.key] as RubricScore;
          return (
            <motion.div
              key={row.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.2, 0, 0, 1] }}
              className={`p-6 ${i < 4 ? "md:border-r hairline-strong" : ""} border-b md:border-b-0 hairline-strong`}
            >
              <div className="mono text-[9px] tracking-[0.24em] uppercase text-neutral mb-4">
                {String(i + 1).padStart(2, "0")} · {row.label}
              </div>
              <div className="display text-[72px] leading-none tracking-tight text-bone">
                {score?.score ?? "—"}
                <span className="text-neutral text-[28px]"> /10</span>
              </div>
              <p className="mt-4 text-[12px] leading-relaxed text-bone-dim">
                {score?.justification}
              </p>
            </motion.div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 mb-12">
        <div>
          <div className="mono text-[10px] tracking-[0.24em] uppercase text-neutral mb-3">
            Summary
          </div>
          <p className="text-[18px] leading-relaxed display italic text-bone">
            {rubric.summary}
          </p>
        </div>
        <div>
          <div className="mono text-[10px] tracking-[0.24em] uppercase text-neutral mb-3">
            Improvement Notes · Next Time
          </div>
          <ol className="space-y-3 text-[14px] text-bone-dim">
            {rubric.improvementNotes?.map((note, i) => (
              <li key={i} className="flex gap-4 border-t hairline pt-3">
                <span className="mono text-[10px] text-neutral pt-1 w-6 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{note}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t hairline pt-6">
        <div className="flex items-center justify-between mb-5">
          <div className="mono text-[10px] tracking-[0.24em] uppercase text-neutral">
            Full Transcript
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-ghost" onClick={() => setShowTranscript((v) => !v)}>
              {showTranscript ? "Hide" : "Show"}
            </button>
            <PDFDownload brief={brief} rubric={rubric} turns={turns} />
          </div>
        </div>
        {showTranscript && (
          <motion.ol
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 max-w-4xl"
          >
            {turns.map((t) => (
              <li key={t.id} className="text-[13.5px] text-bone-dim">
                <div className="mono text-[10px] tracking-[0.2em] uppercase text-neutral mb-1">
                  {t.role === "presenter"
                    ? "Presenter"
                    : `${COMMITTEE_BY_ID[t.memberId!]?.archetype} — ${COMMITTEE_BY_ID[t.memberId!]?.name}`}
                </div>
                <p className="whitespace-pre-wrap">{t.text}</p>
              </li>
            ))}
          </motion.ol>
        )}
      </section>

      <footer className="mt-20 pt-6 border-t hairline mono text-[10px] tracking-[0.22em] uppercase text-neutral flex items-center justify-between">
        <Link href="/" className="hover:text-bone">← New Session</Link>
        <div>IC · SIM</div>
      </footer>
    </main>
  );
}
