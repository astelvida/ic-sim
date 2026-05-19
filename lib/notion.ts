import { Client, isFullPage } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client";
import type { DealListItem } from "./types";

const DEFAULT_DS_ID = "6abacccb-e24b-46c6-9f9f-6a2a3cfc9a0f";

function dsId() {
  return process.env.NOTION_DEALFLOW_DS_ID ?? DEFAULT_DS_ID;
}

let _client: Client | null = null;
function getClient(): Client {
  if (_client) return _client;
  const auth = process.env.NOTION_TOKEN;
  if (!auth) throw new Error("NOTION_TOKEN is not set");
  _client = new Client({ auth, notionVersion: "2025-09-03" });
  return _client;
}

type Prop = PageObjectResponse["properties"][string];

function getText(prop: Prop | undefined): string {
  if (!prop) return "";
  if (prop.type === "title") return prop.title.map((x) => x.plain_text).join("");
  if (prop.type === "rich_text") return prop.rich_text.map((x) => x.plain_text).join("");
  if (prop.type === "url") return prop.url ?? "";
  return "";
}

function getSelect(prop: Prop | undefined): string {
  if (!prop) return "";
  if (prop.type === "select") return prop.select?.name ?? "";
  return "";
}

function getMultiSelect(prop: Prop | undefined): string[] {
  if (!prop) return [];
  if (prop.type === "multi_select") return prop.multi_select.map((x) => x.name);
  return [];
}

function getNumber(prop: Prop | undefined): number | null {
  if (!prop) return null;
  if (prop.type === "number") return prop.number;
  return null;
}

async function resolveDataSourceId(id: string): Promise<string> {
  const notion = getClient();
  const db = await notion.databases.retrieve({ database_id: id });
  const sources = (db as { data_sources?: Array<{ id: string }> }).data_sources;
  if (!sources?.length) throw new Error(`Notion database ${id} has no data sources`);
  return sources[0].id;
}

export async function listDeals(): Promise<DealListItem[]> {
  const notion = getClient();
  const query = (data_source_id: string) =>
    notion.dataSources.query({
      data_source_id,
      page_size: 40,
      filter: {
        property: "Status",
        select: { does_not_equal: "❌ Pass" },
      },
      sorts: [{ property: "Last Edited At", direction: "descending" }],
    });

  try {
    const res = await query(dsId());
    return res.results.filter(isFullPage).map(mapListItem);
  } catch {
    const fallbackId = await resolveDataSourceId(dsId());
    const res = await query(fallbackId);
    return res.results.filter(isFullPage).map(mapListItem);
  }
}

function mapListItem(page: PageObjectResponse): DealListItem {
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
  const notion = getClient();
  const page = await notion.pages.retrieve({ page_id: pageId });
  if (!isFullPage(page)) throw new Error("Notion returned a partial page object");
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
