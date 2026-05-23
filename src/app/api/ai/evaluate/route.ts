import { NextRequest, NextResponse } from "next/server";
import { evaluateHealthReport } from "@/lib/openrouter";

function mockEvaluate(narrativeText: string) {
  const wordCount = narrativeText.split(" ").length;
  const hasPositiveKeywords = /meningkat|tumbuh|naik|positif|berhasil|untung|cuan/.test(narrativeText.toLowerCase());
  const hasNegativeKeywords = /turun|menurun|risiko|masalah|bug|resign|kehilangan|kesulitan/.test(narrativeText.toLowerCase());

  let healthScore = 50;
  if (hasPositiveKeywords && !hasNegativeKeywords) healthScore = 80;
  else if (hasNegativeKeywords && !hasPositiveKeywords) healthScore = 25;
  else if (hasPositiveKeywords && hasNegativeKeywords) healthScore = 50;
  else if (wordCount > 50) healthScore = 60;

  const riskLabel = healthScore >= 70 ? "HIGH_GROWTH" : healthScore >= 40 ? "STABLE" : "AT_RISK";
  const sentimentScore = hasPositiveKeywords ? 0.75 : hasNegativeKeywords ? 0.3 : 0.5;

  return {
    healthScore,
    riskLabel,
    sentimentScore,
    operationalStatus: wordCount > 100 ? "Operasional berjalan baik" : "Perlu perhatian lebih pada detail laporan",
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
      const result = await evaluateHealthReport(narrativeText);
      return NextResponse.json(result);
    } catch {
      const mockResult = mockEvaluate(narrativeText);
      return NextResponse.json({ ...mockResult, _source: "mock (AI unavailable)" });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("AI Evaluate Error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
