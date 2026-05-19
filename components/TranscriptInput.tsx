"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence } from "framer-motion";
import { LookupPanel } from "./LookupPanel";
import type { Brief, LookupResult, Source } from "@/lib/types";

interface Props {
  disabled: boolean;
  placeholder?: string;
  onSubmit: (text: string) => void;
  brief?: Brief;
  lastMemberQuestion?: string;
}

type LookupState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; result: LookupResult }
  | { kind: "error"; message: string };

export function TranscriptInput({
  disabled,
  placeholder,
  onSubmit,
  brief,
  lastMemberQuestion,
}: Props) {
  const [text, setText] = useState("");
  const [lookup, setLookup] = useState<LookupState>({ kind: "idle" });
  const ref = useRef<HTMLTextAreaElement>(null);
  const lookupAbort = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!disabled) ref.current?.focus();
  }, [disabled]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(240, el.scrollHeight) + "px";
  }, [text]);

  // Dismiss any stale lookup whenever a new committee question arrives — the
  // facts the user just asked for were scoped to the *previous* question.
  useEffect(() => {
    setLookup({ kind: "idle" });
  }, [lastMemberQuestion]);

  // Abort any in-flight lookup on unmount.
  useEffect(() => {
    return () => lookupAbort.current?.abort();
  }, []);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function submit() {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setText("");
    setLookup({ kind: "idle" });
  }

  const runLookup = useCallback(async () => {
    if (!brief) return;
    // Need *something* to scope the lookup: a draft OR a question to answer.
    if (!text.trim() && !lastMemberQuestion) return;

    lookupAbort.current?.abort();
    const controller = new AbortController();
    lookupAbort.current = controller;
    setLookup({ kind: "loading" });

    try {
      const res = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief,
          draftText: text,
          lastMemberQuestion,
        }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const errBody = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errBody.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { result?: LookupResult };
      if (!data.result) throw new Error("no result returned");
      setLookup({ kind: "ready", result: data.result });
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      const message = e instanceof Error ? e.message : "lookup failed";
      setLookup({ kind: "error", message });
    }
  }, [brief, text, lastMemberQuestion]);

  const insertFact = useCallback((factText: string, source?: Source) => {
    const cite = source?.title ? ` — ${source.title}` : "";

    setText((prev) => {
      const el = ref.current;
      const start = el?.selectionStart ?? prev.length;
      const end = el?.selectionEnd ?? prev.length;
      const before = prev.slice(0, start);
      const after = prev.slice(end);
      // Ensure the blockquote starts on its own line and is followed by a
      // blank line so the user can keep typing without colliding with it.
      const needsLeadingNewline = before.length > 0 && !before.endsWith("\n");
      const lead = needsLeadingNewline ? "\n" : "";
      const trail = after.startsWith("\n") ? "\n" : "\n\n";
      const block = `${lead}> ${factText}${cite}${trail}`;
      const next = before + block + after;
      queueMicrotask(() => {
        if (!ref.current) return;
        const caret = start + block.length;
        ref.current.focus();
        ref.current.setSelectionRange(caret, caret);
      });
      return next;
    });
  }, []);

  const dismissLookup = useCallback(() => {
    lookupAbort.current?.abort();
    setLookup({ kind: "idle" });
  }, []);

  const canLookup = !!brief && (text.trim().length > 0 || !!lastMemberQuestion);
  const lookupBusy = lookup.kind === "loading";

  return (
    <div>
      <AnimatePresence>
        {lookup.kind === "ready" && (
          <LookupPanel result={lookup.result} onInsert={insertFact} onDismiss={dismissLookup} />
        )}
      </AnimatePresence>

      {lookup.kind === "error" && (
        <div className="border hairline-strong bg-[rgba(122,35,40,0.06)] px-4 py-2.5 mb-3 flex items-center justify-between gap-3">
          <span className="mono text-[10px] tracking-[0.18em] uppercase text-oxblood">
            lookup failed · {lookup.message}
          </span>
          <button
            type="button"
            onClick={dismissLookup}
            className="mono text-[12px] text-neutral hover:text-bone leading-none p-1"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      <div className="border hairline-strong p-5 bg-[rgba(244,239,230,0.02)]">
        <div className="flex items-center justify-between mb-3 mono text-[10px] tracking-[0.2em] uppercase">
          <span className="text-neutral">
            Your response · Enter submits · Shift+Enter newline
          </span>
          <span className="text-bone-dim">{String(text.length).padStart(4, "0")}</span>
        </div>
        <textarea
          ref={ref}
          className="ic-input min-h-[72px]"
          placeholder={placeholder ?? "Make your case. Be specific. Name the numbers."}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={runLookup}
            disabled={!canLookup || lookupBusy || disabled}
            className="mono text-[10px] tracking-[0.18em] uppercase text-bone-dim hover:text-amber disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
            title={
              !brief
                ? "Brief not loaded"
                : !canLookup
                  ? "Type a draft or wait for a question"
                  : "Run a 2-search web lookup"
            }
          >
            {lookupBusy ? <Spinner /> : <SearchIconSm />}
            <span>{lookupBusy ? "Searching…" : "Look up"}</span>
          </button>
          <button
            onClick={submit}
            disabled={disabled || text.trim().length === 0}
            className="btn-solid disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {disabled ? "Committee speaking…" : "Send ⏎"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SearchIconSm() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className="animate-spin"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
