export default function Loading() {
  return (
    <main className="min-h-dvh px-8 md:px-12 py-6">
      <header className="flex items-center justify-between mb-6 pb-4 border-b hairline">
        <div className="flex items-baseline gap-5">
          <div className="mono text-[10px] tracking-[0.3em] uppercase text-neutral">
            IC · SIM — Taking your seat
          </div>
          <div className="mono text-[10px] tracking-[0.2em] uppercase text-bone-dim">
            Turn 00 / 20
          </div>
        </div>
        <div className="mono text-[10px] tracking-[0.2em] uppercase text-neutral opacity-50">
          assembling…
        </div>
      </header>

      <div className="pt-2">
        <div className="display text-[clamp(28px,4vw,46px)] italic text-bone-dim leading-tight max-w-2xl">
          the room is taking its seats…
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-[58fr_42fr] gap-10">
        <section className="space-y-3">
          <Pulse className="h-4 w-2/3" />
          <Pulse className="h-4 w-full" />
          <Pulse className="h-4 w-5/6" />
          <Pulse className="h-4 w-1/2" />
          <div className="pt-6 space-y-2">
            <Pulse className="h-3 w-full" />
            <Pulse className="h-3 w-11/12" />
            <Pulse className="h-3 w-10/12" />
          </div>
        </section>

        <aside className="flex flex-col gap-4">
          <div className="mono text-[10px] tracking-[0.24em] uppercase text-neutral mb-1">
            Committee — 4 Partners
          </div>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="border hairline-strong p-5 flex items-start gap-4"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <Pulse className="w-11 h-11 shrink-0" />
              <div className="flex-1 space-y-2">
                <Pulse className="h-4 w-32" />
                <Pulse className="h-3 w-24" />
                <Pulse className="h-3 w-48 mt-2" />
              </div>
            </div>
          ))}
        </aside>
      </div>
    </main>
  );
}

function Pulse({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-bone/[0.06] hairline animate-pulse [animation-duration:1.6s] ${className}`}
    />
  );
}
