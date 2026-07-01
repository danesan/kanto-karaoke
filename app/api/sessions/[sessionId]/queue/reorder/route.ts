import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { QueueService } from "@/services/queue.service";

const reorderSchema = z.object({ queueItemIds: z.array(z.string().min(1)) });

type Params = {
  params: Promise<{ sessionId: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const { sessionId } = await params;
  await requireAdmin(sessionId);
  const body = await request.json();
  const parsed = reorderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  }

  const service = new QueueService();
  await service.reorder(sessionId, parsed.data.queueItemIds);

  return NextResponse.json({ ok: true });
}
