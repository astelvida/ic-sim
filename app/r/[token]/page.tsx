import Link from "next/link";
import type { Metadata } from "next";
import { decodeShareToken } from "@/lib/share-token";
import type { SharePayload } from "@/lib/types";

// Decoding uses node:Buffer's base64url support — keep this on the Node runtime,
// not Edge. (Edge has WebCrypto / Uint8Array but not Buffer.)
export const runtime = "nodejs";
// The page IS the token. No request-time data to fetch; safe to render
// statically per-token, but force-dynamic keeps things simple and lets us read
// `params` synchronously without ISR cache considerations.
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ token: string }>;
}

const SCORE_ROWS: Array<{ key: keyof SharePayload["scores"]; label: string }> = [
  { key: "convictionClarity", label: "Conviction" },
  { key: "riskAck", label: "Risk Ack" },
  { key: "dataDensity", label: "Data Density" },
  { key: "thesisAlignment", label: "Thesis Fit" },
  { key: "poise", label: "Poise" },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const payload = decodeShareToken(token);
  if (!payload) {
    return {
      title: "IC · SIM — Result",
      description: "Investment Committee simulation result.",
    };
  }
  const title = `${payload.company} — IC Sim ${payload.overall.toFixed(1)}/10`;
  const description =
    payload.summary ||
    `${payload.company} (${payload.sector}) — IC Sim overall score ${payload.overall.toFixed(1)}/10.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ResultPage({ params }: Props) {
  const { token } = await params;
  const payload = decodeShareToken(token);

  if (!payload) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center px-6 gap-5 text-center">
        <div className="mono text-[10px] tracking-[0.3em] uppercase text-neutral">
          IC · SIM
        </div>
        <h1 className="display text-[42px] leading-tight max-w-xl">
          This link doesn&rsquo;t look like a real IC Sim result.
        </h1>
        <p className="text-[14px] text-bone-dim max-w-md leading-relaxed">
          The token couldn&rsquo;t be decoded. It may have been mangled in
          copy-paste, expired, or come from a different product.
        </p>
        <Link href="/" className="btn-solid mt-3">
          Defend your own deal →
        </Link>
      </main>
    );
  }

  const verdict = verdictFromScore(payload.overall);
  const datePretty = new Date(payload.dateISO).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <main className="min-h-dvh px-8 md:px-16 lg:px-24 py-12">
      <header className="flex items-start justify-between border-b hairline pb-10 mb-12">
        <div>
          <div className="mono text-[10px] tracking-[0.3em] uppercase text-neutral mb-5">
            IC · SIM — Shared Result · {datePretty}
          </div>
          <h1 className="display text-[56px] md:text-[64px] leading-[0.95] tracking-tight">
            {payload.company}
          </h1>
          <div className="mt-3 mono text-[11px] tracking-[0.18em] uppercase text-bone-dim">
            {payload.sector}
          </div>
        </div>
        <div className="text-right">
          <div className="mono text-[10px] tracking-[0.24em] uppercase text-neutral mb-2">
            Weighted Score
          </div>
          <div className="display text-[88px] md:text-[96px] leading-none tracking-tight">
            {payload.overall.toFixed(1)}
          </div>
          <div className="mono text-[10px] tracking-[0.2em] uppercase text-neutral mt-1">
            out of 10.0
          </div>
          <div className={`mono text-[10px] tracking-[0.22em] uppercase mt-3 ${verdict.tone}`}>
            {verdict.label}
          </div>
        </div>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-5 gap-0 mb-16 border hairline-strong">
        {SCORE_ROWS.map((row, i) => {
          const score = payload.scores[row.key];
          return (
            <div
              key={row.key}
              className={`p-6 ${i < 4 ? "md:border-r hairline-strong" : ""} border-b md:border-b-0 hairline-strong`}
            >
              <div className="mono text-[9px] tracking-[0.24em] uppercase text-neutral mb-4">
                {String(i + 1).padStart(2, "0")} · {row.label}
              </div>
              <div className="display text-[56px] md:text-[64px] leading-none tracking-tight text-bone">
                {score}
                <span className="text-neutral text-[24px]"> /10</span>
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 mb-16">
        <div>
          <div className="mono text-[10px] tracking-[0.24em] uppercase text-neutral mb-3">
            Summary
          </div>
          <p className="text-[18px] leading-relaxed display italic text-bone">
            {payload.summary || "—"}
          </p>
        </div>
        <div>
          <div className="mono text-[10px] tracking-[0.24em] uppercase text-neutral mb-3">
            Improvement Notes · Next Time
          </div>
          <ol className="space-y-3 text-[14px] text-bone-dim">
            {payload.improvementNotes.map((note, i) => (
              <li key={i} className="flex gap-4 border-t hairline pt-3">
                <span className="mono text-[10px] text-neutral pt-1 w-6 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{note}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t hairline pt-10 flex flex-col items-center gap-4 text-center">
        <div className="mono text-[10px] tracking-[0.3em] uppercase text-neutral">
          Want to be grilled by the same committee?
        </div>
        <h2 className="display text-[32px] leading-tight">
          Defend your own deal &rarr;
        </h2>
        <Link href="/" className="btn-solid mt-2">
          Enter IC Sim
        </Link>
      </section>

      <footer className="mt-20 pt-6 border-t hairline mono text-[10px] tracking-[0.22em] uppercase text-neutral flex items-center justify-between">
        <Link href="/" className="hover:text-bone">
          IC · SIM
        </Link>
        <div>Shared result · stateless</div>
      </footer>
    </main>
  );
}

// Verdict bands from PRD §7 (5-dim rubric is /50; we're rendering /10 weighted,
// so re-derive bands at that scale). 4.2 → would invest; 3.5 → conditions;
// 2.8 → on the fence; below that → pass.
function verdictFromScore(overall: number): { label: string; tone: string } {
  if (overall >= 8.4) return { label: "Would invest", tone: "text-olive" };
  if (overall >= 7.0) return { label: "Invest with conditions", tone: "text-olive" };
  if (overall >= 5.6) return { label: "On the fence", tone: "text-amber" };
  return { label: "Would pass", tone: "text-oxblood" };
}
