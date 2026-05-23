import { NextRequest, NextResponse } from "next/server";
import startupsData from "@/data/startups.json";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sector = searchParams.get("sector");
  const batch = searchParams.get("batch");
  const risk = searchParams.get("risk");
  const search = searchParams.get("search");

  let filtered = [...startupsData];

  if (sector && sector !== "all") {
    filtered = filtered.filter((s) => s.sector === sector);
  }

  if (batch && batch !== "all") {
    filtered = filtered.filter((s) => s.batch === batch);
  }

  if (risk && risk !== "all") {
    filtered = filtered.filter((s) => s.status === risk);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.sector.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }

  return NextResponse.json(filtered);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return NextResponse.json({ message: "Startup created", data: body }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
