import { DealPicker } from "@/components/DealPicker";

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

      <div className="flex-1 flex items-start pt-20">
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
