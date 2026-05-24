import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "src/data/alerts.json");

function readAlerts() {
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

function writeAlerts(data: unknown) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get("unread") === "true";
  const type = searchParams.get("type");

  let alerts = readAlerts();

  if (unreadOnly) {
    alerts = alerts.filter((a: { read: boolean }) => !a.read);
  }
  if (type) {
    alerts = alerts.filter((a: { type: string }) => a.type === type);
  }

  const unreadCount = readAlerts().filter((a: { read: boolean }) => !a.read).length;

  return NextResponse.json({ alerts, unreadCount });
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, read } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const alerts = readAlerts();
    const index = alerts.findIndex((a: { id: string }) => a.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    if (read !== undefined) {
      alerts[index].read = read;
    }

    writeAlerts(alerts);
    return NextResponse.json(alerts[index]);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
