import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const dbTelkomBus = await prisma.telkomBU.findMany();
    const telkomBus = dbTelkomBus.map((bu) => ({
      id: bu.id,
      name: bu.name,
      description: bu.description,
      keywords: (bu.keywords as unknown as string[]) || [],
    }));
    return NextResponse.json(telkomBus);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
