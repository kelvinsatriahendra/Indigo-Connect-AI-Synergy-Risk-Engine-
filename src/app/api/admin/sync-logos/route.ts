import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLogoForName } from "@/lib/logos";

export async function GET(request: Request) {
  try {
    let startupsUpdated = 0;
    let busUpdated = 0;

    // 1. Sync Startups
    const startups = await prisma.startup.findMany();
    for (const startup of startups) {
      const logoUrl = getLogoForName(startup.name);
      if (logoUrl && startup.logoUrl !== logoUrl) {
        await prisma.startup.update({
          where: { id: startup.id },
          data: { logoUrl },
        });
        startupsUpdated++;
      }
    }

    // 2. Sync Telkom BUs
    const bus = await prisma.telkomBU.findMany();
    for (const bu of bus) {
      const logoUrl = getLogoForName(bu.name);
      if (logoUrl && bu.logoUrl !== logoUrl) {
        await prisma.telkomBU.update({
          where: { id: bu.id },
          data: { logoUrl },
        });
        busUpdated++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Berhasil melakukan sinkronisasi logo ke database real!",
      details: {
        startupsUpdated,
        telkomBusUpdated: busUpdated,
      },
    });
  } catch (error: any) {
    console.error("Sync Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
