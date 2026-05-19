// Session-end policy. PRD §12.6.
//
// Three end conditions, two automatic + one user-facing hint:
//   - hard_cap_turns : presenter has responded HARD_CAP_TURNS times → auto-end
//   - hard_cap_time  : elapsed ≥ HARD_CAP_MS                       → auto-end
//   - soft_end       : 8 member turns + 15 min + all 4 members spoken
//                      → "End now" button gets a "Soft end available" hint;
//                        user still has to click. NOT automatic.
//
// A separate warning fires at WARNING_MS (2 min before hard time cap) so the
// user knows to wrap their current answer.

export const SOFT_END_TURNS = 8;
export const SOFT_END_MS = 15 * 60_000;
export const HARD_CAP_TURNS = 12;
export const HARD_CAP_MS = 18 * 60_000;
export const WARNING_MS = 16 * 60_000;

export type AutoEndReason = "hard_cap_turns" | "hard_cap_time" | null;

export interface AutoEndState {
  // Number of *presenter* responses already recorded. Hits HARD_CAP_TURNS when
  // the user finishes their 12th answer; we cap on the presenter side so the
  // committee isn't cut off mid-question.
  presenterTurns: number;
  elapsedMs: number;
}

export function shouldAutoEnd(state: AutoEndState): AutoEndReason {
  if (state.presenterTurns >= HARD_CAP_TURNS) return "hard_cap_turns";
  if (state.elapsedMs >= HARD_CAP_MS) return "hard_cap_time";
  return null;
}

export interface SoftEndState {
  memberTurns: number;
  elapsedMs: number;
  uniqueMembersSpoken: number;
}

// "End now" is a polite suggestion, not a force. Triggered only after the
// committee has had a fair innings: 8+ questions, 15+ minutes, all 4 voices.
export function isSoftEndAvailable(state: SoftEndState): boolean {
  return (
    state.memberTurns >= SOFT_END_TURNS &&
    state.elapsedMs >= SOFT_END_MS &&
    state.uniqueMembersSpoken >= 4
  );
}

export function isInWarningWindow(elapsedMs: number): boolean {
  return elapsedMs >= WARNING_MS && elapsedMs < HARD_CAP_MS;
}
