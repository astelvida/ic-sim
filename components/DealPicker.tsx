"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSession } from "@/lib/session-context";
import type { Brief } from "@/lib/types";

function extractJson(s: string): string {
  const fenced = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first !== -1 && last !== -1) return s.slice(first, last + 1);
  return s.trim();
}

const REQUIRED_BRIEF_FIELDS: Array<keyof Brief> = [
  "company",
  "oneLiner",
  "sector",
  "stage",
  "thesisFit",
  "topRisks",
  "marketSize",
  "competitiveLandscape",
  "team",
  "traction",
  "recentSignal",
  "chips",
];

function parseBrief(input: string): Brief {
  const json = extractJson(input);
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("input is not valid JSON — run /ic-brief in Claude Code and paste its JSON output");
  }
  if (!parsed || typeof parsed !== "object") {
    throw new Error("expected a JSON object matching the Brief shape");
  }
  const obj = parsed as Record<string, unknown>;
  const missing = REQUIRED_BRIEF_FIELDS.filter((k) => !(k in obj));
  if (missing.length) {
    throw new Error(`missing required Brief fields: ${missing.join(", ")}`);
  }
  if (!Array.isArray(obj.topRisks) || !Array.isArray(obj.chips)) {
    throw new Error("topRisks and chips must be arrays");
  }
  return obj as unknown as Brief;
}

export function DealPicker() {
  const router = useRouter();
  const { setBrief } = useSession();
  const [rawText, setRawText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function submit() {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const brief = parseBrief(rawText);
      setBrief(brief);
      router.push("/room");
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "error");
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = !submitting && rawText.trim().startsWith("{");

  return (
    <section className="w-full max-w-5xl">
      <div className="flex items-end justify-between mb-8 border-b hairline pb-4">
        <div className="display text-[22px] leading-tight">Paste Brief JSON</div>
        <div className="mono text-[10px] tracking-[0.22em] uppercase text-neutral">
          02 — Paste Brief JSON
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.36, ease: [0.2, 0, 0, 1] }}
      >
        <PasteBox value={rawText} onChange={setRawText} />
      </motion.div>

      <div className="mt-10 flex items-center justify-between">
        <div className="mono text-[10px] tracking-[0.2em] uppercase text-neutral">
          {rawText.trim().startsWith("{")
            ? "looks like JSON — submit to validate"
            : "need a brief? run /ic-brief in Claude Code, then paste the JSON here"}
        </div>
        <button
          disabled={!canSubmit}
          onClick={submit}
          className="btn-solid disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {submitting ? "Preparing…" : "Enter the Room →"}
        </button>
      </div>
      {submitError && (
        <div className="mt-4 text-[11px] mono text-oxblood uppercase tracking-[0.14em]">
          error: {submitError}
        </div>
      )}
    </section>
  );
}

function PasteBox({ value, onChange }: { value: string; onChange: (s: string) => void }) {
  return (
    <div className="border hairline-strong p-6 min-h-[260px]">
      <div className="mono text-[10px] tracking-[0.2em] uppercase text-neutral mb-3">
        Step 02 — paste the JSON your <code className="text-bone">/ic-brief</code> skill returned
      </div>
      <textarea
        className="ic-input min-h-[220px] font-mono text-[12px]"
        placeholder={`{\n  "company": "Brookfield Radiology AI",\n  "oneLiner": "FDA-cleared chest X-ray triage for DACH radiology groups",\n  "sector": "HealthTech",\n  "stage": "Seed",\n  "thesisFit": "...",\n  "topRisks": ["...", "...", "..."],\n  "chips": ["Seed", "P1", "MDR"]\n  ...\n}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
