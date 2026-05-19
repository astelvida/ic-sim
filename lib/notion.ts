import type { DealListItem } from "./types";

const NOTION_VERSION = "2022-06-28";
const DEFAULT_DS_ID = "6abacccb-e24b-46c6-9f9f-6a2a3cfc9a0f";

function dsId() {
  return process.env.NOTION_DEALFLOW_DS_ID ?? DEFAULT_DS_ID;
}

function authHeaders() {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error("NOTION_TOKEN is not set");
  return {
    Authorization: `Bearer ${token}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

type NotionProp = Record<string, unknown>;

function getText(prop: NotionProp | undefined): string {
  if (!prop) return "";
  const t = prop as { type?: string } & Record<string, unknown>;
  if (t.type === "title" && Array.isArray(t.title)) {
    return (t.title as Array<{ plain_text: string }>).map((x) => x.plain_text).join("");
  }
  if (t.type === "rich_text" && Array.isArray(t.rich_text)) {
    return (t.rich_text as Array<{ plain_text: string }>).map((x) => x.plain_text).join("");
  }
  if (t.type === "url" && typeof t.url === "string") return t.url;
  return "";
}

function getSelect(prop: NotionProp | undefined): string {
  if (!prop) return "";
  const t = prop as { type?: string; select?: { name?: string } | null };
  if (t.type === "select" && t.select?.name) return t.select.name;
  return "";
}

function getMultiSelect(prop: NotionProp | undefined): string[] {
  if (!prop) return [];
  const t = prop as { type?: string; multi_select?: Array<{ name: string }> };
  if (t.type === "multi_select" && Array.isArray(t.multi_select)) {
    return t.multi_select.map((x) => x.name);
  }
  return [];
}

function getNumber(prop: NotionProp | undefined): number | null {
  if (!prop) return null;
  const t = prop as { type?: string; number?: number | null };
  if (t.type === "number" && typeof t.number === "number") return t.number;
  return null;
}

export async function listDeals(): Promise<DealListItem[]> {
  const res = await fetch(`https://api.notion.com/v1/data_sources/${dsId()}/query`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      page_size: 40,
      filter: {
        property: "Status",
        select: { does_not_equal: "❌ Pass" },
      },
      sorts: [{ property: "Last Edited At", direction: "descending" }],
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    // fallback for workspaces still on the pages API
    const legacy = await fetch(`https://api.notion.com/v1/databases/${dsId()}/query`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        page_size: 40,
        sorts: [{ property: "Last Edited At", direction: "descending" }],
      }),
      cache: "no-store",
    });
    if (!legacy.ok) {
      const text = await legacy.text();
      throw new Error(`Notion list failed: ${legacy.status} ${text}`);
    }
    const data = (await legacy.json()) as { results: Array<{ id: string; properties: Record<string, NotionProp> }> };
    return data.results.map(mapListItem);
  }
  const data = (await res.json()) as { results: Array<{ id: string; properties: Record<string, NotionProp> }> };
  return data.results.map(mapListItem);
}

function mapListItem(page: { id: string; properties: Record<string, NotionProp> }): DealListItem {
  const p = page.properties;
  return {
    id: page.id,
    company: getText(p["Company"]) || "Untitled",
    oneLiner: getText(p["One-liner"]),
    sector: getSelect(p["Sector"]),
    stage: getSelect(p["Stage"]),
    ssiScore: getNumber(p["SSI Score"]),
    signalTier: getSelect(p["Signal Tier"]),
    priority: getSelect(p["Priority"]),
    status: getSelect(p["Status"]),
  };
}

export async function fetchDeal(pageId: string): Promise<Record<string, unknown>> {
  const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Notion page fetch failed: ${res.status}`);
  const page = (await res.json()) as { properties: Record<string, NotionProp> };
  const p = page.properties;
  return {
    Company: getText(p["Company"]),
    "One-liner": getText(p["One-liner"]),
    Sector: getSelect(p["Sector"]),
    Stage: getSelect(p["Stage"]),
    Thesis: getMultiSelect(p["Thesis"]),
    "SSI Score": getNumber(p["SSI Score"]),
    "Regulatory Embeddedness": getNumber(p["Regulatory Embeddedness"]),
    Headcount: getNumber(p["Headcount"]),
    Founded: getNumber(p["Founded"]),
    HQ: getText(p["HQ"]),
    Domain: getText(p["Domain"]),
    Website: getText(p["Website"]),
    "LinkedIn URL": getText(p["LinkedIn URL"]),
    "Founding Team": getText(p["Founding Team"]),
    "Key Customers": getText(p["Key Customers"]),
    "Key Investors": getText(p["Key Investors"]),
    "Last Raise": getText(p["Last Raise"]),
    Competitors: getText(p["Competitors"]),
    "Key Signal 30d": getText(p["Key Signal 30d"]),
    "Kill Criteria": getText(p["Kill Criteria"]),
    "Why Interesting": getText(p["Why Interesting"]),
    "Signal Tier": getSelect(p["Signal Tier"]),
    Priority: getSelect(p["Priority"]),
    Status: getSelect(p["Status"]),
  };
}
