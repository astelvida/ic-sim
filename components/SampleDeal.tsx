"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { SAMPLE_BRIEF } from "@/lib/sample-deal";

// Zero-friction landing entry. Loads the hard-coded TORTUS AI brief straight
// into the session and walks into the room — no Notion connection, no
// /api/brief wait. `setBrief` resets the session reducer, so it is safe to run
// even after a prior session.
export function SampleDeal() {
  const router = useRouter();
  const { setBrief } = useSession();
  const [entering, setEntering] = useState(false);

  function run() {
    setEntering(true);
    setBrief(SAMPLE_BRIEF);
    router.push("/room");
  }

  return (
    <div className="border hairline-strong p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="min-w-0">
          <div className="mono text-[10px] tracking-[0.24em] uppercase text-amber mb-3">
            New here — try the sample deal
          </div>
          <div className="display text-[26px] leading-tight">{SAMPLE_BRIEF.company}</div>
          <p className="text-[13px] leading-relaxed text-bone-dim italic mt-1.5 max-w-xl">
            {SAMPLE_BRIEF.oneLiner}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {SAMPLE_BRIEF.chips.map((c) => (
              <span key={c} className="chip">
                {c}
              </span>
            ))}
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
          <button
            type="button"
            onClick={run}
            disabled={entering}
            className="btn-solid disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {entering ? "entering…" : "enter the room →"}
          </button>
          <span className="mono text-[9px] tracking-[0.18em] uppercase text-neutral">
            loads instantly · no setup
          </span>
        </div>
      </div>
    </div>
  );
}
