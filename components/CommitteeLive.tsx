"use client";

import { motion } from "framer-motion";
import { COMMITTEE, initials } from "@/lib/committee";
import type { MemberId, Sentiment, Turn } from "@/lib/types";

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

interface Props {
  turns: Turn[];
  activeMember: MemberId | null;
  streaming: boolean;
  conferring: boolean;
  sentimentByMember: Partial<Record<MemberId, Sentiment>>;
}

// The Live view. The committee member on the table right now — and their full
// question — is the focal panel, rendered large and directly above the input
// so the presenter always sees what they are answering. The roster below
// tracks the other three.
export function CommitteeLive({
  turns,
  activeMember,
  streaming,
  conferring,
  sentimentByMember,
}: Props) {
  const memberTurns = turns.filter((t) => t.role === "member");
  const lastMemberTurn = memberTurns[memberTurns.length - 1] ?? null;
  // Focal = whoever is streaming now, else the member who spoke last (i.e. the
  // question the presenter is about to answer).
  const focalId: MemberId | null = activeMember ?? lastMemberTurn?.memberId ?? null;
  const focal = COMMITTEE.find((m) => m.id === focalId) ?? null;
  const focalTurn = focalId
    ? ([...memberTurns].reverse().find((t) => t.memberId === focalId) ?? null)
    : null;
  const focalStreaming = streaming && activeMember !== null && activeMember === focalId;
  const focalSent: Sentiment | "none" = (focalId && sentimentByMember[focalId]) || "none";

  return (
    <div className="flex flex-col gap-4">
      {/* Focal question — the one the presenter is answering */}
      <div className="border hairline-strong p-6 md:p-7 bg-[rgba(244,239,230,0.025)]">
        {focal ? (
          <>
            <div className="flex items-start justify-between gap-4 mb-3.5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 border hairline-strong flex items-center justify-center shrink-0">
                  <span className="display text-[16px] text-bone">
                    {initials(focal.name)}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="display text-[19px] leading-tight">{focal.name}</div>
                  <div className="mono text-[10px] tracking-[0.2em] uppercase text-neutral mt-0.5">
                    {focal.archetype}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mono text-[10px] tracking-[0.16em] uppercase text-bone-dim shrink-0">
                <span
                  className={`inline-block w-[7px] h-[7px] rounded-full ${SENT_DOT[focalSent]}`}
                />
                <span>{focalStreaming ? "Speaking now" : SENT_LABEL[focalSent]}</span>
              </div>
            </div>
            <p
              className={`text-[15px] leading-relaxed text-bone whitespace-pre-wrap ${
                focalStreaming ? "caret" : ""
              }`}
            >
              {focalTurn?.text || (focalStreaming ? "" : "…")}
            </p>
          </>
        ) : (
          <p className="text-[14px] text-neutral italic">
            {conferring
              ? "The committee is conferring…"
              : "The committee is reviewing the brief…"}
          </p>
        )}
      </div>

      {/* Roster — the full committee at a glance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {COMMITTEE.map((m) => {
          const count = memberTurns.filter((t) => t.memberId === m.id).length;
          const isActive = activeMember === m.id;
          const s: Sentiment | "none" = sentimentByMember[m.id] ?? "none";
          const status =
            isActive && streaming
              ? "Speaking"
              : count > 0
                ? `${count} turn${count > 1 ? "s" : ""}`
                : "Yet to speak";
          return (
            <motion.div
              key={m.id}
              animate={{ opacity: isActive ? 1 : 0.8 }}
              transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
              className={`flex items-center gap-2.5 border px-3 py-2.5 ${
                isActive ? "hairline-strong bg-[rgba(244,239,230,0.04)]" : "hairline"
              }`}
            >
              <span
                className={`inline-block w-[6px] h-[6px] rounded-full shrink-0 ${SENT_DOT[s]}`}
              />
              <div className="min-w-0">
                <div className="text-[12.5px] text-bone leading-tight truncate">{m.name}</div>
                <div className="mono text-[9px] tracking-[0.16em] uppercase text-neutral">
                  {m.archetype}
                </div>
              </div>
              <span className="mono text-[9px] tracking-[0.16em] uppercase text-bone-dim ml-auto shrink-0">
                {status}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
