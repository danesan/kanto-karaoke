import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { QueueService } from "@/services/queue.service";

type Params = {
  params: Promise<{
    sessionId: string;
    queueItemId: string;
  }>;
};

const moveSchema = z.object({
  direction: z.enum(["up", "down"])
});

export async function PATCH(request: Request, { params }: Params) {
  const { sessionId, queueItemId } = await params;
  await requireAdmin(sessionId);
  const body = await request.json();
  const parsed = moveSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid direction" }, { status: 400 });
  }

  const service = new QueueService();
  const item = await service.move(queueItemId, parsed.data.direction);

  return NextResponse.json({ item });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { sessionId, queueItemId } = await params;
  await requireAdmin(sessionId);
  const service = new QueueService();
  const item = await service.remove(queueItemId);

  return NextResponse.json({ item });
}