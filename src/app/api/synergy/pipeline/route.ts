import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PipelineStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  let where: any /* eslint-disable-line @typescript-eslint/no-explicit-any */ = {};
  if (status) {
    where.status = status as PipelineStatus;
  }

  const pipelines = await prisma.synergyPipeline.findMany({ where, orderBy: { createdAt: "desc" } });
  return NextResponse.json(pipelines);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { startupId, telkomBuId, matchScore, reason } = body;

    if (!startupId || !telkomBuId) {
      return NextResponse.json({ error: "startupId and telkomBuId are required" }, { status: 400 });
    }

    const newPipeline = await prisma.synergyPipeline.create({
      data: {
        startupId,
        telkomBuId,
        status: PipelineStatus.PIPELINE,
        notes: "",
      },
    });

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

    const existing = await prisma.synergyPipeline.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });
    }

    let updateData: any /* eslint-disable-line @typescript-eslint/no-explicit-any */ = {};
    if (status) updateData.status = status as PipelineStatus;
    if (notes !== undefined) updateData.notes = notes;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

    const updated = await prisma.synergyPipeline.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
