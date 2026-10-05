import { NextResponse } from "next/server";
import { listSessions } from "@/lib/whatsapp-sessions";

export const dynamic = "force-dynamic";

export async function GET() {
  const sessions = listSessions().sort((a, b) => b.updatedAt - a.updatedAt);
  return NextResponse.json({ sessions });
}
