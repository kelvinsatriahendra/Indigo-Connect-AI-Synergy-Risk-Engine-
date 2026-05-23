import { NextRequest, NextResponse } from "next/server";
import { generateExecutiveSummary } from "@/lib/openrouter";

export async function POST(req: NextRequest) {
  try {
    const { narrativeText } = await req.json();

    if (!narrativeText || typeof narrativeText !== "string") {
      return NextResponse.json(
        { error: "narrativeText is required" },
        { status: 400 }
      );
    }

    const result = await generateExecutiveSummary(narrativeText);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("AI Summary Error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
