import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { QueueService } from "@/services/queue.service";

const rejectSchema = z.object({ reason: z.string().max(240).optional() });

type Params = {
  params: Promise<{ sessionId: string; queueItemId: string }>;
};

export async function POST(request: Request, { params }: Params) {
  const { sessionId, queueItemId } = await params;
  await requireAdmin(sessionId);
  const body = await request.json().catch(() => ({}));
  const parsed = rejectSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid rejection" }, { status: 400 });
  }

  const service = new QueueService();
  const item = await service.reject(sessionId, queueItemId, parsed.data.reason);

  return NextResponse.json({ item });
}
