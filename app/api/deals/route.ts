import { NextResponse } from "next/server";
import { listDeals, fetchDeal } from "@/lib/notion";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  try {
    if (id) {
      const deal = await fetchDeal(id);
      return NextResponse.json({ deal });
    }
    const deals = await listDeals();
    return NextResponse.json({ deals });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
