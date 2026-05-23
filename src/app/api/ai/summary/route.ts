import { NextRequest, NextResponse } from "next/server";
import { generateExecutiveSummary } from "@/lib/openrouter";

function mockSummary(narrativeText: string) {
  const words = narrativeText.split(" ");
  const pendapatan = /pendapatan|revenue|omzet/.test(narrativeText.toLowerCase()) ? "Pendapatan menunjukkan tren positif" : "Kondisi keuangan stabil";
  const tim = /tim|karyawan|engineer|staff/.test(narrativeText.toLowerCase()) ? "Tim dalam kondisi solid dan produktif" : "Sumber daya manusia mencukupi untuk operasional";
  const target = /target|capaian|goal/.test(narrativeText.toLowerCase()) ? "Target bulanan tercapai sesuai rencana" : "Fokus pada pencapaian target jangka pendek";

  return {
    point1: pendapatan,
    point2: tim,
    point3: target,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { narrativeText } = await req.json();

    if (!narrativeText || typeof narrativeText !== "string") {
      return NextResponse.json(
        { error: "narrativeText is required" },
        { status: 400 }
      );
    }

    try {
      const result = await generateExecutiveSummary(narrativeText);
      return NextResponse.json(result);
    } catch {
      const mockResult = mockSummary(narrativeText);
      return NextResponse.json({ ...mockResult, _source: "mock (AI unavailable)" });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("AI Summary Error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
