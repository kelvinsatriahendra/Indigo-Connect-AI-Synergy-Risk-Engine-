import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StartupStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sector = searchParams.get("sector");
  const batch = searchParams.get("batch");
  const risk = searchParams.get("risk");
  const search = searchParams.get("search");

  let where: any = {};

  if (sector && sector !== "all") {
    where.sector = sector;
  }

  if (batch && batch !== "all") {
    where.batch = batch;
  }

  if (risk && risk !== "all") {
    where.status = risk as StartupStatus;
  }

  if (search) {
    const q = search.toLowerCase();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { sector: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const startups = await prisma.startup.findMany({ where });
  return NextResponse.json(startups);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newStartup = await prisma.startup.create({
      data: {
        id: body.id,
        name: body.name,
        founderName: body.founderName,
        sector: body.sector,
        batch: body.batch,
        description: body.description,
        status: body.status || StartupStatus.ACTIVE,
      },
    });
    return NextResponse.json({ message: "Startup created", data: newStartup }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body or creation failed" }, { status: 400 });
  }
}
