"use client";

import { createContext, useContext, useEffect, useReducer, useCallback } from "react";
import type { Brief, MemberId, Rubric, Sentiment, Turn } from "./types";

interface SessionState {
  brief: Brief | null;
  turns: Turn[];
  sentimentByMember: Partial<Record<MemberId, Sentiment>>;
  rubric: Rubric | null;
  startedAt: number | null;
  endedAt: number | null;
  // `hydrated` is false during the initial SSR + first client render. It flips to
  // true once the mount effect runs and reads sessionStorage (client-only). Kept
  // inside SessionState so the hydrate transition is a single atomic dispatch.
  hydrated: boolean;
}

type Action =
  | { type: "set-brief"; brief: Brief }
  | { type: "start" }
  | { type: "add-turn"; turn: Turn }
  | { type: "update-last-member-turn"; text: string; sentiment?: Sentiment }
  | { type: "set-rubric"; rubric: Rubric }
  | { type: "end" }
  | { type: "reset" }
  | { type: "hydrate"; state: SessionState };

const initial: SessionState = {
  brief: null,
  turns: [],
  sentimentByMember: {},
  rubric: null,
  startedAt: null,
  endedAt: null,
  hydrated: false,
};

// sessionStorage key. sessionStorage (not localStorage) is deliberate: tab-scoped,
// clears on tab close — appropriate for sensitive pipeline deal data and prevents
// cross-tab pollution.
const STORAGE_KEY = "ic-sim:session-v1";

function loadFromStorage(): SessionState {
  if (typeof window === "undefined") return initial;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...initial, hydrated: true };
    const parsed = JSON.parse(raw) as Partial<SessionState>;
    // Validate the minimum shape — if the schema drifts across releases, fall back.
    if (parsed && typeof parsed === "object" && "brief" in parsed && "turns" in parsed) {
      // `hydrated: true` flips on regardless of whether storage had data — what we're
      // marking is that we've consulted it, not that it was populated.
      return { ...initial, ...parsed, hydrated: true };
    }
  } catch {
    /* corrupt — fall through to fresh state */
  }
  return { ...initial, hydrated: true };
}

function reducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case "set-brief":
      // Reset session state but preserve `hydrated` — by the time anyone calls
      // setBrief() we're past the initial hydration window. Resetting it would
      // re-trigger the "Restoring session…" placeholder on /room.
      return { ...initial, hydrated: state.hydrated, brief: action.brief };
    case "start":
      return { ...state, startedAt: Date.now() };
    case "add-turn":
      return {
        ...state,
        turns: [...state.turns, action.turn],
        sentimentByMember:
          action.turn.role === "member" && action.turn.memberId && action.turn.sentiment
            ? { ...state.sentimentByMember, [action.turn.memberId]: action.turn.sentiment }
            : state.sentimentByMember,
      };
    case "update-last-member-turn": {
      const turns = [...state.turns];
      for (let i = turns.length - 1; i >= 0; i--) {
        if (turns[i].role === "member") {
          turns[i] = {
            ...turns[i],
            text: action.text,
            sentiment: action.sentiment ?? turns[i].sentiment,
          };
          break;
        }
      }
      const last = turns[turns.length - 1];
      const nextSentimentMap =
        last?.role === "member" && last.memberId && last.sentiment
          ? { ...state.sentimentByMember, [last.memberId]: last.sentiment }
          : state.sentimentByMember;
      return { ...state, turns, sentimentByMember: nextSentimentMap };
    }
    case "set-rubric":
      return { ...state, rubric: action.rubric };
    case "end":
      return { ...state, endedAt: Date.now() };
    case "reset":
      return { ...initial, hydrated: state.hydrated };
    case "hydrate":
      return action.state;
  }
}

interface SessionContextValue extends SessionState {
  setBrief: (brief: Brief) => void;
  start: () => void;
  addTurn: (turn: Turn) => void;
  updateLastMemberTurn: (text: string, sentiment?: Sentiment) => void;
  setRubric: (rubric: Rubric) => void;
  end: () => void;
  reset: () => void;
}

const Ctx = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  // IMPORTANT: do NOT lazy-init from sessionStorage. Lazy init runs both during
  // SSR (window undefined → returns `initial`) and on client hydration (window
  // available → returns restored state). The divergence causes a hydration
  // mismatch that React 19 logs and re-renders to recover from.
  // Instead, always start from `initial`, then hydrate inside useEffect (client-only).
  const [state, dispatch] = useReducer(reducer, initial);

  // One-shot hydration on mount. Single dispatch flips `state.hydrated` atomically
  // (loadFromStorage always returns hydrated:true on both populated and empty paths),
  // so no second setState is needed inside the effect — which also avoids React's
  // cascading-render warning for setState-in-effect.
  useEffect(() => {
    dispatch({ type: "hydrate", state: loadFromStorage() });
  }, []);

  // Persist on every state change. Skip the pre-hydration phase to avoid clobbering
  // a previously-stored session before we've consulted it.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!state.hydrated) return;
    try {
      if (state.brief === null && state.turns.length === 0 && state.rubric === null) {
        window.sessionStorage.removeItem(STORAGE_KEY);
      } else {
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    } catch {
      /* quota / disabled storage — fail open, session is best-effort */
    }
  }, [state]);

  const setBrief = useCallback((brief: Brief) => dispatch({ type: "set-brief", brief }), []);
  const start = useCallback(() => dispatch({ type: "start" }), []);
  const addTurn = useCallback((turn: Turn) => dispatch({ type: "add-turn", turn }), []);
  const updateLastMemberTurn = useCallback(
    (text: string, sentiment?: Sentiment) =>
      dispatch({ type: "update-last-member-turn", text, sentiment }),
    []
  );
  const setRubric = useCallback((rubric: Rubric) => dispatch({ type: "set-rubric", rubric }), []);
  const end = useCallback(() => dispatch({ type: "end" }), []);
  const reset = useCallback(() => dispatch({ type: "reset" }), []);

  return (
    <Ctx.Provider
      value={{
        ...state,
        setBrief,
        start,
        addTurn,
        updateLastMemberTurn,
        setRubric,
        end,
        reset,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useSession(): SessionContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSession must be used within SessionProvider");
  return v;
}
