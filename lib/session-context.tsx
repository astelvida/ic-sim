"use client";

import { createContext, useContext, useReducer, useCallback } from "react";
import type { Brief, MemberId, Rubric, Sentiment, Turn } from "./types";

interface SessionState {
  brief: Brief | null;
  turns: Turn[];
  sentimentByMember: Partial<Record<MemberId, Sentiment>>;
  rubric: Rubric | null;
  startedAt: number | null;
  endedAt: number | null;
}

type Action =
  | { type: "set-brief"; brief: Brief }
  | { type: "start" }
  | { type: "add-turn"; turn: Turn }
  | { type: "update-last-member-turn"; text: string; sentiment?: Sentiment }
  | { type: "set-rubric"; rubric: Rubric }
  | { type: "end" }
  | { type: "reset" };

const initial: SessionState = {
  brief: null,
  turns: [],
  sentimentByMember: {},
  rubric: null,
  startedAt: null,
  endedAt: null,
};

function reducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case "set-brief":
      return { ...initial, brief: action.brief };
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
      return initial;
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
  const [state, dispatch] = useReducer(reducer, initial);

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
      value={{ ...state, setBrief, start, addTurn, updateLastMemberTurn, setRubric, end, reset }}
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
