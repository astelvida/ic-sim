# Frontend recommendations — IC-Sim

A focused design + framework audit, produced after this session shipped the dealflow browser + brief generator. Sorted by ROI. Read top-down; everything below "Defer" is fine to ignore.

**Stack as of audit:** Next.js `16.2.3` · React `19.2.4` · framer-motion `^12.38.0` · Tailwind `^4` · TypeScript `^5`.

---

## 1. What the aesthetic is doing well — preserve this

Before recommending changes, an honest accounting of what already works, so future polish doesn't drift away from it:

- **Typography pairing.** Fraunces (display serif with `SOFT` + `opsz` axes — meaningful warmth) + Inter Tight (body) + JetBrains Mono (uppercase 0.20em-tracked accents). This is genuinely distinctive — not the Inter / Space Grotesk default.
- **Palette discipline.** Ink `#0E0E0D` background, bone `#F4EFE6` foreground, two subtle rule tones (`rule` `0.14`, `rule-strong` `0.32`). Sharp sentiment accents (olive, amber, oxblood) used *only* for state signaling — never decoratively.
- **Editorial rhythm.** Hairline borders + uppercase mono labels + `display`-sized italic asides ("Rehearse before you enter it.") read as a magazine spread, not an app. The `.grain` overlay reinforces it.
- **Motion as discipline, not decoration.** `MemberCard.tsx` rotates `-0.3°` when active and pulses a 2px bar — that's the kind of restraint that reads as expensive. `CommitteeRoom` uses `layout` animations on the member column. Custom easing `[0.2, 0, 0, 1]` everywhere — consistent.

**Implication:** any new component must speak this language. Default Tailwind shadows, default Inter, default `motion.div` springs will visibly break the spell. The new `DealsList` is mostly OK but has two small drifts (below).

---

## 2. Top recommendations (highest ROI first)

### 2a. Migrate `DealsList.generateBrief` to `useActionState` (React 19 / Next 16 idiom)

**Why:** we hand-roll `generatingId` + `generateError` + `try/catch/finally` and manually guard against double-clicks via `disabled={generatingId !== null}`. React 19's `useActionState` collapses all three concerns and integrates with `startTransition` automatically.

**Current** (`components/DealsList.tsx:25-26, 55-77`):
```tsx
const [generatingId, setGeneratingId] = useState<string | null>(null);
const [generateError, setGenerateError] = useState<string | null>(null);

async function generateBrief(d: DealListItem) {
  setGeneratingId(d.id);
  setGenerateError(null);
  try {
    const r = await fetch("/api/brief", { method: "POST", ... });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`);
    setBrief(j.brief);
    router.push("/room");
  } catch (e) {
    setGenerateError(`${d.company}: ${e.message}`);
    setGeneratingId(null);
  }
}
```

**Recommended:**
```tsx
import { useActionState, startTransition } from "react";

type GenResult = { ok: true } | { ok: false; error: string };

async function generateBriefAction(_prev: GenResult | null, deal: DealListItem): Promise<GenResult> {
  const r = await fetch("/api/brief", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ notionId: deal.id }),
  });
  const j = await r.json();
  if (!r.ok) return { ok: false, error: `${deal.company}: ${j.error ?? `HTTP ${r.status}`}` };
  // brief setting + navigation belongs in the component, not the action
  return { ok: true };
}

// inside DealsList:
const [genState, runGen, pending] = useActionState(generateBriefAction, null);

// per-row click:
onClick={() => startTransition(() => runGen(d))}
// disabled={pending}
// error: genState?.ok === false && <p>{genState.error}</p>
```

The brief-setting + `router.push` still happens in a `useEffect` that watches `genState`, since `useActionState` actions can't safely touch client-only APIs like `router`. Net: ~10 LOC removed, double-click protection becomes automatic, pending state is a first-class hook value.

**Skip if:** you're planning to migrate `/api/brief` to a Server Action soon — in that case do both at once (see 2b).

---

### 2b. Consider converting `/api/brief` to a Server Action (medium effort, big payoff)

**Why:** Next.js 16 docs explicitly recommend Server Actions over API Routes for client-initiated mutations. You get automatic CSRF protection, integrated revalidation, no manual JSON serialization, and `useActionState` becomes a one-liner.

```tsx
// app/actions/brief.ts
"use server";
import { getAnthropic, MODEL_ID } from "@/lib/anthropic";
import { fetchDeal } from "@/lib/notion";
import type { Brief } from "@/lib/types";

export async function generateBriefFromNotion(notionId: string): Promise<Brief> {
  const deal = await fetchDeal(notionId);
  // ...rest of /api/brief logic, returning the Brief directly
}
```

Then in `DealsList`:
```tsx
const [genState, runGen, pending] = useActionState(
  async (_prev, deal: DealListItem) => generateBriefFromNotion(deal.id),
  null,
);
```

**Trade-off:** Server Actions are tied to the Next.js runtime — if you ever decoupled the frontend (mobile app, CLI), you'd want REST. Today there's no such surface, so this is purely upside.

**Recommendation:** do 2a first (cheap, no migration risk). Defer 2b until you're touching `/api/brief` for another reason.

---

### 2c. Add `loading.tsx` for the `/room` route (UX, ~10 LOC)

**Why:** when the user clicks `generate →`, the `/api/brief` call takes 3–8 seconds. We show `generating…` on the button, but as soon as `router.push("/room")` fires there's a *second* invisible loading phase while `/room` hydrates and the kickoff streaming turn begins. A `loading.tsx` boundary gives a branded skeleton during that gap.

**Add** `app/room/loading.tsx`:
```tsx
export default function Loading() {
  return (
    <main className="min-h-dvh px-8 md:px-12 py-6">
      <div className="mono text-[10px] tracking-[0.3em] uppercase text-neutral mb-6">
        IC · SIM — Taking your seat
      </div>
      <div className="display text-[clamp(28px,4vw,46px)] italic text-bone-dim">
        the room is assembling…
      </div>
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-[58fr_42fr] gap-10">
        <div className="space-y-3">
          <div className="h-4 bg-bone/[0.04] hairline" />
          <div className="h-4 bg-bone/[0.04] hairline w-3/4" />
          <div className="h-4 bg-bone/[0.04] hairline w-1/2" />
        </div>
        <div className="space-y-4">
          {[0,1,2,3].map(i => (
            <div key={i} className="border hairline-strong p-5">
              <div className="h-4 w-32 bg-bone/[0.04]" />
              <div className="mt-3 h-3 w-48 bg-bone/[0.03]" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
```

This costs almost nothing and removes the only "did my click do anything?" moment in the whole flow.

---

### 2d. SSI as a bar, not a number (15 LOC, big aesthetic payoff)

**Why:** Notion's own DB config marks `SSI Score` as `show_as: { type: "bar", maxValue: 100, color: "pink" }`. We're rendering it as a plain integer in the `DealsList` table. Adding a small inline bar visualizes the conviction spread at a glance and matches the source-of-truth UI in Notion. It also gives the table much-needed visual texture without adding color.

**In `DealsList.tsx`**, replace the SSI cell:
```tsx
<Td className="text-right mono w-24">
  {d.ssiScore === null ? "—" : <SsiBar value={d.ssiScore} />}
</Td>
```

Then a tiny inline component:
```tsx
function SsiBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center justify-end gap-2">
      <span>{Math.round(value)}</span>
      <div className="w-12 h-[3px] bg-bone/[0.08] relative">
        <div
          className="absolute inset-y-0 left-0 bg-bone"
          style={{ width: `${pct}%`, opacity: 0.4 + (pct / 100) * 0.6 }}
        />
      </div>
    </div>
  );
}
```

Opacity scales with score — an 88 bar visibly *feels* heavier than a 60. No color, just luminance — fits the bone-on-ink palette.

---

### 2e. Filter chips: hide rows where only one value exists

**Why:** if your active pipeline only has Seed deals, the "Stage" chip row shows a single `Seed` chip that does nothing useful when clicked. Render the FilterRow only when `values.length >= 2`. One-line change.

**In `components/DealsList.tsx`** — the `FilterRow` component already returns `null` for `values.length === 0`. Change to:
```tsx
if (values.length < 2) return null;
```

---

## 3. Library-version specific notes

### Motion / framer-motion

The library was **rebranded from `framer-motion` to `motion`** (different npm package, same authors, same API). You're on `framer-motion ^12.38.0` which is the last major version under the old name. The new `motion` package picks up at v11+ and adds APIs the old one won't get (`motion-dom` primitives, hardware-accelerated transforms via `motion-utils`).

**Recommendation:** *don't migrate yet*. `framer-motion ^12.38.0` still works, is still maintained as the React 19-compatible legacy path, and migrating means rewriting every `import { motion } from "framer-motion"` across `CommitteeRoom`, `MemberCard`, `DealPicker`, and `DealsList`. **Migrate when you upgrade Next.js again** so both touch the same files in one sweep.

**One small tactical change worth making now:** the `AnimatePresence` height-auto pattern in `DealsList` triggers a layout pass on every paint of the expansion. The modern Motion idiom is to use `layout` prop on a parent instead:
```tsx
<motion.div layout className="overflow-hidden">
  {open && <div>...</div>}
</motion.div>
```
Smoother on mobile Safari especially. Defer if no one's complained.

### Tailwind v4

You're using the v4 `@theme inline` pattern correctly (in `app/globals.css:16-30`). Two v4-specific affordances you're not using:

1. **Container queries** — `@container` queries are now first-class. The `MemberCard` would benefit: at narrow widths the avatar + sentiment dot can collide. `<aside @container>` wrapping the cards lets you write `@xs:flex-col` on inner content.
2. **`@starting-style` for entry animations** — pure-CSS alternative to AnimatePresence for simple opacity/transform entries. Useful for the `<HowItWorks />` rows; would let you drop framer-motion for that section entirely.

Neither is urgent.

### React 19

The `react-hooks/set-state-in-effect` lint rule that bit us in `DealsList` will likely fire on `CommitteeRoom.tsx` too if you tighten the config — the `useEffect` kickoff (`lines 93-99`) calls `start()` and `runMember()` which both update state. It's currently fine because the effect guards with `if (turns.length > 0) return`, but the React 19 idiom would be to fire `runMember` from a user action (the "Enter the Room →" button on the previous page) rather than as a side-effect of arriving at `/room`. Not urgent — current code works.

### Next.js 16

Beyond Server Actions (2b), the other Next 16 feature worth knowing:

- **`unstable_after`** for analytics or logging that should run after the response is sent — useful if you ever add session-completion telemetry to `/api/score`. No usage today.
- **Partial Prerendering** stable in 16.x — would let `app/page.tsx`'s static header + How-it-works pre-render while the `<DealsList />` panel streams in. Today the page is fast enough that it doesn't matter.

---

## 4. Aesthetic polish backlog (small, opinionated)

These aren't framework concerns — just things I noticed that would tighten the visual language. Pick zero, one, or all.

- **Numbered row marks in `DealsList` table.** Add a tiny `01 / 02 / ...` mono prefix in the leftmost column, footnote-style (`text-[9px] text-neutral mt-1`). Reinforces the editorial framing established on the landing page.
- **One-liner italic.** In `DealsList`, render the one-liner under company name in italics (`italic text-bone-dim`). Currently it's just dim — italicizing it visually demotes it to "tagline" rather than "body copy."
- **"copy prompt" / "generate →" — explicit hierarchy.** They're both text-link buttons today. Consider making `generate →` an actual `btn-ghost` (with the existing 1px border) so it feels like a commit, while `copy prompt` stays as a quiet underline. Right now they read as equal-weight options.
- **`HowItWorks` rows on landing page — consider a vertical rule.** The current implementation aligns labels in a fixed-width column. Adding a 1px hairline rule between the label column and description column would echo the section dividers used elsewhere and make the three steps feel more like a stepper than a list.
- **`MemberCard` avatar treatment.** Currently a square with display-font initials. Worth experimenting with a circle clip + serif italic initials for a more "partner portrait" feel, given the magazine vibe. Risk: cliché. Test before committing.

---

## 5. Defer (good ideas, low ROI today)

- **PWA / installable app manifest.** No mobile use case yet.
- **Dark/light theme toggle.** The aesthetic is *committed* to dark — adding light would dilute it. If you ever need a "presentation mode" for screen-sharing, that's a different feature.
- **Animation orchestration on `/report` entry.** The current report is fine. Until you actually screen-share this, polishing the entry doesn't matter.
- **Switching to `motion` (new package).** See above — wait for the next Next.js bump.
- **Tests, Storybook, or visual-regression.** No test runner is configured at all. Adding any visual testing infra is a separate project, not a polish task.

---

## 6. Suggested order of operations

If you do anything from this doc:

1. **2e** (filter chip threshold) — one-line fix, ship now.
2. **2c** (`loading.tsx`) — 10-min build, closes the only "did it work?" gap in the flow.
3. **2d** (SSI bar) — 15-min build, biggest aesthetic win for the table.
4. **2a** (`useActionState`) — 20-min refactor, removes manual pending/error state and a class of double-click bugs.
5. **2b** (Server Action migration) — only when you're touching `/api/brief` for another reason.

Everything in §4 is taste-dependent. Everything in §5 is "yes, eventually, but not while we're shipping."

---

*Audit produced by a session that just built the dealflow browser + brief generator + ic-deals skill output. Current as of `package.json` snapshot above; re-validate before acting if more than ~3 months have passed.*
