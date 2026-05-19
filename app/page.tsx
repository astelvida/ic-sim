import { DealPicker } from "@/components/DealPicker";
import { DealsList } from "@/components/DealsList";

export default function Home() {
  return (
    <main className="min-h-dvh px-10 md:px-16 lg:px-24 py-10 flex flex-col">
      <header className="flex items-start justify-between pb-20 border-b hairline">
        <div>
          <div className="mono text-[10px] tracking-[0.3em] uppercase text-neutral mb-6">
            IC · SIM — v1.0 · Private Beta
          </div>
          <h1 className="display text-[clamp(46px,7vw,96px)] leading-[0.95] max-w-4xl">
            <span className="text-bone">The room has no sympathy.</span>
            <br />
            <span className="italic text-bone-dim">Rehearse before you enter it.</span>
          </h1>
        </div>
        <div className="hidden lg:block max-w-xs border-l hairline-strong pl-6 pt-2">
          <div className="mono text-[10px] tracking-[0.22em] uppercase text-neutral mb-2">
            Brief
          </div>
          <p className="text-[13px] leading-relaxed text-bone-dim">
            Four AI committee members. One deal. Ten turns. A scored transcript at the end.
            Built for analysts and principals who want reps before the real thing.
          </p>
        </div>
      </header>

      <section className="pt-16 pb-4">
        <div className="mono text-[10px] tracking-[0.3em] uppercase text-neutral mb-6">
          How it works
        </div>
        <ol className="space-y-3 max-w-3xl">
          <li className="flex gap-6">
            <span className="mono text-[10px] tracking-[0.22em] uppercase text-neutral pt-1 w-24 shrink-0">
              01 · Brief
            </span>
            <span className="text-[14px] leading-relaxed text-bone-dim">
              Run <code className="text-bone">/ic-brief</code> in Claude Code on a Notion deal page or pasted text. It returns a one-page JSON brief.
            </span>
          </li>
          <li className="flex gap-6">
            <span className="mono text-[10px] tracking-[0.22em] uppercase text-neutral pt-1 w-24 shrink-0">
              02 · Paste
            </span>
            <span className="text-[14px] leading-relaxed text-bone-dim">
              Drop the JSON below. You&rsquo;ll walk into a live room with four AI partners staring back.
            </span>
          </li>
          <li className="flex gap-6">
            <span className="mono text-[10px] tracking-[0.22em] uppercase text-neutral pt-1 w-24 shrink-0">
              03 · Defend
            </span>
            <span className="text-[14px] leading-relaxed text-bone-dim">
              Ten turns. Sentiment tracked per member. A scored rubric and PDF when the gavel drops.
            </span>
          </li>
        </ol>
      </section>

      <div className="pt-8">
        <DealsList />
      </div>

      <div className="flex-1 flex items-start pt-16">
        <DealPicker />
      </div>

      <footer className="mt-24 pt-6 border-t hairline flex items-center justify-between mono text-[10px] tracking-[0.22em] uppercase text-neutral">
        <div>IC-SIM · Engine</div>
        <div className="flex gap-10">
          <span>Skeptic</span>
          <span>Operator</span>
          <span>Reg. Hawk</span>
          <span>Portfolio Lens</span>
        </div>
        <div>built for ic reps</div>
      </footer>
    </main>
  );
}
