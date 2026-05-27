import { NextRequest, NextResponse } from "next/server";
import { matchSynergy } from "@/lib/openrouter";
import { prisma } from "@/lib/prisma";

function mockSynergy(narrativeText: string) {
  const text = narrativeText.toLowerCase();
  const matches = [];

  if (/logistik|pengiriman|rantai pasok|gudang|distribusi/.test(text)) {
    matches.push({ buId: "bu4", reason: "Startup bergerak di bidang logistik, cocok dengan layanan Logee Telkom", matchScore: 0.92 });
  }
  if (/iot|sensor|smart|otomatisasi/.test(text)) {
    matches.push({ buId: "bu5", reason: "Potensi integrasi IoT dengan platform Antares Telkom", matchScore: 0.85 });
  }
  if (/digital|aplikasi|platform|online/.test(text)) {
    matches.push({ buId: "bu1", reason: "Produk digital cocok untuk distribusi melalui jaringan Telkomsel", matchScore: 0.78 });
  }
  if (/pertanian|agri|petani|pangan/.test(text)) {
    matches.push({ buId: "bu4", reason: "Solusi agritech dapat disinergikan dengan Logee untuk distribusi hasil tani", matchScore: 0.88 });
  }
  if (/pendidikan|edukasi|belajar|sekolah/.test(text)) {
    matches.push({ buId: "bu1", reason: "Produk edtech dapat dijangkau melalui infrastruktur digital Telkomsel", matchScore: 0.82 });
  }
  if (/kesehatan|medis|rumah sakit|klinik/.test(text)) {
    matches.push({ buId: "bu5", reason: "Solusi healthtech terintegrasi dengan platform IoT Antares", matchScore: 0.8 });
  }
  if (/keuangan|fintech|pembayaran|bank/.test(text)) {
    matches.push({ buId: "bu6", reason: "Layanan fintech kompatibel dengan infrastruktur cloud Big Box", matchScore: 0.84 });
  }

  if (matches.length === 0) {
    matches.push(
      { buId: "bu7", reason: "Startup potensial untuk program inkubasi Telkom DigiUp", matchScore: 0.75 },
      { buId: "bu1", reason: "Peluang distribusi melalui ekosistem digital Telkomsel", matchScore: 0.7 }
    );
  }

  return { matches: matches.slice(0, 3) };
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
      const dbTelkomBus = await prisma.telkomBU.findMany({
        select: { id: true, name: true, description: true, keywords: true }
      });

      const telkomBus = dbTelkomBus.map((bu) => ({
        id: bu.id,
        name: bu.name,
        description: bu.description || "",
        keywords: (bu.keywords as unknown as string[]) || [],
      }));

      const result = await matchSynergy(narrativeText, telkomBus);
      return NextResponse.json(result);
    } catch {
      const mockResult = mockSynergy(narrativeText);
      return NextResponse.json({ ...mockResult, _source: "mock (AI unavailable)" });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("AI Synergy Error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
