"use client";

import { motion } from "framer-motion";
import type { CommitteeMember, Sentiment, Turn } from "@/lib/types";
import { initials } from "@/lib/committee";

interface Props {
  member: CommitteeMember;
  sentiment: Sentiment | undefined;
  isActive: boolean;
  isStreaming: boolean;
  lastTurn: Turn | null;
  turnCount: number;
}

const SENT_DOT: Record<Sentiment | "none", string> = {
  positive: "dot-olive",
  neutral: "dot-neutral",
  skeptical: "dot-amber",
  hostile: "dot-oxblood",
  none: "dot-neutral",
};

const SENT_LABEL: Record<Sentiment | "none", string> = {
  positive: "Aligned",
  neutral: "Neutral",
  skeptical: "Skeptical",
  hostile: "Hostile",
  none: "—",
};

export function MemberCard({ member, sentiment, isActive, isStreaming, lastTurn, turnCount }: Props) {
  const sent = sentiment ?? "none";
  return (
    <motion.div
      animate={{
        rotate: isActive ? -0.3 : 0,
        x: isActive ? -4 : 0,
      }}
      transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
      className={`relative border hairline-strong pl-5 pr-5 py-5 transition-colors ${
        isActive ? "bg-[rgba(244,239,230,0.035)]" : ""
      }`}
    >
      {/* left pulse bar */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-[2px]"
        animate={{
          background: isActive ? "var(--bone)" : "var(--rule-strong)",
          opacity: isActive ? [0.5, 1, 0.5] : 1,
        }}
        transition={{
          duration: isActive ? 1.8 : 0.3,
          repeat: isActive ? Infinity : 0,
          ease: "easeInOut",
        }}
      />

      <div className="flex items-start gap-4">
        <div className="w-11 h-11 border hairline-strong flex items-center justify-center shrink-0">
          <span className="display text-[18px] text-bone">{initials(member.name)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <div className="display text-[18px] leading-tight">{member.name}</div>
              <div className="mono text-[10px] tracking-[0.18em] uppercase text-neutral mt-0.5">
                {member.archetype}
              </div>
            </div>
            <div className="flex items-center gap-2 mono text-[10px] tracking-[0.16em] uppercase text-bone-dim shrink-0">
              <span className={`inline-block w-[7px] h-[7px] rounded-full ${SENT_DOT[sent]}`} />
              <span>{SENT_LABEL[sent]}</span>
            </div>
          </div>
          <p className="mt-1.5 text-[11.5px] text-neutral italic">{member.tagline}</p>

          {lastTurn && (
            <div className="mt-3 pt-3 border-t hairline">
              <p className={`text-[13px] leading-relaxed text-bone whitespace-pre-wrap ${isStreaming ? "caret" : ""}`}>
                {lastTurn.text || (isStreaming ? "…" : "")}
              </p>
            </div>
          )}

          <div className="mt-3 mono text-[10px] tracking-[0.2em] uppercase text-neutral">
            {turnCount > 0 ? `${String(turnCount).padStart(2, "0")} turns spoken` : "awaiting first turn"}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
