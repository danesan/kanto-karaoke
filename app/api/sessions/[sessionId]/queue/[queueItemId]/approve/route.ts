import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { QueueService } from "@/services/queue.service";

type Params = {
  params: Promise<{ sessionId: string; queueItemId: string }>;
};

export async function POST(_request: Request, { params }: Params) {
  const { sessionId, queueItemId } = await params;
  await requireAdmin(sessionId);

  const service = new QueueService();
  const item = await service.approve(sessionId, queueItemId);

  return NextResponse.json({ item });
}
