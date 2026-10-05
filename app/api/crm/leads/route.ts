import { NextResponse } from "next/server";
import { createLead, listLeads } from "@/lib/crm-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const leads = listLeads({
    status: searchParams.get("status") || undefined,
    source: searchParams.get("source") || undefined,
    q: searchParams.get("q") || undefined,
  });
  return NextResponse.json({ leads });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body?.phone || !body?.name) {
      return NextResponse.json(
        { error: "name and phone are required" },
        { status: 400 }
      );
    }
    const lead = createLead(body);
    return NextResponse.json({ lead }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}
