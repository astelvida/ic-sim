"use client";

import { motion } from "framer-motion";
import type { LookupFact, LookupResult, Source } from "@/lib/types";

interface Props {
  result: LookupResult;
  onInsert: (factText: string, source?: Source) => void;
  onDismiss: () => void;
}

export function LookupPanel({ result, onInsert, onDismiss }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.24, ease: [0.2, 0, 0, 1] }}
      className="border hairline-strong bg-[rgba(198,154,60,0.04)] mb-3"
      role="region"
      aria-label="Research suggestions"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b hairline">
        <div className="flex items-center gap-2 min-w-0">
          <SearchIcon />
          <span className="display text-[13.5px] tracking-tight text-bone truncate">
            {result.tip}
          </span>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss suggestions"
          className="mono text-[12px] text-neutral hover:text-bone leading-none p-1 shrink-0"
        >
          ✕
        </button>
      </div>

      <ul className="divide-y divide-[var(--rule)]">
        {result.facts.map((fact, i) => (
          <FactRow key={i} fact={fact} onInsert={onInsert} />
        ))}
      </ul>

      <div className="px-4 py-2 mono text-[9.5px] tracking-[0.22em] uppercase text-neutral">
        Click a fact to insert as a quote into your draft
      </div>
    </motion.div>
  );
}

function FactRow({
  fact,
  onInsert,
}: {
  fact: LookupFact;
  onInsert: (factText: string, source?: Source) => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onInsert(fact.text, fact.source)}
        className="w-full text-left px-4 py-3 hover:bg-[rgba(244,239,230,0.035)] transition-colors group flex items-start gap-3"
      >
        <span className="mono text-[10px] tracking-[0.18em] uppercase text-amber mt-0.5 shrink-0 opacity-80 group-hover:opacity-100">
          ◆
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-bone leading-relaxed">{fact.text}</p>
          {fact.source && (
            <a
              href={fact.source.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mono text-[9.5px] tracking-[0.16em] uppercase text-bone-dim hover:text-amber mt-1 inline-block truncate max-w-full underline-offset-4 hover:underline"
            >
              {fact.source.title}
            </a>
          )}
        </div>
      </button>
    </li>
  );
}

function SearchIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-amber shrink-0"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
