import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AlertType } from "@prisma/client";

function mapAlert(a: any) {
  return {
    id: a.id,
    startupId: a.startupId,
    type: a.alertType,
    message: a.aiSummary || "",
    date: a.sentAt.toISOString(),
    read: a.readAt !== null,
    severity: a.severity,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get("unread") === "true";
  const type = searchParams.get("type");

  let where: any = {};

  if (unreadOnly) {
    where.readAt = null;
  }
  
  if (type) {
    where.alertType = type as AlertType;
  }

  const rawAlerts = await prisma.alertLog.findMany({ where, orderBy: { sentAt: "desc" } });
  const alerts = rawAlerts.map(mapAlert);

  const unreadCount = await prisma.alertLog.count({ where: { readAt: null } });

  return NextResponse.json({ alerts, unreadCount });
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, read } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const alert = await prisma.alertLog.findUnique({ where: { id } });

    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    let updateData: any = {};
    if (read !== undefined) {
      updateData.readAt = read ? new Date() : null;
    }

    const updatedAlert = await prisma.alertLog.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(mapAlert(updatedAlert));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
