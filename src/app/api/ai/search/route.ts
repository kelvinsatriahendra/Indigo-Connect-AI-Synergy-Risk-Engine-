import { NextRequest, NextResponse } from "next/server";
import { searchByNaturalLanguage } from "@/lib/openrouter";
import startupsData from "@/data/startups.json";

function mockSearch(query: string) {
  const q = query.toLowerCase();
  const results = startupsData.filter((s) => {
    const searchText = `${s.name} ${s.sector} ${s.description} ${s.batch} ${s.founderName} ${s.status}`.toLowerCase();
    const terms = q.split(/\s+/);
    return terms.some((t) => searchText.includes(t));
  });
  return { filteredIds: results.map((s) => s.id) };
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    try {
      const startups = startupsData.map((s) => ({
        id: s.id,
        name: s.name,
        sector: s.sector,
        description: s.description,
        batch: s.batch,
      }));

      const result = await searchByNaturalLanguage(query, startups);
      return NextResponse.json(result);
    } catch {
      const mockResult = mockSearch(query);
      return NextResponse.json({ ...mockResult, _source: "mock" });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
