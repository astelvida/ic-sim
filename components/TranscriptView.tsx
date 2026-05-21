"use client";

import { COMMITTEE_BY_ID } from "@/lib/committee";
import type { Turn } from "@/lib/types";

// The Transcript view — the full chronological log of the room, committee
// questions and presenter answers alike, all rendered from the same `turns`
// array that drives the Live view.
export function TranscriptView({ turns }: { turns: Turn[] }) {
  const visible = turns.filter((t) => t.text.trim().length > 0);

  if (visible.length === 0) {
    return (
      <div className="border hairline-strong p-6">
        <p className="text-[13px] text-neutral italic">
          No turns yet — the committee is about to open.
        </p>
      </div>
    );
  }

  return (
    <div className="border hairline-strong">
      {visible.map((t, i) => {
        const isPresenter = t.role === "presenter";
        const speaker = isPresenter
          ? "You"
          : (t.memberId && COMMITTEE_BY_ID[t.memberId]?.archetype) || "Committee";
        return (
          <div
            key={t.id}
            className={`px-5 py-4 border-b hairline last:border-b-0 ${
              isPresenter ? "" : "bg-[rgba(244,239,230,0.022)]"
            }`}
          >
            <div
              className={`mono text-[10px] tracking-[0.2em] uppercase mb-1.5 ${
                isPresenter ? "text-bone-dim" : "text-amber"
              }`}
            >
              {speaker} · turn {i + 1}
            </div>
            <p className="text-[13.5px] leading-relaxed text-bone whitespace-pre-wrap">
              {t.text}
            </p>
          </div>
        );
      })}
    </div>
  );
}
