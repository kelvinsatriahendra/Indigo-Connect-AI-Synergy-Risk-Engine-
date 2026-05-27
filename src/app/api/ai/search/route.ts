import { NextRequest, NextResponse } from "next/server";
import { searchByNaturalLanguage } from "@/lib/openrouter";
import { prisma } from "@/lib/prisma";

async function mockSearch(query: string) {
  const q = query.toLowerCase();
  const startups = await prisma.startup.findMany();
  const results = startups.filter((s) => {
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
      const rawStartups = await prisma.startup.findMany({
        select: { id: true, name: true, sector: true, description: true, batch: true },
      });

      const dbStartups = rawStartups.map(s => ({
        ...s,
        description: s.description || ""
      }));

      const result = await searchByNaturalLanguage(query, dbStartups);
      return NextResponse.json(result);
    } catch {
      const mockResult = await mockSearch(query);
      return NextResponse.json({ ...mockResult, _source: "mock" });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
