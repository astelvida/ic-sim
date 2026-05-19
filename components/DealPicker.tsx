"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/session-context";
import type { DealListItem } from "@/lib/types";

type Tab = "notion" | "paste";

export function DealPicker() {
  const router = useRouter();
  const { setBrief } = useSession();
  const [tab, setTab] = useState<Tab>("notion");
  const [deals, setDeals] = useState<DealListItem[] | null>(null);
  const [notionError, setNotionError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rawText, setRawText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (tab !== "notion" || deals !== null) return;
    fetch("/api/deals")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setNotionError(d.error);
          setDeals([]);
        } else {
          setDeals(d.deals);
          setNotionError(null);
        }
      })
      .catch((e) => {
        setNotionError(e instanceof Error ? e.message : "network error");
        setDeals([]);
      });
  }, [tab, deals]);

  async function submit() {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const body =
        tab === "notion"
          ? { notionId: selectedId }
          : { rawText };
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "failed to generate brief");
      setBrief(data.brief);
      router.push("/room");
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "error");
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit =
    !submitting &&
    ((tab === "notion" && selectedId) || (tab === "paste" && rawText.trim().length > 60));

  return (
    <section className="w-full max-w-5xl">
      <div className="flex items-end justify-between mb-8 border-b hairline pb-4">
        <div className="flex gap-8">
          {(["notion", "paste"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`mono text-[11px] tracking-[0.18em] uppercase pb-2 border-b-2 transition-colors ${
                tab === t ? "border-bone text-bone" : "border-transparent text-neutral hover:text-bone-dim"
              }`}
            >
              {t === "notion" ? "From Dealflow DB" : "Paste Summary"}
            </button>
          ))}
        </div>
        <div className="mono text-[10px] tracking-[0.22em] uppercase text-neutral">
          01 — Deal Selection
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tab === "notion" ? (
          <motion.div
            key="notion"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.36, ease: [0.2, 0, 0, 1] }}
          >
            <NotionList
              deals={deals}
              error={notionError}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </motion.div>
        ) : (
          <motion.div
            key="paste"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.36, ease: [0.2, 0, 0, 1] }}
          >
            <PasteBox value={rawText} onChange={setRawText} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-10 flex items-center justify-between">
        <div className="mono text-[10px] tracking-[0.2em] uppercase text-neutral">
          {tab === "paste"
            ? `${rawText.trim().length.toString().padStart(4, "0")} chars — min 060 required`
            : selectedId
              ? "ready — 1 company selected"
              : "select a company to proceed"}
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

function NotionList({
  deals,
  error,
  selectedId,
  onSelect,
}: {
  deals: DealListItem[] | null;
  error: string | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (error) {
    return (
      <div className="border hairline p-6 mono text-[12px] text-bone-dim">
        <div className="text-oxblood uppercase tracking-[0.16em] text-[10px] mb-2">
          Notion unreachable
        </div>
        {error}
        <div className="mt-3 text-neutral">
          Set <code className="text-bone">NOTION_TOKEN</code> and{" "}
          <code className="text-bone">NOTION_DEALFLOW_DS_ID</code> in{" "}
          <code className="text-bone">.env.local</code>, or paste a summary instead.
        </div>
      </div>
    );
  }
  if (deals === null) {
    return (
      <div className="mono text-[11px] uppercase tracking-[0.18em] text-neutral">
        loading dealflow…
      </div>
    );
  }
  if (deals.length === 0) {
    return (
      <div className="mono text-[11px] text-neutral">No deals returned.</div>
    );
  }
  return (
    <ul className="divide-y divide-[var(--rule)] border-y hairline">
      {deals.map((d) => {
        const selected = d.id === selectedId;
        return (
          <li key={d.id}>
            <button
              onClick={() => onSelect(d.id)}
              className={`w-full text-left grid grid-cols-[1fr_160px_60px_160px] items-center gap-6 px-0 py-4 group transition-colors ${
                selected ? "bg-[rgba(244,239,230,0.05)]" : "hover:bg-[rgba(244,239,230,0.025)]"
              }`}
            >
              <div>
                <div className="display text-[22px] leading-tight">
                  {d.company}
                  {selected && (
                    <span className="mono ml-3 text-[10px] tracking-[0.2em] text-olive">
                      ● SELECTED
                    </span>
                  )}
                </div>
                {d.oneLiner && (
                  <div className="text-[13px] text-bone-dim mt-1 max-w-xl">{d.oneLiner}</div>
                )}
              </div>
              <div className="mono text-[10px] tracking-[0.16em] uppercase text-neutral">
                {d.sector || "—"}
              </div>
              <div className="mono text-[11px] text-bone">
                {d.ssiScore !== null ? d.ssiScore : "—"}
              </div>
              <div className="mono text-[10px] tracking-[0.16em] uppercase text-bone-dim">
                {d.signalTier || d.priority || d.status}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function PasteBox({ value, onChange }: { value: string; onChange: (s: string) => void }) {
  return (
    <div className="border hairline-strong p-6 min-h-[260px]">
      <div className="mono text-[10px] tracking-[0.2em] uppercase text-neutral mb-3">
        Paste deal summary · one-pager · market memo
      </div>
      <textarea
        className="ic-input min-h-[220px]"
        placeholder="Brookfield Radiology AI — FDA-cleared chest X-ray triage model. $2.4M seed led by Bessemer. 14 hospital pilots, 3 paid. Targeting DACH radiology groups with MDR-grade compliance tooling…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
