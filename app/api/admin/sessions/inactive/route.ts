import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { SessionService } from "@/services/session.service";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionCode = url.searchParams.get("sessionCode") ?? "";
  await requireAdmin(sessionCode);

  const service = new SessionService();
  const sessions = await service.listInactive();

  return NextResponse.json({ sessions });
}
