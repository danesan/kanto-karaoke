import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { SessionService } from "@/services/session.service";

type Params = {
  params: Promise<{ sessionId: string }>;
};

const settingsSchema = z.object({
  maxPendingPerParticipant: z.number().int().min(0).max(20).optional(),
  maxWaitingPerParticipant: z.number().int().min(0).max(20).optional(),
  allowDuplicates: z.boolean().optional(),
  moderationEnabled: z.boolean().optional()
});

export async function GET(_request: Request, { params }: Params) {
  const { sessionId } = await params;
  const service = new SessionService();
  const session = (await service.get(sessionId)) ?? (await service.getByCode(sessionId));

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({ session });
}

export async function PATCH(request: Request, { params }: Params) {
  const { sessionId } = await params;
  await requireAdmin(sessionId);
  const body = await request.json();
  const parsed = settingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid settings" }, { status: 400 });
  }

  const service = new SessionService();
  const session = await service.updateSettings(sessionId, parsed.data);

  return NextResponse.json({ session });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { sessionId } = await params;
  await requireAdmin(sessionId);

  const service = new SessionService();
  const session = await service.close(sessionId);

  return NextResponse.json({ session });
}

