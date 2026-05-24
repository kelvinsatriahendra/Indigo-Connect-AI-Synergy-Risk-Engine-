import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "src/data/pipelines.json");

function readPipelines() {
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

function writePipelines(data: unknown) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  let pipelines = readPipelines();

  if (status) {
    pipelines = pipelines.filter((p: { status: string }) => p.status === status);
  }

  return NextResponse.json(pipelines);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { startupId, telkomBuId, matchScore, reason } = body;

    if (!startupId || !telkomBuId) {
      return NextResponse.json({ error: "startupId and telkomBuId are required" }, { status: 400 });
    }

    const pipelines = readPipelines();

    const newPipeline = {
      id: `p${Date.now()}`,
      startupId,
      telkomBuId,
      status: "PIPELINE",
      matchScore: matchScore || 0.5,
      reason: reason || "Sinergi potensial",
      notes: "",
      assignedTo: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    pipelines.push(newPipeline);
    writePipelines(pipelines);

    return NextResponse.json(newPipeline, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, notes, assignedTo } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const pipelines = readPipelines();
    const index = pipelines.findIndex((p: { id: string }) => p.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });
    }

    if (status) pipelines[index].status = status;
    if (notes !== undefined) pipelines[index].notes = notes;
    if (assignedTo !== undefined) pipelines[index].assignedTo = assignedTo;
    pipelines[index].updatedAt = new Date().toISOString();

    writePipelines(pipelines);

    return NextResponse.json(pipelines[index]);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
