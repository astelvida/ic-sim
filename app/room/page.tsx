"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CommitteeRoom } from "@/components/CommitteeRoom";
import { useSession } from "@/lib/session-context";

export default function RoomPage() {
  const { brief } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!brief) router.replace("/");
  }, [brief, router]);

  if (!brief) {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <div className="mono text-[11px] tracking-[0.2em] uppercase text-neutral">
          Redirecting…
        </div>
      </main>
    );
  }
  return <CommitteeRoom />;
}
