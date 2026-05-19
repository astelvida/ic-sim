"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CommitteeRoom } from "@/components/CommitteeRoom";
import { useSession } from "@/lib/session-context";

export default function RoomPage() {
  const { brief, hydrated } = useSession();
  const router = useRouter();

  // Only act on `brief` after the session has hydrated from sessionStorage.
  // Without this gate, the redirect would fire during the pre-hydration window
  // even when a session is about to be restored.
  useEffect(() => {
    if (hydrated && !brief) router.replace("/");
  }, [brief, hydrated, router]);

  if (!hydrated || !brief) {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <div className="mono text-[11px] tracking-[0.2em] uppercase text-neutral">
          {hydrated ? "Redirecting…" : "Restoring session…"}
        </div>
      </main>
    );
  }
  return <CommitteeRoom />;
}
