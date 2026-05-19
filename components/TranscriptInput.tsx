"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

interface Props {
  disabled: boolean;
  placeholder?: string;
  onSubmit: (text: string) => void;
}

export function TranscriptInput({ disabled, placeholder, onSubmit }: Props) {
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!disabled) ref.current?.focus();
  }, [disabled]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(240, el.scrollHeight) + "px";
  }, [text]);

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
  }

  return (
    <div className="border hairline-strong p-5 bg-[rgba(244,239,230,0.02)]">
      <div className="flex items-center justify-between mb-3 mono text-[10px] tracking-[0.2em] uppercase">
        <span className="text-neutral">Your response · Enter submits · Shift+Enter newline</span>
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
      <div className="mt-3 flex items-center justify-end gap-3">
        <button
          onClick={submit}
          disabled={disabled || text.trim().length === 0}
          className="btn-solid disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {disabled ? "Committee speaking…" : "Send ⏎"}
        </button>
      </div>
    </div>
  );
}
