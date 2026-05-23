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
    const message = error instanceof Error ? error.message : String(error);
    console.error("AI Evaluate Error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
