import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { SessionService } from "@/services/session.service";

const deleteSchema = z.object({ sessionCode: z.string().min(1) });

type Params = { params: Promise<{ sessionId: string }> };

export async function DELETE(request: Request, { params }: Params) {
  const { sessionId } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = deleteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid session" }, { status: 400 });
  }

  await requireAdmin(parsed.data.sessionCode);
  const service = new SessionService();
  await service.deleteInactive(sessionId);

  return NextResponse.json({ ok: true });
}
