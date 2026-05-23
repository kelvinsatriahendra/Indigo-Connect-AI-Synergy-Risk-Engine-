import { NextRequest, NextResponse } from "next/server";
import { matchSynergy } from "@/lib/openrouter";
import telkomBusData from "@/data/telkom-bus.json";

export async function POST(req: NextRequest) {
  try {
    const { narrativeText } = await req.json();

    if (!narrativeText || typeof narrativeText !== "string") {
      return NextResponse.json(
        { error: "narrativeText is required" },
        { status: 400 }
      );
    }

    const telkomBus = telkomBusData.map((bu) => ({
      id: bu.id,
      name: bu.name,
      description: bu.description,
      keywords: bu.keywords as string[],
    }));

    const result = await matchSynergy(narrativeText, telkomBus);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("AI Synergy Error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
