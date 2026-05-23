import { NextRequest, NextResponse } from "next/server";
import { evaluateHealthReport } from "@/lib/openrouter";

export async function POST(req: NextRequest) {
  try {
    const { narrativeText } = await req.json();

    if (!narrativeText || typeof narrativeText !== "string") {
      return NextResponse.json(
        { error: "narrativeText is required" },
        { status: 400 }
      );
    }

    const result = await evaluateHealthReport(narrativeText);

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI Evaluate Error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate health report" },
      { status: 500 }
    );
  }
}
